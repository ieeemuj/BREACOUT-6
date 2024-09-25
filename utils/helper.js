// Function to check if a point is within the geofence
export function checkGeofence(geofence, location) {
  const { coordinate1, coordinate2, coordinate3, coordinate4 } = geofence;
  const polygon = [coordinate1, coordinate2, coordinate3, coordinate4];
  let inside = false;
  const x = location.lat, y = location.lan;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}
