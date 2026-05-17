import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useDI } from '@/src/core/di/DIProvider';
import { TOKENS } from '@/src/core/di/tokens';
import { ChargingInfo, ParkingSession } from '../../domain/entities/ParkingSession';
import { ParkingRepository } from '../../domain/repositories/ParkingRepository';

function formatDuration(startTime: Date): string {
  const ms = Date.now() - startTime.getTime();
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
}

function formatExpiringIn(expiresAt: Date): string {
  const diff = expiresAt.getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const minutes = Math.ceil(diff / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export type ParkingContextType = {
  session: ParkingSession | null;
  chargingInfo: ChargingInfo | null;
  isLoading: boolean;
  durationLabel: string;
  expiringInLabel: string;
  saveParking: () => Promise<void>;
  refresh: () => Promise<void>;
};

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export function ParkingProvider({ children }: { children: ReactNode }) {
  const di = useDI();
  const parkingRepo = useMemo(
    () => di.resolve<ParkingRepository>(TOKENS.ParkingRepo),
    [di]
  );

  const [session, setSession] = useState<ParkingSession | null>(null);
  const [chargingInfo, setChargingInfo] = useState<ChargingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    const [sess, charging] = await Promise.all([
      parkingRepo.getCurrentSession(),
      parkingRepo.getChargingInfo(),
    ]);
    setSession(sess);
    setChargingInfo(charging);
  }, [parkingRepo]);

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!session) return;
    timerRef.current = setInterval(() => setTick((t) => t + 1), 30000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session]);

  const durationLabel = session ? formatDuration(session.startTime) : '--';
  const expiringInLabel = session ? formatExpiringIn(session.expiresAt) : '--';

  const saveParking = async () => {
    await parkingRepo.saveParking();
  };

  const value = useMemo(
    () => ({ session, chargingInfo, isLoading, durationLabel, expiringInLabel, saveParking, refresh }),
    [session, chargingInfo, isLoading, tick]
  );

  return <ParkingContext.Provider value={value}>{children}</ParkingContext.Provider>;
}

export function useParking() {
  const ctx = useContext(ParkingContext);
  if (!ctx) throw new Error('useParking must be used inside ParkingProvider');
  return ctx;
}
