import { ChargingInfo, ParkingSession } from '../../domain/entities/ParkingSession';
import { ParkingRepository } from '../../domain/repositories/ParkingRepository';
import { IParkingDataSource } from '../datasources/iParkingDataSource';

export class ParkingRepositoryImpl implements ParkingRepository {
  constructor(private readonly dataSource: IParkingDataSource) {}

  getCurrentSession(): Promise<ParkingSession | null> {
    return this.dataSource.getCurrentSession();
  }

  saveParking(): Promise<void> {
    return this.dataSource.saveParking();
  }

  getChargingInfo(): Promise<ChargingInfo> {
    return this.dataSource.getChargingInfo();
  }
}
