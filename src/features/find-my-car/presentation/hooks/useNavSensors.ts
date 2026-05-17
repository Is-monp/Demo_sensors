import * as Location from 'expo-location';
import { Barometer } from 'expo-sensors';
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

// Weighted rolling average — recent readings carry more weight to reduce
// jitter while still following actual movement.
const SMOOTH_WINDOW = 6;
const WEIGHTS = [0.05, 0.08, 0.12, 0.17, 0.25, 0.33]; // must sum to 1

function smoothPositions(buf: NavPosition[]): NavPosition {
  const n = buf.length;
  if (n === 1) return buf[0];
  const w = WEIGHTS.slice(WEIGHTS.length - n);
  const wSum = w.reduce((s, v) => s + v, 0);
  return {
    latitude: buf.reduce((s, p, i) => s + (p.latitude * w[i]) / wSum, 0),
    longitude: buf.reduce((s, p, i) => s + (p.longitude * w[i]) / wSum, 0),
    accuracy: buf.reduce((s, p, i) => s + ((p.accuracy ?? 15) * w[i]) / wSum, 0),
  };
}

// Smooth compass readings across the 0/360 wrap boundary using circular mean.
const HEADING_SMOOTH = 5;
function smoothHeading(buf: number[], next: number): number[] {
  const updated = [...buf.slice(-(HEADING_SMOOTH - 1)), next];
  const sinSum = updated.reduce((s, h) => s + Math.sin((h * Math.PI) / 180), 0);
  const cosSum = updated.reduce((s, h) => s + Math.cos((h * Math.PI) / 180), 0);
  const mean = (Math.atan2(sinSum, cosSum) * 180) / Math.PI;
  return updated;
}

export function useNavSensors(): NavSensorsState {
  const [position, setPosition] = useState<NavPosition | null>(null);
  const [compassHeading, setCompassHeading] = useState(0);
  const [pressure, setPressure] = useState<number | null>(null);
  const [gpsReady, setGpsReady] = useState(false);
  const posWatcherRef = useRef<Location.LocationSubscription | null>(null);
  const headingWatcherRef = useRef<Location.LocationSubscription | null>(null);
  const posBuffer = useRef<NavPosition[]>([]);
  const headingBuffer = useRef<number[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || !active) return;

      // GPS position
      posWatcherRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 1000 },
        (loc) => {
          if (!active) return;
          const raw: NavPosition = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy,
          };
          posBuffer.current = [
            ...posBuffer.current.slice(-(SMOOTH_WINDOW - 1)),
            raw,
          ];
          setPosition(smoothPositions(posBuffer.current));
          setGpsReady(true);
        },
      );

      // Heading via sensor fusion (magnetometer + accelerometer + tilt compensation).
      // trueHeading accounts for magnetic declination; falls back to magHeading when
      // device can't compute it (returns -1).
      headingWatcherRef.current = await Location.watchHeadingAsync((h) => {
        if (!active) return;
        const raw = h.trueHeading >= 0 ? h.trueHeading : h.magHeading;
        headingBuffer.current = smoothHeading(headingBuffer.current, raw);
        const buf = headingBuffer.current;
        const sinSum = buf.reduce((s, v) => s + Math.sin((v * Math.PI) / 180), 0);
        const cosSum = buf.reduce((s, v) => s + Math.cos((v * Math.PI) / 180), 0);
        const mean = ((Math.atan2(sinSum, cosSum) * 180) / Math.PI + 360) % 360;
        setCompassHeading(Math.round(mean));
      });
    })();
    return () => {
      active = false;
      posWatcherRef.current?.remove();
      headingWatcherRef.current?.remove();
    };
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
