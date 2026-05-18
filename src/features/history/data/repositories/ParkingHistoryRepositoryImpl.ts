import { SavedParking } from '@/src/shared/domain/entities/SavedParking';
import { SavedParkingRepository } from '@/src/shared/domain/repositories/SavedParkingRepository';
import { ParkingHistoryItem } from '../../domain/entities/ParkingHistoryItem';
import { ParkingHistoryRepository } from '../../domain/repositories/ParkingHistoryRepository';

function toHistoryItem(p: SavedParking): ParkingHistoryItem {
  const now = new Date();
  const diffMs = now.getTime() - p.savedAt.getTime();
  const durationMinutes = Math.floor(diffMs / 60000);

  return {
    id: p.id!,
    savedAt: p.savedAt,
    zone: p.zone,
    level: p.level,
    latitude: p.gps.latitude,
    longitude: p.gps.longitude,
    compassDirection: p.compass.direction,
    durationMinutes,
    active: p.active ?? false,
  };
}

export class ParkingHistoryRepositoryImpl implements ParkingHistoryRepository {
  constructor(private readonly savedParkingRepo: SavedParkingRepository) {}

  async getHistory(): Promise<ParkingHistoryItem[]> {
    const all = await this.savedParkingRepo.getAll();
    return all
      .map(toHistoryItem)
      .sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
  }
}