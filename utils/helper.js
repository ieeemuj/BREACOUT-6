// Helper function to calculate the cross product of vectors AB and AC
function crossProduct(A, B, C) {
  return (B.lat - A.lat) * (C.lng - A.lng) - (B.lng - A.lng) * (C.lat - A.lat);
}

// Function to check if a point is within the geofence
export function checkGeofence(geofence, location) {
  const { coordinate1, coordinate2, coordinate3, coordinate4 } = geofence;

  const d1 = crossProduct(coordinate1, coordinate2, location);
  const d2 = crossProduct(coordinate2, coordinate3, location);
  const d3 = crossProduct(coordinate3, coordinate4, location);
  const d4 = crossProduct(coordinate4, coordinate1, location);

  const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0) || (d4 < 0);
  const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0) || (d4 > 0);

  return !(hasNeg && hasPos);
}
