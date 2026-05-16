export type ParkingStatus = 'active' | 'expired' | 'saved';

export type ParkingSession = {
  id: string;
  level: string;
  zone: string;
  status: ParkingStatus;
  startTime: Date;
  accuracyLabel: string;
  orientation: string;
  expiresAt: Date;
};

export type ChargingInfo = {
  availableSpots: number;
  level: string;
};
