export interface Location {
  lat: number;
  lng: number;
}

export interface Geofence {
  coordinate1: Location;
  coordinate2: Location;
  coordinate3: Location;
  coordinate4: Location;
}
