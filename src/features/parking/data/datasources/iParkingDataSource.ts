import { ChargingInfo, ParkingSession } from '../../domain/entities/ParkingSession';

export interface IParkingDataSource {
  getCurrentSession(): Promise<ParkingSession | null>;
  saveParking(): Promise<void>;
  getChargingInfo(): Promise<ChargingInfo>;
}
