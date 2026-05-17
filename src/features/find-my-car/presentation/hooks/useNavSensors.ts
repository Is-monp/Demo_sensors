import * as Location from 'expo-location';
import { Accelerometer, Barometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';

export type NavPosition = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

export type NavSensorsState = {
  position: NavPosition | null;
  compassHeading: number;
  pressure: number | null;   // EMA smoothed hPa, full float precision
  pressureReady: boolean;    // true after PRESSURE_READY_COUNT readings
  isMoving: boolean;         // accelerometer variance gate 
  gpsReady: boolean;
};

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

const HEADING_SMOOTH = 5;
function smoothHeading(buf: number[], next: number): number[] {
  return [...buf.slice(-(HEADING_SMOOTH - 1)), next];
}

const PRESSURE_EMA_ALPHA = 0.2;        // EMA smoothing factor
const PRESSURE_READY_COUNT = 5;         // 2.5 s at 500 ms before stable
const ACCEL_BUF = 5;
const MOVING_VARIANCE = 0.02;           // g^2 variance threshold

export function useNavSensors(): NavSensorsState {
  const [position, setPosition] = useState<NavPosition | null>(null);
  const [compassHeading, setCompassHeading] = useState(0);
  const [pressure, setPressure] = useState<number | null>(null);
  const [pressureReady, setPressureReady] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [gpsReady, setGpsReady] = useState(false);

  const posWatcherRef = useRef<Location.LocationSubscription | null>(null);
  const headingWatcherRef = useRef<Location.LocationSubscription | null>(null);
  const posBuffer = useRef<NavPosition[]>([]);
  const headingBuffer = useRef<number[]>([]);
  const pressureEma = useRef<number | null>(null);
  const pressureCount = useRef(0);
  const pressureReadyRef = useRef(false); // avoids stale closure in listener
  const accelBuf = useRef<number[]>([]);

  // GPS + compass
  useEffect(() => {
    let active = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || !active) return;

      posWatcherRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 1000 },
        (loc) => {
          if (!active) return;
          const raw: NavPosition = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy,
          };
          posBuffer.current = [...posBuffer.current.slice(-(SMOOTH_WINDOW - 1)), raw];
          setPosition(smoothPositions(posBuffer.current));
          setGpsReady(true);
        },
      );

      // trueHeading accounts for magnetic declination; falls back to magHeading when -1.
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

  // Barometer — EMA(α=0.2), full float precision, ready flag after N readings
  useEffect(() => {
    Barometer.setUpdateInterval(500);
    const sub = Barometer.addListener(({ pressure: p }) => {
      pressureEma.current = pressureEma.current === null
        ? p
        : PRESSURE_EMA_ALPHA * p + (1 - PRESSURE_EMA_ALPHA) * pressureEma.current;
      pressureCount.current += 1;
      setPressure(pressureEma.current);
      if (!pressureReadyRef.current && pressureCount.current >= PRESSURE_READY_COUNT) {
        pressureReadyRef.current = true;
        setPressureReady(true);
      }
    });
    return () => sub.remove();
  }, []);

  // Accelerometer — variance gate for floor-delta updates 
  useEffect(() => {
    Accelerometer.setUpdateInterval(200);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const mag = Math.sqrt(x * x + y * y + z * z);
      accelBuf.current = [...accelBuf.current.slice(-(ACCEL_BUF - 1)), mag];
      if (accelBuf.current.length < ACCEL_BUF) return;
      const mean = accelBuf.current.reduce((s, v) => s + v, 0) / ACCEL_BUF;
      const variance = accelBuf.current.reduce((s, v) => s + (v - mean) ** 2, 0) / ACCEL_BUF;
      setIsMoving(variance > MOVING_VARIANCE);
    });
    return () => sub.remove();
  }, []);

  return { position, compassHeading, pressure, pressureReady, isMoving, gpsReady };
}
