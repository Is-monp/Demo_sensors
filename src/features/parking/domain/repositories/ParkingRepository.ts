import { ChargingInfo, ParkingSession } from '../entities/ParkingSession';

export interface ParkingRepository {
  getCurrentSession(): Promise<ParkingSession | null>;
  saveParking(): Promise<void>;
  getChargingInfo(): Promise<ChargingInfo>;
}
