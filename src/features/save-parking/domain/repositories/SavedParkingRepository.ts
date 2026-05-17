import { SavedParking } from '../entities/SavedParking';

export interface SavedParkingRepository {
  save(parking: SavedParking): Promise<void>;
  getAll(): Promise<SavedParking[]>;
  getById(id: string): Promise<SavedParking | null>;
}
