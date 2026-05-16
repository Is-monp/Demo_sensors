import { ChargingInfo, ParkingSession } from '../../domain/entities/ParkingSession';
import { IParkingDataSource } from './iParkingDataSource';

export class ParkingLocalDataSourceImpl implements IParkingDataSource {
  async getCurrentSession(): Promise<ParkingSession> {
    const now = new Date();
    return {
      id: 'session-1',
      level: 'Level 4',
      zone: 'Zone B',
      status: 'active',
      startTime: new Date(now.getTime() - (2 * 60 + 45) * 60 * 1000),
      accuracyLabel: 'High (±2m)',
      orientation: 'North-West',
      expiresAt: new Date(now.getTime() + 15 * 60 * 1000),
    };
  }

  async saveParking(): Promise<void> {}

  async getChargingInfo(): Promise<ChargingInfo> {
    return { availableSpots: 2, level: 'Level 2' };
  }
}
