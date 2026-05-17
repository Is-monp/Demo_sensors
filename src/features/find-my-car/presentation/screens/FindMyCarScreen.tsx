import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FindMyCarProvider, useFindMyCar } from '../context/findMyCarContext';
import ParkingMapView from '../components/ParkingMapView';

const C = {
  brand: '#1A1D6E',
  bg: '#EEEEF8',
  card: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B6B8A',
  textMuted: '#9898B0',
  border: '#E0E0F0',
  indoorBg: '#FFF9E6',
  indoorBorder: '#F5C842',
  indoorText: '#7A5C00',
  compassRing: '#DFE0F0',
};

function timeAgo(savedAt: Date): string {
  const minutes = Math.floor(
    (Date.now() - new Date(savedAt).getTime()) / 60000,
  );
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m ago` : `${hours}h ago`;
}

function CompassArrow({ relativeBearing, size = 200 }: { relativeBearing: number; size?: number }) {
  const spinValue = useRef(new Animated.Value(relativeBearing)).current;
  const accumulated = useRef(relativeBearing);

  useEffect(() => {
    let delta = relativeBearing - (accumulated.current % 360);
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    accumulated.current += delta;

    Animated.spring(spinValue, {
      toValue: accumulated.current,
      useNativeDriver: true,
      speed: 10,
      bounciness: 0,
    }).start();
  }, [relativeBearing, spinValue]);

  const rotate = spinValue.interpolate({
    inputRange: [-9999, 9999],
    outputRange: ['-9999deg', '9999deg'],
  });

  const ring = size * 0.95;
  const inner = size * 0.8;
  const headW = size * 0.22;
  const headH = size * 0.54;
  const tailW = size * 0.14;
  const tailH = size * 0.34;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: ring, height: ring, borderRadius: ring / 2,
        backgroundColor: C.compassRing, alignItems: 'center', justifyContent: 'center',
      }}>
        <View style={{
          width: inner, height: inner, borderRadius: inner / 2,
          backgroundColor: C.card, alignItems: 'center', justifyContent: 'center',
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
        }}>
          <Animated.View style={[{ alignItems: 'center' }, { transform: [{ rotate }] }]}>
            <View style={{
              width: 0, height: 0,
              borderLeftWidth: headW, borderRightWidth: headW, borderBottomWidth: headH,
              borderStyle: 'solid',
              borderLeftColor: 'transparent', borderRightColor: 'transparent',
              borderBottomColor: C.brand,
            }} />
            <View style={{
              width: 0, height: 0,
              borderLeftWidth: tailW, borderRightWidth: tailW, borderTopWidth: tailH,
              borderStyle: 'solid',
              borderLeftColor: 'transparent', borderRightColor: 'transparent',
              borderTopColor: 'rgba(26, 29, 110, 0.35)',
            }} />
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

function FindMyCarContent() {
  const { nav, isLoading, hasTarget } = useFindMyCar();

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color={C.brand} />
      </SafeAreaView>
    );
  }

  if (!hasTarget || !nav) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <MaterialCommunityIcons name="map-marker-off-outline" size={56} color={C.textMuted} />
        <Text style={styles.emptyTitle}>No Saved Location</Text>
        <Text style={styles.emptySubtitle}>
          Save your parking spot first using the P button on the home screen.
        </Text>
      </SafeAreaView>
    );
  }

  const floorDeltaLabel =
    nav.floorDelta !== null && nav.floorDelta !== 0
      ? `Vehicle is ${Math.abs(nav.floorDelta)} floor${Math.abs(nav.floorDelta) > 1 ? 's' : ''} ${nav.floorDelta > 0 ? 'below' : 'above'} you`
      : nav.floorDelta === 0
        ? 'Vehicle is on the same floor'
        : null;

  const zoneLabel = [nav.targetLevel, nav.targetZone].filter(Boolean).join(', ') || '—';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <MaterialCommunityIcons name="parking" size={28} color={C.brand} />
          <Text style={styles.appName}>ParkSmart</Text>
        </View>
        <MaterialCommunityIcons name="access-point" size={24} color={C.brand} />
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {nav.position && nav.targetGps ? (
          <ParkingMapView
            userPosition={nav.position}
            targetPosition={nav.targetGps}
          />
        ) : (
          <View style={[styles.mapPlaceholder]}>
            <MaterialCommunityIcons name="map-outline" size={40} color={C.textMuted} />
            <Text style={styles.mapPlaceholderText}>Waiting for GPS…</Text>
          </View>
        )}

        {/* Indoor overlay badge */}
        {nav.mode === 'indoor' && (
          <View style={styles.indoorBadge}>
            <MaterialCommunityIcons name="wifi-off" size={13} color={C.indoorText} />
            <Text style={styles.indoorBadgeText}>Interior Mode</Text>
          </View>
        )}

        {/* Floor chip overlaid on map */}
        {floorDeltaLabel && (
          <View style={styles.floorChipOverlay}>
            <MaterialCommunityIcons
              name={nav.floorDelta! > 0 ? 'arrow-down' : 'arrow-up'}
              size={12}
              color={C.brand}
            />
            <Text style={styles.floorChipText}>{floorDeltaLabel}</Text>
          </View>
        )}
      </View>

      {/* Compass + distance row */}
      <View style={styles.navRow}>
        {/* Small compass */}
        <View style={styles.compassWrapper}>
          {nav.isArrived ? (
            <View style={styles.arrivedCircleOuter}>
              <View style={styles.arrivedCircleInner}>
                <MaterialCommunityIcons name="check-bold" size={28} color="#fff" />
              </View>
            </View>
          ) : (
            <CompassArrow relativeBearing={nav.relativeBearing ?? 0} size={100} />
          )}
        </View>

        {/* Direction */}
        <View style={styles.distanceBlock}>
          <Text style={nav.isArrived ? styles.arrivedLabel : styles.directionLabel}>
            {nav.directionLabel}
          </Text>
        </View>
      </View>

      {/* Debug panel — remove when compass is validated */}
      <View style={styles.debugRow}>
        <Text style={styles.debugText}>hdg {nav.compassHeading}°</Text>
        <Text style={styles.debugSep}>·</Text>
        <Text style={styles.debugText}>brg {nav.bearing !== null ? `${Math.round(nav.bearing)}°` : '—'}</Text>
        <Text style={styles.debugSep}>·</Text>
        <Text style={styles.debugText}>rel {nav.relativeBearing !== null ? `${Math.round(nav.relativeBearing)}°` : '—'}</Text>
        <Text style={styles.debugSep}>·</Text>
        <Text style={styles.debugText}>gps {nav.mode}</Text>
      </View>

      {/* Info cards */}
      <View style={styles.infoRow}>
        <View style={[styles.infoCard, { marginRight: 8 }]}>
          <View style={styles.infoIconCircle}>
            <MaterialCommunityIcons name="map-marker-outline" size={16} color={C.brand} />
          </View>
          <Text style={styles.infoLabel}>ZONE</Text>
          <Text style={styles.infoValue}>{zoneLabel}</Text>
        </View>
        <View style={[styles.infoCard, { marginLeft: 8 }]}>
          <View style={styles.infoIconCircle}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={C.brand} />
          </View>
          <Text style={styles.infoLabel}>PARKED</Text>
          <Text style={styles.infoValue}>{timeAgo(nav.savedAt)}</Text>
        </View>
      </View>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <MaterialCommunityIcons name="shimmer" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default function FindMyCarScreen() {
  return (
    <FindMyCarProvider>
      <FindMyCarContent />
    </FindMyCarProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  centered: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  appName: { fontSize: 20, fontWeight: '700', color: C.brand, letterSpacing: 0.3 },

  // Map
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: C.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapPlaceholderText: {
    fontSize: 13,
    color: C.textMuted,
  },

  // Overlays on the map
  indoorBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.indoorBg,
    borderWidth: 1,
    borderColor: C.indoorBorder,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  indoorBadgeText: { fontSize: 12, fontWeight: '600', color: C.indoorText },
  floorChipOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.card,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  floorChipText: { fontSize: 12, fontWeight: '500', color: C.textPrimary },

  // Nav row (compass + distance)
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 16,
  },
  compassWrapper: { alignItems: 'center', justifyContent: 'center' },

  distanceBlock: { flex: 1, alignItems: 'flex-start', gap: 4 },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: C.brand,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  distanceNumber: { fontSize: 28, fontWeight: '800', color: '#fff', lineHeight: 32 },
  distanceUnit: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.85)', letterSpacing: 1 },
  directionLabel: { fontSize: 18, fontWeight: '700', color: C.textPrimary, letterSpacing: 1.5 },
  arrivedLabel: { fontSize: 18, fontWeight: '700', color: '#2E7D32', letterSpacing: 1.5 },
  arrivedPill: { backgroundColor: '#4CAF50' },
  arrivedCircleOuter: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center',
  },
  arrivedCircleInner: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },

  // Info cards
  infoRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16 },
  infoCard: {
    flex: 1, backgroundColor: C.card, borderRadius: 14,
    padding: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  infoIconCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  infoLabel: { fontSize: 10, fontWeight: '700', color: C.textMuted, letterSpacing: 1.2, marginBottom: 2 },
  infoValue: { fontSize: 12, fontWeight: '700', color: C.textPrimary, textAlign: 'center' },

  // FAB
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center',
    elevation: 6, shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.22, shadowRadius: 6,
  },

  // Debug
  debugRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  debugText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: C.textMuted,
    backgroundColor: C.card,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  debugSep: { fontSize: 11, color: C.border },

  // Empty state
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.textPrimary, marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: C.textSecondary, textAlign: 'center', lineHeight: 20 },
});
