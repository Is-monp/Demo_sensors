import { useDI } from '@/src/core/di/DIProvider';
import { TOKENS } from '@/src/core/di/tokens';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { ParkingHistoryItem } from '../../domain/entities/ParkingHistoryItem';
import { ParkingHistoryRepository } from '../../domain/repositories/ParkingHistoryRepository';

type HistoryContextType = {
  history: ParkingHistoryItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const di = useDI();
  const repo = di.resolve<ParkingHistoryRepository>(TOKENS.ParkingHistoryRepo);

  console.log('HistoryProvider mounted, repo:', repo); // 👈

  const [history, setHistory] = useState<ParkingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('History: fetching...'); // 👈
      const data = await repo.getHistory();
      console.log('History: got', data.length, 'items', data); // 👈
      setHistory(data);
    } catch (e: any) {
      console.log('History: ERROR', e); // 👈
      setError(e?.message ?? 'Failed to load history');
    } finally {
      setIsLoading(false);
    }
  }, [repo]);

  return (
    <HistoryContext.Provider value={{ history, isLoading, error, refresh }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used inside HistoryProvider');
  return ctx;
}
