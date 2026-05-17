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
import { SavedParking } from '@/src/features/save-parking/domain/entities/SavedParking';
import { SavedParkingRepository } from '@/src/features/save-parking/domain/repositories/SavedParkingRepository';
import type { FindCarNavigation, GpsCoords, NavigationMode } from '../../domain/entities/FindCarNavigation';
import { useNavSensors } from '../hooks/useNavSensors';

function haversineMeters(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearingDeg(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}
function dirLabel(relativeBearing: number): string {
  const b = ((relativeBearing % 360) + 360) % 360;
  if (b < 22.5 || b >= 337.5) return 'STRAIGHT AHEAD';
  if (b < 67.5) return 'BEAR RIGHT';
  if (b < 112.5) return 'TURN RIGHT';
  if (b < 157.5) return 'SHARP RIGHT';
  if (b < 202.5) return 'TURN AROUND';
  if (b < 247.5) return 'SHARP LEFT';
  if (b < 292.5) return 'TURN LEFT';
  return 'BEAR LEFT';
}

// Cap each accuracy reading so poor GPS doesn't create a huge arrival bubble.
const MAX_ACCURACY_CAP = 8;
const MIN_ARRIVAL_RADIUS = 3;

function arrivalRadius(savedAccuracy: number | null, currentAccuracy: number | null): number {
  const s = Math.min(savedAccuracy ?? MAX_ACCURACY_CAP, MAX_ACCURACY_CAP);
  const c = Math.min(currentAccuracy ?? MAX_ACCURACY_CAP, MAX_ACCURACY_CAP);
  return Math.max(Math.sqrt(s * s + c * c), MIN_ARRIVAL_RADIUS);
}

function pressureToLevel(hPa: number): string {
  if (hPa >= 1015) return 'Level P1';
  if (hPa >= 1008) return 'Level P2';
  if (hPa >= 1001) return 'Level P3';
  return 'Level P4';
}

//ISA barometric formula — converts hPa to metres ASL.
// Using deltas (currentAlt - baseAlt) cancels out the sea-level reference,
// leaving only the relative height between the two readings.
const ISA_P0 = 1013.25;
const ISA_EXP = 1 / 5.255;
function pressureToAltitude(hPa: number): number {
  return 44330 * (1 - Math.pow(hPa / ISA_P0, ISA_EXP));
}
const FLOOR_HEIGHT_M = 3.0;
const FLOOR_HYSTERESIS = 0.6; //deadband in floors

type FindMyCarContextType = {
  nav: FindCarNavigation | null;
  isLoading: boolean;
  hasTarget: boolean;
  pressureReady: boolean;
  clearTarget: () => void;
  refresh: () => Promise<void>;
};

const FindMyCarContext = createContext<FindMyCarContextType | undefined>(undefined);

export function FindMyCarProvider({ children }: { children: ReactNode }) {
  const di = useDI();
  const repo = useMemo(
    () => di.resolve<SavedParkingRepository>(TOKENS.SavedParkingRepo),
    [di],
  );

  const [target, setTarget] = useState<SavedParking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { position, compassHeading, pressure, pressureReady, isMoving, gpsReady } = useNavSensors();
  const [floorDeltaDisplay, setFloorDeltaDisplay] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    const all = await repo.getAll();
    setTarget(all.find((p) => p.active !== false) ?? null);
  }, [repo]);

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const nav = useMemo((): FindCarNavigation | null => {
    if (!target) return null;

    const gpsAccurate =
      gpsReady &&
      position !== null &&
      (position.accuracy === null || position.accuracy < 50);

    const mode: NavigationMode = gpsAccurate ? 'gps' : 'indoor';

    let distance: number | null = null;
    let bearing: number | null = null;
    let relativeBearing: number | null = null;

    if (gpsAccurate && position) {
      distance = Math.round(
        haversineMeters(
          position.latitude, position.longitude,
          target.gps.latitude, target.gps.longitude,
        ),
      );
      bearing = bearingDeg(
        position.latitude, position.longitude,
        target.gps.latitude, target.gps.longitude,
      );
      relativeBearing = (bearing - compassHeading + 360) % 360;
    } else {
      relativeBearing = 0;
    }

    const radius = arrivalRadius(target.gps.accuracy, position?.accuracy ?? null);
    const sameFloor = floorDeltaDisplay === null || floorDeltaDisplay === 0;
    const isArrived = distance !== null && distance <= radius && sameFloor;

    const currentLevel =
      pressure !== null ? pressureToLevel(pressure) : 'Level P1';

    const positionCoords: GpsCoords | null = position
      ? { latitude: position.latitude, longitude: position.longitude }
      : null;

    const targetGps: GpsCoords = {
      latitude: target.gps.latitude,
      longitude: target.gps.longitude,
    };

    return {
      targetId: target.id,
      targetLevel: target.level,
      targetZone: target.zone,
      savedAt: target.savedAt,
      distance,
      bearing,
      relativeBearing,
      compassHeading,
      mode,
      currentLevel,
      directionLabel: isArrived ? 'YOU\'VE ARRIVED' : dirLabel(relativeBearing ?? 0),
      floorDelta: floorDeltaDisplay,
      isArrived,
      position: positionCoords,
      targetGps,
    };
  }, [target, position, compassHeading, pressure, gpsReady, floorDeltaDisplay]);

  // ISA altitude delta, hysteresis deadband, movement gate
  useEffect(() => {
    if (!pressureReady || pressure === null || !target) {
      setFloorDeltaDisplay(null);
      return;
    }
    const altDelta = pressureToAltitude(pressure) - pressureToAltitude(target.barometer.pressure);
    const rawFloors = altDelta / FLOOR_HEIGHT_M;
    const floors = Math.abs(rawFloors) < FLOOR_HYSTERESIS ? 0 : Math.round(rawFloors);
    if (!isMoving || floors === 0) {
      setFloorDeltaDisplay(floors);
    }
  }, [pressure, pressureReady, isMoving, target]);

  const clearTarget = useCallback(() => setTarget(null), []);

  const value = useMemo(
    () => ({ nav, isLoading, hasTarget: target !== null, pressureReady, clearTarget, refresh }),
    [nav, isLoading, target, pressureReady, clearTarget, refresh],
  );

  return (
    <FindMyCarContext.Provider value={value}>
      {children}
    </FindMyCarContext.Provider>
  );
}

export function useFindMyCar() {
  const ctx = useContext(FindMyCarContext);
  if (!ctx) throw new Error('useFindMyCar must be used inside FindMyCarProvider');
  return ctx;
}
