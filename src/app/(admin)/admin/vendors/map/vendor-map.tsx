"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { toast } from "sonner";
import { adminApi, ApiError } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Self-contained marker icon: Leaflet's default icon images don't resolve
// under Turbopack, so the pin is an inline SVG in a divIcon — no image files,
// no CDN. Brand navy teardrop with an orange center dot; the anchor puts the
// pin tip on the coordinate and the popup just above the pin head.
const VENDOR_PIN = L.divIcon({
  className: "", // suppress the default leaflet-div-icon white box
  html:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36" aria-hidden="true">' +
    '<path fill="#16294e" stroke="#ffffff" stroke-width="1" d="M12 .5C5.6.5.5 5.6.5 12c0 8.8 11.5 23 11.5 23s11.5-14.2 11.5-23C23.5 5.6 18.4.5 12 .5z"/>' +
    '<circle cx="12" cy="12" r="4.5" fill="#f26a21"/>' +
    "</svg>",
  iconSize: [24, 36],
  iconAnchor: [12, 36],
  popupAnchor: [0, -32],
});

// The dropped search pin (pincode/address search) gets its own red teardrop
// — same shape/size as VENDOR_PIN so it reads as "a pin", but a color no
// vendor marker ever uses, so it's unambiguous which one is "where you
// searched" versus "a vendor" once there are a dozen navy pins clustered
// around it.
const SEARCH_PIN = L.divIcon({
  className: "",
  html:
    '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="39" viewBox="0 0 24 36" aria-hidden="true">' +
    '<path fill="#dc2626" stroke="#ffffff" stroke-width="1" d="M12 .5C5.6.5.5 5.6.5 12c0 8.8 11.5 23 11.5 23s11.5-14.2 11.5-23C23.5 5.6 18.4.5 12 .5z"/>' +
    '<circle cx="12" cy="12" r="4.5" fill="#ffffff"/>' +
    "</svg>",
  iconSize: [26, 39],
  iconAnchor: [13, 39],
  popupAnchor: [0, -35],
});

type MapVendor = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  vendorType: string;
  distance?: number;
};

type Bootstrap = {
  vendorTypes: { id: number; name: string }[];
  notMapped: number;
  defaultBounds: {
    center: { lat: number; lng: number };
    zoom: number | null;
    bounds: { sw: { lat: number; lng: number }; ne: { lat: number; lng: number } } | null;
  };
};

type VendorDetails = MapVendor & { edit_url: string; email: string; phone: string };

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Clustered markers (maxClusterRadius 50, spiderfy — like Laravel's map). */
function ClusterLayer({ vendors, distanceUnit }: { vendors: MapVendor[]; distanceUnit: "miles" | "kilometers" }) {
  const map = useMap();
  useEffect(() => {
    const group = L.markerClusterGroup({ maxClusterRadius: 50, spiderfyOnMaxZoom: true });
    for (const v of vendors) {
      // alt/title carry the vendor name — never the default "Marker" text.
      const marker = L.marker([v.latitude, v.longitude], {
        icon: VENDOR_PIN,
        alt: v.name,
        title: v.name,
      });
      // v.distance only exists after a radius/pincode search (the API only
      // computes it relative to that search point — plain pan/zoom bounds
      // fetches never do) — omit the line entirely rather than show a
      // meaningless distance for a bounds-only view.
      const distanceLine =
        v.distance != null
          ? `<br><span style="color:#dc2626">${v.distance} ${distanceUnit === "miles" ? "mi" : "km"} from search pin</span>`
          : "";
      marker.bindPopup("Loading…", { minWidth: 200 });
      marker.on("popupopen", async () => {
        try {
          const d = await adminApi<VendorDetails>(`/api/admin/vendors/${v.id}/map-details`);
          marker.setPopupContent(
            `<strong>${escapeHtml(d.name)}</strong><br>` +
              `${escapeHtml(d.vendorType)} &middot; ${escapeHtml(d.status)}` +
              distanceLine +
              `<br><span style="color:#6b7280">${escapeHtml(d.email)}</span>` +
              `<br><span style="color:#6b7280">${escapeHtml(d.phone)}</span>` +
              `<br><a href="${d.edit_url}">Edit vendor</a>`,
          );
        } catch {
          marker.setPopupContent("Couldn't load vendor details.");
        }
      });
      group.addLayer(marker);
    }
    map.addLayer(group);
    return () => {
      map.removeLayer(group);
    };
  }, [vendors, map, distanceUnit]);
  return null;
}

/** Debounced moveend → bounds refresh (300ms, like the Blade map). */
function BoundsWatcher({
  onBounds,
  suspended,
}: {
  onBounds: (b: L.LatLngBounds) => void;
  suspended: boolean;
}) {
  const map = useMap();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suspendedRef = useRef(suspended);
  useEffect(() => {
    suspendedRef.current = suspended;
  }, [suspended]);

  useMapEvents({
    moveend: () => {
      if (suspendedRef.current) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => onBounds(map.getBounds()), 300);
    },
  });

  useEffect(() => {
    onBounds(map.getBounds()); // initial load
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export function VendorMap() {
  const [bootstrap, setBootstrap] = useState<Bootstrap | null>(null);
  const [vendors, setVendors] = useState<MapVendor[]>([]);
  const [status, setStatus] = useState("all");
  const [typeId, setTypeId] = useState("all");
  const [radius, setRadius] = useState("25");
  const [unit, setUnit] = useState<"miles" | "kilometers">("miles");
  const [circle, setCircle] = useState<{ lat: number; lng: number; meters: number } | null>(null);
  const [addressPin, setAddressPin] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MapVendor[]>([]);
  const [busy, setBusy] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  // Filters live in a ref too so BoundsWatcher's debounced callback sees
  // current values without re-subscribing map events.
  const filtersRef = useRef({ status, typeId });
  useEffect(() => {
    filtersRef.current = { status, typeId };
  }, [status, typeId]);

  useEffect(() => {
    adminApi<Bootstrap>("/api/admin/vendors/map/bootstrap")
      .then(setBootstrap)
      .catch(() => toast.error("Couldn't load the map. Refresh the page."));
  }, []);

  async function fetchInBounds(b: L.LatLngBounds) {
    const { status, typeId } = filtersRef.current;
    try {
      const res = await adminApi<{ vendors: MapVendor[] }>("/api/admin/vendors/map/bounds", {
        method: "POST",
        body: JSON.stringify({
          bounds: {
            sw: { lat: b.getSouthWest().lat, lng: b.getSouthWest().lng },
            ne: { lat: b.getNorthEast().lat, lng: b.getNorthEast().lng },
          },
          status,
          ...(typeId !== "all" ? { vendor_type_id: Number(typeId) } : {}),
        }),
      });
      setVendors(res.vendors);
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 429)) {
        toast.error("Couldn't load vendors for this area.");
      }
    }
  }

  function refreshFromMap() {
    const map = mapRef.current;
    if (map) void fetchInBounds(map.getBounds());
  }

  // Shared by both the manual "Search radius" button (centered on wherever
  // the map's been panned to) and the pincode search below (centered on the
  // geocoded point directly — NOT map.getCenter(), which wouldn't yet
  // reflect an in-flight flyTo animation).
  async function runRadiusSearchAt(lat: number, lng: number) {
    const map = mapRef.current;
    setBusy(true);
    try {
      const res = await adminApi<{ vendors: MapVendor[] }>("/api/admin/vendors/map/radius", {
        method: "POST",
        body: JSON.stringify({
          lat,
          lng,
          radius: Number(radius),
          unit,
          status: filtersRef.current.status,
          ...(filtersRef.current.typeId !== "all"
            ? { vendor_type_id: Number(filtersRef.current.typeId) }
            : {}),
        }),
      });
      setVendors(res.vendors);
      const meters = Number(radius) * (unit === "miles" ? 1609.34 : 1000);
      // ponytail: radius mode suspends the moveend refresh until cleared —
      // otherwise the next pan silently replaces the radius results.
      setCircle({ lat, lng, meters });
      map?.fitBounds(L.latLng(lat, lng).toBounds(meters * 2), { padding: [24, 24] });
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "The radius search failed.");
    } finally {
      setBusy(false);
    }
  }

  function runRadiusSearch() {
    const center = mapRef.current?.getCenter();
    if (!center) return;
    void runRadiusSearchAt(center.lat, center.lng);
  }

  function clearRadius() {
    setCircle(null);
    refreshFromMap();
  }

  // Name autocomplete (min 2 chars, debounced). All setState happens inside
  // the timeout — never synchronously in the effect body.
  useEffect(() => {
    const t = setTimeout(() => {
      const term = nameQuery.trim();
      if (term.length < 2) {
        setSuggestions([]);
        return;
      }
      adminApi<{ vendors: MapVendor[] }>("/api/admin/vendors/map/search", {
        method: "POST",
        body: JSON.stringify({ query: term }),
      })
        .then((res) => setSuggestions(res.vendors))
        .catch(() => setSuggestions([]));
    }, 300);
    return () => clearTimeout(t);
  }, [nameQuery]);

  function flyToVendor(v: MapVendor) {
    setSuggestions([]);
    setNameQuery(v.name);
    mapRef.current?.flyTo([v.latitude, v.longitude], 15);
  }

  // One action for "type a pincode, see every vendor within N miles of it" —
  // previously this only recentered the map, leaving the vendor filtering as
  // a separate "Search radius" click most people would never find.
  async function runPincodeSearch() {
    if (!address.trim()) return;
    setBusy(true);
    try {
      const geo = await adminApi<{ latitude: number; longitude: number }>("/api/admin/geocode", {
        method: "POST",
        body: JSON.stringify({ address: address.trim() }),
      });
      setAddressPin({ lat: geo.latitude, lng: geo.longitude });
      await runRadiusSearchAt(geo.latitude, geo.longitude);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "The pincode search failed.");
      setBusy(false);
    }
  }

  if (!bootstrap) {
    return (
      <div className="flex h-[32rem] items-center justify-center rounded-md border text-sm text-muted-foreground">
        Loading map…
      </div>
    );
  }

  const noGeocodedVendors = bootstrap.defaultBounds.bounds === null;
  const db = bootstrap.defaultBounds;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="relative">
          <Input
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            placeholder="Find vendor by name…"
            className="w-56"
            aria-label="Find vendor by name"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-[1000] mt-1 w-full border bg-background shadow-md">
              {suggestions.map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    className="w-full px-2.5 py-1.5 text-left text-xs hover:bg-accent"
                    onClick={() => flyToVendor(v)}
                  >
                    {v.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runPincodeSearch()}
          placeholder="Pincode or address…"
          className="w-56"
          aria-label="Search by pincode or address"
        />
        <Button variant="outline" onClick={runPincodeSearch} disabled={busy}>
          Search
        </Button>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setCircle(null);
            setTimeout(refreshFromMap, 0);
          }}
        >
          <SelectTrigger className="w-36" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={typeId}
          onValueChange={(v) => {
            setTypeId(v);
            setCircle(null);
            setTimeout(refreshFromMap, 0);
          }}
        >
          <SelectTrigger className="w-44" aria-label="Filter by vendor type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {bootstrap.vendorTypes.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-end gap-2">
          <Input
            type="number"
            min={0.1}
            max={500}
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="w-20"
            aria-label="Radius"
          />
          <Select value={unit} onValueChange={(v) => setUnit(v as "miles" | "kilometers")}>
            <SelectTrigger className="w-32" aria-label="Radius unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="miles">Miles</SelectItem>
              <SelectItem value="kilometers">Kilometers</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={runRadiusSearch} disabled={busy}>
            Search this area
          </Button>
          {circle && (
            <Button variant="ghost" onClick={clearRadius}>
              Clear radius
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {vendors.length} vendor{vendors.length === 1 ? "" : "s"}
        {circle ? " within the radius" : " in view"}
        {bootstrap.notMapped > 0 &&
          ` · ${bootstrap.notMapped} vendor${bootstrap.notMapped === 1 ? "" : "s"} without coordinates can't appear on the map`}
      </p>

      {noGeocodedVendors && (
        <div className="rounded-md border border-tys-mist bg-muted/40 p-4 text-sm text-muted-foreground">
          No geocoded vendors yet. Vendors are placed on the map automatically once saved with a
          findable address.
        </div>
      )}

      {/* isolate: Leaflet's panes use z-index 400-1000, which otherwise
          sit above the sidebar's hover labels (they were cut off at "Ven"). */}
      <div className="isolate h-[32rem] overflow-hidden rounded-md border">
        <MapContainer
          ref={mapRef}
          {...(db.bounds
            ? {
                bounds: L.latLngBounds(
                  [db.bounds.sw.lat, db.bounds.sw.lng],
                  [db.bounds.ne.lat, db.bounds.ne.lng],
                ),
                boundsOptions: { padding: [48, 48], maxZoom: 13 },
              }
            : { center: [db.center.lat, db.center.lng] as [number, number], zoom: db.zoom ?? 4 })}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <BoundsWatcher onBounds={fetchInBounds} suspended={circle !== null} />
          <ClusterLayer vendors={vendors} distanceUnit={unit} />
          {circle && (
            <Circle
              center={[circle.lat, circle.lng]}
              radius={circle.meters}
              pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 0.08, weight: 1.5 }}
            />
          )}
          {addressPin && (
            <Marker
              position={[addressPin.lat, addressPin.lng]}
              icon={SEARCH_PIN}
              alt="Searched address"
              title="Searched address"
            />
          )}
        </MapContainer>
      </div>

      {vendors.length === 0 && !noGeocodedVendors && (
        <p className="text-sm text-muted-foreground">
          No vendors in this view. Zoom out or adjust the filters.
        </p>
      )}
    </div>
  );
}
