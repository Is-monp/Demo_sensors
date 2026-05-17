import { SavedParking } from '@/src/shared/domain/entities/SavedParking';

export interface ISavedParkingDataSource {
  save(parking: SavedParking): Promise<void>;
  getAll(): Promise<SavedParking[]>;
  getById(id: string): Promise<SavedParking | null>;
  closeSession(id: string): Promise<void>;
}
