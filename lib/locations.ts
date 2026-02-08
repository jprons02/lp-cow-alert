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
