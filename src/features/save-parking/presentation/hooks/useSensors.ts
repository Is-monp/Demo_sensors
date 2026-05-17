import * as Location from 'expo-location';
import { Barometer, Magnetometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { BarometerData, CompassData, GPSData } from '../../domain/entities/SavedParking';

const DIRECTIONS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];

function degreesToDirection(deg: number): string {
  return DIRECTIONS[Math.round(((deg % 360) + 360) % 360 / 22.5) % 16];
}

function pressureToLevel(hPa: number): string {
  if (hPa >= 1015) return 'Level P1';
  if (hPa >= 1008) return 'Level P2';
  if (hPa >= 1001) return 'Level P3';
  return 'Level P4';
}

export type SensorsState = {
  gps: GPSData;
  compass: CompassData;
  barometer: BarometerData;
  pressureReady: boolean;
};

export function useSensors(): SensorsState {
  const [gps, setGps] = useState<GPSData>({
    latitude: 0,
    longitude: 0,
    accuracy: null,
    status: 'calibrating',
  });

  const [compass, setCompass] = useState<CompassData>({
    degrees: 0,
    direction: 'N',
    stable: false,
    status: 'calibrating',
  });

  const [barometer, setBarometer] = useState<BarometerData>({
    pressure: 0,
    altitudeLevel: 'Level P1',
    status: 'calibrating',
  });

  const [pressureReady, setPressureReady] = useState(false);

  const headingHistory = useRef<number[]>([]);
  const pressureEma = useRef<number | null>(null);
  const pressureCount = useRef(0);
  const pressureReadyRef = useRef(false);

  // GPS
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGps((g) => ({ ...g, status: 'unavailable' }));
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      if (!cancelled) {
        setGps({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          accuracy: loc.coords.accuracy,
          status: 'active',
        });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Magnetometer
  useEffect(() => {
    Magnetometer.setUpdateInterval(500);
    const sub = Magnetometer.addListener(({ x, y }) => {
      const raw = Math.atan2(-y, x) * (180 / Math.PI);
      const deg = Math.round(((raw % 360) + 360) % 360);

      headingHistory.current = [...headingHistory.current.slice(-4), deg];
      const diffs = headingHistory.current.map((h) => Math.abs(h - deg));
      const stable = headingHistory.current.length >= 5 && Math.max(...diffs) < 8;

      setCompass({
        degrees: deg,
        direction: degreesToDirection(deg),
        stable,
        status: 'active',
      });
    });
    return () => sub.remove();
  }, []);

  // Barometer — EMA(α=0.2), full float precision, ready after 8 readings (~4 s) (Steps 1, 2, 4)
  useEffect(() => {
    const EMA_ALPHA = 0.2;
    const READY_COUNT = 8;
    Barometer.setUpdateInterval(500);
    const sub = Barometer.addListener(({ pressure: p }) => {
      pressureEma.current = pressureEma.current === null
        ? p
        : EMA_ALPHA * p + (1 - EMA_ALPHA) * pressureEma.current;
      pressureCount.current += 1;
      setBarometer({
        pressure: pressureEma.current,
        altitudeLevel: pressureToLevel(pressureEma.current),
        status: 'active',
      });
      if (!pressureReadyRef.current && pressureCount.current >= READY_COUNT) {
        pressureReadyRef.current = true;
        setPressureReady(true);
      }
    });
    return () => sub.remove();
  }, []);

  return { gps, compass, barometer, pressureReady };
}
