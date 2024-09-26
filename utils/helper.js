// Function to check if a point is within the geofence
export function checkGeofence(geofence, point) {
  // const {lat, lan} = location;
  // const minLat = Math.min(coordinate1.lat, coordinate2.lat, coordinate3.lat, coordinate4.lat);
  // const maxLat = Math.max(coordinate1.lat, coordinate2.lat, coordinate3.lat, coordinate4.lat);
  // const minlan = Math.min(coordinate1.lan, coordinate2.lan, coordinate3.lan, coordinate4.lan);
  // const maxlan = Math.max(coordinate1.lan, coordinate2.lan, coordinate3.lan, coordinate4.lan);
  const { coordinate1, coordinate2, coordinate3, coordinate4 } = geofence;
  const polygon = [coordinate1, coordinate2, coordinate3, coordinate4];
  let odd = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; i++) {
    if (
      ((polygon[i][1] > point[1]) !== (polygon[j][1] > point[1]))
      &&
      (point[0] < ((polygon[j][0] - polygon[i][0]) * (point[1] - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0]))
    ) {
      odd = !odd;
    }
    j = i;
  }
  return odd;

  // Check if the point is within the bounds
  // return lat >= minLat && lat <= maxLat && lan >= minlan && lan <= maxlan;
}
