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

function formatDuration(savedAt: Date): string {
  const ms = Date.now() - new Date(savedAt).getTime();
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
}

type HomeContextType = {
  activeSession: SavedParking | null;
  isLoading: boolean;
  durationLabel: string;
  refresh: () => Promise<void>;
};

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export function HomeProvider({ children }: { children: ReactNode }) {
  const di = useDI();
  const repo = useMemo(
    () => di.resolve<SavedParkingRepository>(TOKENS.SavedParkingRepo),
    [di],
  );

  const [activeSession, setActiveSession] = useState<SavedParking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(async () => {
    const all = await repo.getAll();
    setActiveSession(all.find((p) => p.active !== false) ?? null);
  }, [repo]);

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  useEffect(() => {
    if (!activeSession) return;
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, [activeSession]);

  const value = useMemo(
    () => ({
      activeSession,
      isLoading,
      durationLabel: activeSession ? formatDuration(activeSession.savedAt) : '--',
      refresh,
    }),
    // tick forces durationLabel to recompute every 30s
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeSession, isLoading, refresh, tick],
  );

  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
}

export function useHome() {
  const ctx = useContext(HomeContext);
  if (!ctx) throw new Error('useHome must be used inside HomeProvider');
  return ctx;
}
