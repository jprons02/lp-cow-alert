export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

// Common areas in Laureate Park, Orlando, FL
export const PREDEFINED_LOCATIONS: Location[] = [
  {
    id: "laureate-moss-park",
    name: "Laureate Blvd & Moss Park Rd",
    lat: 28.3911,
    lng: -81.2758,
  },
  {
    id: "laureate-nemours",
    name: "Laureate Blvd & Nemours Pkwy",
    lat: 28.3975,
    lng: -81.2715,
  },
  {
    id: "town-center",
    name: "Lake Nona Town Center",
    lat: 28.3889,
    lng: -81.2667,
  },
  {
    id: "veterans-way",
    name: "Veterans Way",
    lat: 28.385,
    lng: -81.28,
  },
  {
    id: "lake-nona-blvd",
    name: "Lake Nona Blvd",
    lat: 28.392,
    lng: -81.269,
  },
];

export const OTHER_LOCATION_ID = "other";

/**
 * Generate a static map URL using OpenStreetMap tiles (free, no account needed).
 * Uses a simple OSM tile server with a center marker.
 */
export function getLocationMapUrl(location: Location): string {
  const { lat, lng } = location;
  const zoom = 13;
  const width = 600;
  const height = 400;

  // Using a working OSM static map service
  // Alternative: https://render.openstreetmap.org/cgi-bin/export
  const baseUrl = "https://www.openstreetmap.org/export/embed.html";

  // Calculate bounding box (roughly 2 miles in each direction)
  const latOffset = 0.029; // roughly 2 miles in latitude
  const lngOffset = 0.038; // roughly 2 miles in longitude (adjusted for latitude)

  const bbox = `${lng - lngOffset},${lat - latOffset},${lng + lngOffset},${lat + latOffset}`;

  const params = new URLSearchParams({
    bbox: bbox,
    layer: "mapnik",
    marker: `${lat},${lng}`,
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Find a location by its ID
 */
export function getLocationById(id: string): Location | null {
  return PREDEFINED_LOCATIONS.find((loc) => loc.id === id) || null;
}

/**
 * Find a location by its display name
 */
export function getLocationByName(name: string): Location | null {
  return PREDEFINED_LOCATIONS.find((loc) => loc.name === name) || null;
}

/**
 * Find the closest predefined location to given coordinates.
 * Returns the location and distance in miles.
 */
export function findClosestLocation(
  lat: number,
  lng: number,
): { location: Location; distanceMiles: number } | null {
  if (PREDEFINED_LOCATIONS.length === 0) return null;

  const R = 3959; // Earth's radius in miles
  function haversine(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  let closest = PREDEFINED_LOCATIONS[0];
  let minDist = haversine(lat, lng, closest.lat, closest.lng);

  for (let i = 1; i < PREDEFINED_LOCATIONS.length; i++) {
    const loc = PREDEFINED_LOCATIONS[i];
    const dist = haversine(lat, lng, loc.lat, loc.lng);
    if (dist < minDist) {
      minDist = dist;
      closest = loc;
    }
  }

  return { location: closest, distanceMiles: minDist };
}

/**
 * Get distances from a point to all predefined locations.
 * Returns a map of location id → distance in miles.
 */
export function getDistancesToLocations(
  lat: number,
  lng: number,
): Map<string, number> {
  const R = 3959;
  const distances = new Map<string, number>();

  for (const loc of PREDEFINED_LOCATIONS) {
    const dLat = ((loc.lat - lat) * Math.PI) / 180;
    const dLng = ((loc.lng - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((loc.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    distances.set(loc.id, R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  return distances;
}
