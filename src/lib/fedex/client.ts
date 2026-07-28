import { cacheDelete, cacheGet, cacheSet, withLock } from "@/lib/cache";
import { fedexConfig } from "./config";

/** Typed error carrying the FedEx HTTP status + parsed error body. */
export class FedExError extends Error {
  constructor(
    message: string,
    public httpStatus: number = 0,
    public errorBody: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "FedExError";
  }
}

const REQUEST_TIMEOUT_MS = 15_000;
// A sandbox 503 can mean either a sub-second blip (an immediate retry
// succeeded in testing) or a sustained multi-minute outage (a fresh retry
// still failed identically after several minutes) — there's no way to tell
// which from inside one request. One quick retry catches the blip case
// without making the sustained case wait multiple × 13s for an outcome more
// attempts can't change.
const RETRYABLE_ATTEMPTS = 2; // 1 initial + 1 retry
const RETRY_BACKOFF_MS = 500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type FedExErrorRow = { code?: string; message?: string };

/** Minimal contract the rate service depends on — lets tests inject a fake. */
export interface FedExRequester {
  request(
    method: string,
    endpoint: string,
    payload?: Record<string, unknown>,
    headers?: Record<string, string>,
  ): Promise<Record<string, unknown>>;
}

/**
 * Port of App\Services\FedEx\{FedExClient, FedExClientAuth}.
 * OAuth token is cached (TTL = expires_in − 60s buffer); a single-flight lock
 * prevents a token stampede. Requests auto-retry ONCE on HTTP 401 or the
 * NOT.AUTHORIZED.ERROR code with a freshly-fetched token, then throw.
 *
 * FedEx's sandbox is documented to intermittently return 5xx
 * (SERVICE.UNAVAILABLE.ERROR and friends) under otherwise-valid requests —
 * confirmed directly both ways: the exact same payload failed via the app
 * then succeeded seconds later via a standalone curl (a blip), and separately
 * failed identically via the app and a fresh standalone curl minutes apart (a
 * sustained outage — retrying doesn't help there). Requests get one quick
 * retry on a 5xx to catch the blip case without piling multiple × ~13s
 * waits onto the sustained case; 4xx (real validation errors) never retries.
 */
/** Lets a caller point this client at a different FedEx project's keys —
 * e.g. Track uses its own project/credentials, separate from Rate's.
 * `baseUrl` lets one project sit on production (apis.fedex.com) while
 * another stays on sandbox — Rate and Track each have their own production
 * project, entitled and cut over independently of each other. */
export type FedExCredentials = {
  clientId: string;
  clientSecret: string;
  tokenCacheKey: string;
  baseUrl?: string;
};

export class FedExClient implements FedExRequester {
  private cfg = fedexConfig();
  private creds: FedExCredentials;

  constructor(credentials?: FedExCredentials) {
    this.creds = credentials ?? {
      clientId: this.cfg.clientId,
      clientSecret: this.cfg.clientSecret,
      tokenCacheKey: this.cfg.tokenCacheKey,
      baseUrl: this.cfg.baseUrl,
    };
  }

  async getToken(): Promise<string> {
    const cached = await cacheGet<string>(this.creds.tokenCacheKey);
    if (cached) return cached;
    return this.fetchAndCacheToken();
  }

  async refreshToken(): Promise<string> {
    return this.fetchAndCacheToken();
  }

  async clearToken(): Promise<void> {
    await cacheDelete(this.creds.tokenCacheKey);
  }

  private async fetchAndCacheToken(): Promise<string> {
    // Single-flight: only one concurrent refresh actually hits FedEx.
    return withLock(`${this.creds.tokenCacheKey}:lock`, 20, async () => {
      const existing = await cacheGet<string>(this.creds.tokenCacheKey);
      if (existing) return existing;

      const res = await fetch(`${this.creds.baseUrl ?? this.cfg.baseUrl}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: this.creds.clientId,
          client_secret: this.creds.clientSecret,
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      const data = (await res.json().catch(() => ({}))) as {
        access_token?: string;
        expires_in?: number;
      };

      if (!res.ok) {
        throw new FedExError("FedEx OAuth token request failed", res.status, data);
      }
      if (!data.access_token) {
        throw new FedExError("FedEx OAuth response missing access_token", res.status, data);
      }

      const expiresIn = Number(data.expires_in ?? 3600);
      const ttl = Math.max(1, expiresIn - this.cfg.tokenTtlBuffer);
      await cacheSet(this.creds.tokenCacheKey, data.access_token, ttl);
      return data.access_token;
    });
  }

  async request(
    method: string,
    endpoint: string,
    payload: Record<string, unknown> = {},
    headers: Record<string, string> = {},
  ): Promise<Record<string, unknown>> {
    for (let attempt = 1; attempt <= RETRYABLE_ATTEMPTS; attempt++) {
      let res = await this.send(method, endpoint, payload, await this.getToken(), headers);

      if (await this.isUnauthorized(res)) {
        await this.clearToken();
        res = await this.send(method, endpoint, payload, await this.refreshToken(), headers);
      }

      const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (res.ok) return body;

      const error = new FedExError("FedEx API request failed", res.status, body);
      const canRetry = res.status >= 500 && attempt < RETRYABLE_ATTEMPTS;
      if (!canRetry) throw error;
      await sleep(RETRY_BACKOFF_MS * attempt);
    }
    throw new FedExError("FedEx API request failed", 0, {});
  }

  private send(
    method: string,
    endpoint: string,
    payload: Record<string, unknown>,
    token: string,
    headers: Record<string, string>,
  ): Promise<Response> {
    const base = this.creds.baseUrl ?? this.cfg.baseUrl;
    const url = `${base.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;
    return fetch(url, {
      method: method.toUpperCase(),
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        ...headers,
      },
      body: method.toUpperCase() === "GET" ? undefined : JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  }

  // 401, or any error row with code NOT.AUTHORIZED.ERROR. Clones so the body
  // can still be read by the caller afterwards.
  private async isUnauthorized(res: Response): Promise<boolean> {
    if (res.status === 401) return true;
    const body = (await res
      .clone()
      .json()
      .catch(() => ({}))) as { errors?: FedExErrorRow[] };
    return (body.errors ?? []).some((e) => e?.code === "NOT.AUTHORIZED.ERROR");
  }
}
