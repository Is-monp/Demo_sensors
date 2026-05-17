import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useDI } from '@/src/core/di/DIProvider';
import { TOKENS } from '@/src/core/di/tokens';
import { SavedParking } from '../../domain/entities/SavedParking';
import { SavedParkingRepository } from '../../domain/repositories/SavedParkingRepository';

type SavedParkingListContextType = {
  latest: SavedParking | null;
  all: SavedParking[];
  refresh: () => Promise<void>;
};

const SavedParkingListContext = createContext<SavedParkingListContextType | undefined>(undefined);

export function SavedParkingListProvider({ children }: { children: ReactNode }) {
  const di = useDI();
  const repo = useMemo(
    () => di.resolve<SavedParkingRepository>(TOKENS.SavedParkingRepo),
    [di]
  );

  const [all, setAll] = useState<SavedParking[]>([]);

  const refresh = useCallback(async () => {
    const items = await repo.getAll();
    setAll(items);
  }, [repo]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ latest: all[0] ?? null, all, refresh }),
    [all, refresh]
  );

  return (
    <SavedParkingListContext.Provider value={value}>
      {children}
    </SavedParkingListContext.Provider>
  );
}

export function useSavedParkingList() {
  const ctx = useContext(SavedParkingListContext);
  if (!ctx) throw new Error('useSavedParkingList must be used inside SavedParkingListProvider');
  return ctx;
}
