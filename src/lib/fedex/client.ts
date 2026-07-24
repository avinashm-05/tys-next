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
 */
export class FedExClient implements FedExRequester {
  private cfg = fedexConfig();

  async getToken(): Promise<string> {
    const cached = await cacheGet<string>(this.cfg.tokenCacheKey);
    if (cached) return cached;
    return this.fetchAndCacheToken();
  }

  async refreshToken(): Promise<string> {
    return this.fetchAndCacheToken();
  }

  async clearToken(): Promise<void> {
    await cacheDelete(this.cfg.tokenCacheKey);
  }

  private async fetchAndCacheToken(): Promise<string> {
    // Single-flight: only one concurrent refresh actually hits FedEx.
    return withLock(`${this.cfg.tokenCacheKey}:lock`, 20, async () => {
      const existing = await cacheGet<string>(this.cfg.tokenCacheKey);
      if (existing) return existing;

      const res = await fetch(`${this.cfg.baseUrl}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: this.cfg.clientId,
          client_secret: this.cfg.clientSecret,
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
      await cacheSet(this.cfg.tokenCacheKey, data.access_token, ttl);
      return data.access_token;
    });
  }

  async request(
    method: string,
    endpoint: string,
    payload: Record<string, unknown> = {},
    headers: Record<string, string> = {},
  ): Promise<Record<string, unknown>> {
    let res = await this.send(method, endpoint, payload, await this.getToken(), headers);

    if (await this.isUnauthorized(res)) {
      await this.clearToken();
      res = await this.send(method, endpoint, payload, await this.refreshToken(), headers);
    }

    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      throw new FedExError("FedEx API request failed", res.status, body);
    }
    return body;
  }

  private send(
    method: string,
    endpoint: string,
    payload: Record<string, unknown>,
    token: string,
    headers: Record<string, string>,
  ): Promise<Response> {
    const url = `${this.cfg.baseUrl.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;
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
