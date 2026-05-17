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

function CompassArrow({ relativeBearing }: { relativeBearing: number }) {
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

  return (
    <View style={styles.compassOuter}>
      <View style={styles.compassRing}>
        <View style={styles.compassInner}>
          <Animated.View
            style={[styles.arrowWrapper, { transform: [{ rotate }] }]}
          >
            <View style={styles.arrowHead} />
            <View style={styles.arrowTail} />
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
        <MaterialCommunityIcons
          name="map-marker-off-outline"
          size={56}
          color={C.textMuted}
        />
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

  const zoneLabel = [nav.targetLevel, nav.targetZone]
    .filter(Boolean)
    .join(', ') || '—';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <MaterialCommunityIcons name="parking" size={30} color={C.brand} />
          <Text style={styles.appName}>ParkSmart</Text>
        </View>
        <MaterialCommunityIcons name="access-point" size={26} color={C.brand} />
      </View>

      {/* Indoor mode banner */}
      {nav.mode === 'indoor' && (
        <View style={styles.indoorBanner}>
          <MaterialCommunityIcons
            name="wifi-off"
            size={18}
            color={C.indoorText}
            style={{ marginRight: 8 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.indoorTitle}>Interior Mode Active</Text>
            <Text style={styles.indoorBody}>
              GPS signal weak. Using Compass & Floor sensors only.
            </Text>
          </View>
        </View>
      )}

      {/* Floor delta chip */}
      {floorDeltaLabel && (
        <View style={styles.floorChipWrapper}>
          <View style={styles.floorChip}>
            <MaterialCommunityIcons
              name={nav.floorDelta! > 0 ? 'arrow-down' : 'arrow-up'}
              size={14}
              color={C.brand}
            />
            <Text style={styles.floorChipText}>{floorDeltaLabel}</Text>
          </View>
        </View>
      )}

      {/* Compass */}
      <View style={styles.compassSection}>
        <CompassArrow relativeBearing={nav.relativeBearing ?? 0} />
      </View>

      {/* Distance + direction */}
      <View style={styles.distanceSection}>
        {nav.distance !== null ? (
          <>
            <View style={styles.distancePill}>
              <Text style={styles.distanceNumber}>{nav.distance}</Text>
              <Text style={styles.distanceUnit}>METERS</Text>
            </View>
            <Text style={styles.directionLabel}>{nav.directionLabel}</Text>
          </>
        ) : (
          <>
            <View style={styles.distancePill}>
              <Text style={styles.distanceUnit}>LOCATING</Text>
            </View>
            <Text style={styles.directionLabel}>{nav.directionLabel}</Text>
          </>
        )}
      </View>

      {/* Info cards */}
      <View style={styles.infoRow}>
        <View style={[styles.infoCard, { marginRight: 8 }]}>
          <View style={styles.infoIconCircle}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={18}
              color={C.brand}
            />
          </View>
          <Text style={styles.infoLabel}>ZONE</Text>
          <Text style={styles.infoValue}>{zoneLabel}</Text>
        </View>
        <View style={[styles.infoCard, { marginLeft: 8 }]}>
          <View style={styles.infoIconCircle}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={18}
              color={C.brand}
            />
          </View>
          <Text style={styles.infoLabel}>PARKED</Text>
          <Text style={styles.infoValue}>{timeAgo(nav.savedAt)}</Text>
        </View>
      </View>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <MaterialCommunityIcons name="shimmer" size={26} color="#fff" />
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
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: C.brand,
    letterSpacing: 0.3,
  },

  // Indoor banner
  indoorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.indoorBg,
    borderLeftWidth: 4,
    borderLeftColor: C.indoorBorder,
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  indoorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.indoorText,
    marginBottom: 2,
  },
  indoorBody: {
    fontSize: 12,
    color: C.indoorText,
    lineHeight: 17,
  },

  // Floor chip
  floorChipWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  floorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.card,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  floorChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: C.textPrimary,
  },

  // Compass
  compassSection: {
    alignItems: 'center',
    marginVertical: 8,
  },
  compassOuter: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassRing: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: C.compassRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  arrowWrapper: {
    alignItems: 'center',
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 22,
    borderRightWidth: 22,
    borderBottomWidth: 54,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: C.brand,
  },
  arrowTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderTopWidth: 34,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(26, 29, 110, 0.35)',
  },

  // Distance
  distanceSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: C.brand,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    marginBottom: 8,
  },
  distanceNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 36,
  },
  distanceUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1,
  },
  directionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textSecondary,
    letterSpacing: 1.5,
  },

  // Info cards
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  infoIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textPrimary,
    textAlign: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.brand,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
  },

  // Empty state
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
