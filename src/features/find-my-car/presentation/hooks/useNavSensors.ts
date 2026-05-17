import * as Location from 'expo-location';
import { Barometer, Magnetometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';

export type NavPosition = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

export type NavSensorsState = {
  position: NavPosition | null;
  compassHeading: number;
  pressure: number | null;
  gpsReady: boolean;
};

function calcHeading(x: number, y: number): number {
  const raw = Math.atan2(-y, x) * (180 / Math.PI);
  return Math.round(((raw % 360) + 360) % 360);
}

export function useNavSensors(): NavSensorsState {
  const [position, setPosition] = useState<NavPosition | null>(null);
  const [compassHeading, setCompassHeading] = useState(0);
  const [pressure, setPressure] = useState<number | null>(null);
  const [gpsReady, setGpsReady] = useState(false);
  const watcherRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || !active) return;
      watcherRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 2 },
        (loc) => {
          if (!active) return;
          setPosition({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy,
          });
          setGpsReady(true);
        },
      );
    })();
    return () => {
      active = false;
      watcherRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    Magnetometer.setUpdateInterval(200);
    const sub = Magnetometer.addListener(({ x, y }) => {
      setCompassHeading(calcHeading(x, y));
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    Barometer.setUpdateInterval(1000);
    const sub = Barometer.addListener(({ pressure: p }) => {
      setPressure(Math.round(p * 10) / 10);
    });
    return () => sub.remove();
  }, []);

  return { position, compassHeading, pressure, gpsReady };
}
