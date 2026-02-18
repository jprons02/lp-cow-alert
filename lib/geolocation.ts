/**
 * Maximum distance (in miles) a reporter can be from the selected location.
 */
export const MAX_DISTANCE_MILES = 1;

/**
 * Calculate the distance between two GPS coordinates using the Haversine formula.
 * Returns distance in miles.
 */
export function getDistanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Check if a reporter is within range of a location.
 */
export function isWithinRange(
  reporterLat: number,
  reporterLng: number,
  locationLat: number,
  locationLng: number,
  maxMiles: number = MAX_DISTANCE_MILES,
): boolean {
  const distance = getDistanceMiles(
    reporterLat,
    reporterLng,
    locationLat,
    locationLng,
  );
  return distance <= maxMiles;
}
