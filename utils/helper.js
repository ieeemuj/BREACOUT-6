// Function to check if a point is within the geofence
export function checkGeofence(geofence, location) {
  const {lat, lan} = location;
  const { coordinate1, coordinate2, coordinate3, coordinate4 } = geofence;
  const minLat = Math.min(coordinate1.lat, coordinate2.lat, coordinate3.lat, coordinate4.lat);
  const maxLat = Math.max(coordinate1.lat, coordinate2.lat, coordinate3.lat, coordinate4.lat);
  const minlan = Math.min(coordinate1.lan, coordinate2.lan, coordinate3.lan, coordinate4.lan);
  const maxlan = Math.max(coordinate1.lan, coordinate2.lan, coordinate3.lan, coordinate4.lan);

  // Check if the point is within the bounds
  return lat >= minLat && lat <= maxLat && lan >= minlan && lan <= maxlan;
}
