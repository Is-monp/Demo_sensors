import { ILocalPreferences } from '@/src/core/iLocalPreferences';
import { LocalPreferencesAsyncStorage } from '@/src/core/LocalPreferencesAsyncStorage';
import { AuthRemoteDataSourceImpl } from '@/src/features/auth/data/datasources/AuthRemoteDataSourceImp';
import { SavedParking } from '../../domain/entities/SavedParking';
import { ISavedParkingDataSource } from './iSavedParkingDataSource';

const TABLE = 'saved_parkings';
const BASE_URL = 'https://roble-api.openlab.uninorte.edu.co';

export class SavedParkingRemoteDataSourceImpl implements ISavedParkingDataSource {
  private readonly projectId: string;
  private readonly prefs: ILocalPreferences;

  constructor(
    private readonly authService: AuthRemoteDataSourceImpl,
    projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID,
  ) {
    if (!projectId) throw new Error('Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var');
    this.projectId = projectId;
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }

  private url(path: string) {
    return `${BASE_URL}/database/${this.projectId}${path}`;
  }

  private async authorizedFetch(url: string, options: RequestInit, retry = true): Promise<Response> {
    const token = await this.prefs.retrieveData<string>('token');
    const headers = { ...(options.headers ?? {}), Authorization: `Bearer ${token}` };
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 && retry) {
      const refreshed = await this.authService.refreshToken().catch(() => false);
      if (refreshed) {
        const newToken = await this.prefs.retrieveData<string>('token');
        return fetch(url, { ...options, headers: { ...(options.headers ?? {}), Authorization: `Bearer ${newToken}` } });
      }
    }

    return response;
  }

  private toRecord(parking: SavedParking, userId: string): Record<string, unknown> {
    return {
      user_id: userId,
      saved_at: parking.savedAt.toISOString(),
      latitude: parking.gps.latitude,
      longitude: parking.gps.longitude,
      level: parking.level ?? null,
      zone: parking.zone ?? null,
      compass_degrees: parking.compass.degrees,
      compass_direction: parking.compass.direction,
      preassure_hpa: parking.barometer.pressure,
      active: parking.active ?? true,
    };
  }

  private fromRecord(r: Record<string, any>): SavedParking {
    return {
      id: r._id,
      savedAt: new Date(r.saved_at),
      level: r.level ?? undefined,
      zone: r.zone ?? undefined,
      active: r.active ?? true,
      gps: { latitude: r.latitude, longitude: r.longitude, accuracy: null, status: 'active' },
      compass: { degrees: r.compass_degrees, direction: r.compass_direction, stable: true, status: 'active' },
      barometer: { pressure: r.preassure_hpa, altitudeLevel: '', status: 'active' },
    };
  }

  async save(parking: SavedParking): Promise<void> {
    const userId = await this.prefs.retrieveData<string>('userEmail') ?? 'unknown';

    const response = await this.authorizedFetch(this.url('/insert'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableName: TABLE,
        records: [this.toRecord(parking, userId)],
      }),
    });

    if (response.status !== 201) {
      const body = await response.json().catch(() => ({}));
      throw new Error(`Save failed ${response.status}: ${body.message ?? response.statusText}`);
    }
  }

  async getAll(): Promise<SavedParking[]> {
    const userId = await this.prefs.retrieveData<string>('userEmail') ?? 'unknown';

    const response = await this.authorizedFetch(
      this.url(`/read?tableName=${TABLE}&user_id=${encodeURIComponent(userId)}`),
      { method: 'GET' }
    );

    if (!response.ok) throw new Error(`getAll failed ${response.status}`);

    const data: Record<string, any>[] = await response.json();
    return data.map((r) => this.fromRecord(r));
  }

  async getById(id: string): Promise<SavedParking | null> {
    const response = await this.authorizedFetch(
      this.url(`/read?tableName=${TABLE}&_id=${id}`),
      { method: 'GET' }
    );

    if (!response.ok) throw new Error(`getById failed ${response.status}`);

    const data: Record<string, any>[] = await response.json();
    return data.length > 0 ? this.fromRecord(data[0]) : null;
  }

  async closeSession(id: string): Promise<void> {
    const response = await this.authorizedFetch(this.url('/update'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableName: TABLE,
        idColumn: '_id',
        idValue: id,
        updates: { active: false },
      }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(`Close session failed ${response.status}: ${body.message ?? response.statusText}`);
    }
  }
}
