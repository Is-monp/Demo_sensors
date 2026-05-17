import { SavedParking } from '../../domain/entities/SavedParking';
import { SavedParkingRepository } from '../../domain/repositories/SavedParkingRepository';
import { ISavedParkingDataSource } from '../datasources/iSavedParkingDataSource';

export class SavedParkingRepositoryImpl implements SavedParkingRepository {
  constructor(private readonly dataSource: ISavedParkingDataSource) {}

  save(parking: SavedParking): Promise<void> {
    return this.dataSource.save(parking);
  }

  getAll(): Promise<SavedParking[]> {
    return this.dataSource.getAll();
  }

  getById(id: string): Promise<SavedParking | null> {
    return this.dataSource.getById(id);
  }
}
