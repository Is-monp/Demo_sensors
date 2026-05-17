import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedParking } from '../../domain/entities/SavedParking';
import { ISavedParkingDataSource } from './iSavedParkingDataSource';

const STORAGE_KEY = '@parksmart:saved_parkings';

export class SavedParkingLocalDataSourceImpl implements ISavedParkingDataSource {
  async save(parking: SavedParking): Promise<void> {
    const all = await this.getAll();
    all.unshift(parking);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  async getAll(): Promise<SavedParking[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedParking[];
    return parsed.map((p) => ({ ...p, savedAt: new Date(p.savedAt) }));
  }

  async getById(id: string): Promise<SavedParking | null> {
    const all = await this.getAll();
    return all.find((p) => p.id === id) ?? null;
  }
}
