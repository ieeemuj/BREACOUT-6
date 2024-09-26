// Function to check if a point is within the geofence
export function checkGeofence(geofence, point) {
  // const {lat, lan} = location;
  const { coordinate1, coordinate2, coordinate3, coordinate4 } = geofence;
  // const minLat = Math.min(coordinate1.lat, coordinate2.lat, coordinate3.lat, coordinate4.lat);
  // const maxLat = Math.max(coordinate1.lat, coordinate2.lat, coordinate3.lat, coordinate4.lat);
  // const minlan = Math.min(coordinate1.lan, coordinate2.lan, coordinate3.lan, coordinate4.lan);
  // const maxlan = Math.max(coordinate1.lan, coordinate2.lan, coordinate3.lan, coordinate4.lan);
  const polygon = [coordinate1, coordinate2, coordinate3, coordinate4];
  let odd = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; i++) {
    if (((polygon[i].lan > point.lan) !== (polygon[j].lan > point.lan))
      && (point.lat < ((polygon[j].lat - polygon[i].lat) * (point.lan - polygon[i].lan) / (polygon[j].lan - polygon[i].lan) + polygon[i].lat))) {
      odd = !odd;
    }
    j = i;
  }
  return odd;

  // Check if the point is within the bounds
  // return lat >= minLat && lat <= maxLat && lan >= minlan && lan <= maxlan;
}
