export type SensorStatus = 'active' | 'calibrating' | 'unavailable';

export type GPSData = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  status: SensorStatus;
};

export type CompassData = {
  degrees: number;
  direction: string;
  stable: boolean;
  status: SensorStatus;
};

export type BarometerData = {
  pressure: number;
  altitudeLevel: string;
  status: SensorStatus;
};

export type SavedParking = {
  id: string;
  savedAt: Date;
  level?: string;
  zone?: string;
  gps: GPSData;
  compass: CompassData;
  barometer: BarometerData;
};
