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
import { SavedParking } from '@/src/shared/domain/entities/SavedParking';
import { SavedParkingRepository } from '@/src/shared/domain/repositories/SavedParkingRepository';

type SavedParkingListContextType = {
  latest: SavedParking | null;
  all: SavedParking[];
  refresh: () => Promise<void>;
  closeSession: (id: string) => Promise<void>;
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

  const closeSession = useCallback(async (id: string) => {
    await repo.closeSession(id);
    await refresh();
  }, [repo, refresh]);

  const value = useMemo(
    () => ({ latest: all.find((p) => p.active !== false) ?? null, all, refresh, closeSession }),
    [all, refresh, closeSession]
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
