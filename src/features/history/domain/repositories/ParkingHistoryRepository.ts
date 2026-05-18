import { ParkingHistoryItem } from '../entities/ParkingHistoryItem';

export interface ParkingHistoryRepository {
  getHistory(): Promise<ParkingHistoryItem[]>;
}
