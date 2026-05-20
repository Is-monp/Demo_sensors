export interface ParkingHistoryItem {
  id: string;
  savedAt: Date;
  zone?: string;
  level?: string;
  latitude: number;
  longitude: number;
  compassDirection: string;
  durationMinutes?: number; // calculated from savedAt to now if active, or until closed
  active: boolean;
}
