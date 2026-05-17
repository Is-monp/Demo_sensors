import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';

import { useDI } from '@/src/core/di/DIProvider';
import { TOKENS } from '@/src/core/di/tokens';
import { useParking } from '@/src/features/parking/presentation/context/parkingContext';
import { SavedParking } from '../../domain/entities/SavedParking';
import { SavedParkingRepository } from '../../domain/repositories/SavedParkingRepository';
import { useSensors } from '../hooks/useSensors';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type SaveParkingContextType = {
  sensors: ReturnType<typeof useSensors>;
  savedParking: SavedParking | null;
  isSaving: boolean;
  error: string | null;
  save: () => Promise<void>;
};

const SaveParkingContext = createContext<SaveParkingContextType | undefined>(undefined);

export function SaveParkingProvider({ children }: { children: ReactNode }) {
  const di = useDI();
  const repo = useMemo(
    () => di.resolve<SavedParkingRepository>(TOKENS.SavedParkingRepo),
    [di]
  );

  const { session } = useParking();
  const sensors = useSensors();
  const [savedParking, setSavedParking] = useState<SavedParking | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const entry: SavedParking = {
        id: generateId(),
        savedAt: new Date(),
        level: session?.level,
        zone: session?.zone,
        gps: sensors.gps,
        compass: sensors.compass,
        barometer: sensors.barometer,
      };
      await repo.save(entry);
      setSavedParking(entry);
    } catch (e: any) {
      setError(e?.message ?? 'Error saving parking');
      console.error('[SaveParking]', e);
    } finally {
      setIsSaving(false);
    }
  };

  const value = useMemo(
    () => ({ sensors, savedParking, isSaving, error, save }),
    [sensors, savedParking, isSaving, error]
  );

  return (
    <SaveParkingContext.Provider value={value}>{children}</SaveParkingContext.Provider>
  );
}

export function useSaveParking() {
  const ctx = useContext(SaveParkingContext);
  if (!ctx) throw new Error('useSaveParking must be used inside SaveParkingProvider');
  return ctx;
}
