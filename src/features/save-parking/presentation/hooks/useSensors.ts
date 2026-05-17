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

  // Track last few magnetometer readings to detect stability
  const headingHistory = useRef<number[]>([]);

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

  // Barometer
  useEffect(() => {
    Barometer.setUpdateInterval(1000);
    const sub = Barometer.addListener(({ pressure }) => {
      setBarometer({
        pressure: Math.round(pressure * 10) / 10,
        altitudeLevel: pressureToLevel(pressure),
        status: 'active',
      });
    });
    return () => sub.remove();
  }, []);

  return { gps, compass, barometer };
}
