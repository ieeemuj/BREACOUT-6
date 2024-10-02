// Function to check if a point is within the geofence
export function checkGeofence(point, geolocation) {
  const polygon = [
    geolocation.coordinate1,
    geolocation.coordinate2,
    geolocation.coordinate3,
    geolocation.coordinate4,
  ]

  const x = point[0], y = point[1];

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = parseFloat(polygon[i][0]), yi = parseFloat(polygon[i][1]);
    const xj = parseFloat(polygon[j][0]), yj = parseFloat(polygon[j][1]);

    const intersect = ((yi > y) !== (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}
