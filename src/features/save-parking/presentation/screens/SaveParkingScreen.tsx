import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHome } from '@/src/features/home/presentation/context/homeContext';
import React, { useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SensorStatus } from '@/src/shared/domain/entities/SavedParking';
import { SaveParkingProvider, useSaveParking } from '../context/saveParkingContext';

const C = {
  brand: '#1A1D6E',
  bg: '#EEEEF8',
  cardBg: '#FFFFFF',
  green: '#4CAF50',
  greenBg: '#E8F5E9',
  greenDark: '#2E7D32',
  activeBg: '#E8F5E9',
  activeText: '#2E7D32',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B6B8A',
  textMuted: '#9898B0',
  mapBg: '#3A4A5C',
  mapRoad: '#4A5A6C',
};

function StatusBadge({ status }: { status: SensorStatus }) {
  const active = status === 'active';
  return (
    <View style={[styles.badge, active ? styles.badgeActive : styles.badgeCalibrating]}>
      <Text style={[styles.badgeText, active ? styles.badgeTextActive : styles.badgeTextCalibrating]}>
        {active ? 'ACTIVE' : status.toUpperCase()}
      </Text>
    </View>
  );
}

function MapPlaceholder({ lat, lon }: { lat: number; lon: number }) {
  return (
    <View style={styles.map}>
      {/* Road lines */}
      <View style={[styles.road, styles.roadH, { top: '35%' }]} />
      <View style={[styles.road, styles.roadH, { top: '65%' }]} />
      <View style={[styles.road, styles.roadV, { left: '30%' }]} />
      <View style={[styles.road, styles.roadV, { left: '70%' }]} />

      {/* Surrounding P markers */}
      {[{ top: '20%', left: '15%' }, { top: '20%', left: '60%' }, { top: '55%', left: '75%' }].map((pos, i) => (
        <View key={i} style={[styles.pMarker, pos as any]}>
          <Text style={styles.pMarkerText}>P</Text>
        </View>
      ))}

      {/* Current position dot */}
      <View style={styles.positionRing}>
        <View style={styles.positionDot} />
      </View>

      {/* Position locked badge */}
      <View style={styles.positionLockedBadge}>
        <MaterialCommunityIcons name="crosshairs-gps" size={12} color={C.green} />
        <Text style={styles.positionLockedText}>POSITION LOCKED</Text>
      </View>
    </View>
  );
}

function SaveParkingContent({ navigation }: { navigation: any }) {
  const { sensors, save, isSaving, error } = useSaveParking();
  const { gps, compass, barometer } = sensors;
  const hasSaved = useRef(false);

  useEffect(() => {
    if (
      !hasSaved.current &&
      gps.status === 'active' &&
      barometer.status === 'active' &&
      compass.stable
    ) {
      hasSaved.current = true;
      save();
    }
  }, [gps.status, barometer.status, compass.stable]);

  const latLabel = gps.latitude !== 0
    ? `${Math.abs(gps.latitude).toFixed(4)}° ${gps.latitude >= 0 ? 'N' : 'S'}`
    : '--';
  const lonLabel = gps.longitude !== 0
    ? `${Math.abs(gps.longitude).toFixed(4)}° ${gps.longitude >= 0 ? 'E' : 'W'}`
    : '--';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>ParkSmart</Text>
          <MaterialCommunityIcons name="access-point" size={24} color={C.brand} />
        </View>

        {/* Success / saving / error */}
        <View style={styles.successSection}>
          <View style={[styles.successIconCircle, error ? styles.errorIconCircle : undefined]}>
            {isSaving
              ? <MaterialCommunityIcons name="loading" size={36} color="#fff" />
              : error
                ? <MaterialCommunityIcons name="alert-outline" size={36} color="#fff" />
                : <MaterialCommunityIcons name="check-bold" size={36} color="#fff" />}
          </View>
          <Text style={styles.successTitle}>
            {isSaving ? 'Saving...' : error ? 'Save Failed' : 'Parking Saved!'}
          </Text>
          <Text style={[styles.successSubtitle, error ? styles.errorText : undefined]}>
            {error ?? 'Precision location data has been encrypted\nand stored.'}
          </Text>
        </View>

        {/* Map */}
        <MapPlaceholder lat={gps.latitude} lon={gps.longitude} />

        {/* GPS + Magnetometer row */}
        <View style={styles.sensorRow}>
          <View style={[styles.sensorCard, { marginRight: 8 }]}>
            <View style={styles.sensorCardHeader}>
              <View style={styles.sensorIconCircle}>
                <MaterialCommunityIcons name="map-marker-outline" size={18} color={C.brand} />
              </View>
              <StatusBadge status={gps.status} />
            </View>
            <Text style={styles.sensorLabel}>GPS (Lat/Lon)</Text>
            <Text style={styles.sensorValue}>{latLabel}</Text>
            <Text style={styles.sensorValue}>{lonLabel}</Text>
          </View>

          <View style={[styles.sensorCard, { marginLeft: 8 }]}>
            <View style={styles.sensorCardHeader}>
              <View style={styles.sensorIconCircle}>
                <MaterialCommunityIcons name="compass-outline" size={18} color={C.brand} />
              </View>
              <StatusBadge status={compass.status} />
            </View>
            <Text style={styles.sensorLabel}>Magnetometer</Text>
            <Text style={styles.sensorValue}>
              {compass.degrees}° {compass.direction}
            </Text>
            <Text style={styles.sensorSubValue}>
              {compass.stable ? 'Heading Stable' : 'Calibrating...'}
            </Text>
          </View>
        </View>

        {/* Barometer */}
        <View style={styles.barometerCard}>
          <View style={styles.barometerHeader}>
            <View style={styles.barometerLeft}>
              <MaterialCommunityIcons name="gauge" size={20} color={C.brand} />
              <Text style={styles.sensorLabel}>Barometer (Pressure)</Text>
            </View>
            <Text style={styles.barometerValue}>
              {barometer.pressure > 0 ? `${barometer.pressure} hPa` : '--'}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {
              width: barometer.pressure > 0
                ? `${Math.min(((barometer.pressure - 980) / 60) * 100, 100)}%`
                : '0%'
            }]} />
          </View>
          <Text style={styles.barometerSubtitle}>
            {barometer.status === 'active'
              ? `Altitude calibration complete (${barometer.altitudeLevel})`
              : 'Calibrating barometer...'}
          </Text>
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="home-outline" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Return to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>View Parking History</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function SaveParkingScreen({ navigation }: { navigation: any }) {
  const { activeSession } = useHome();
  return (
    <SaveParkingProvider session={activeSession ?? undefined}>
      <SaveParkingContent navigation={navigation} />
    </SaveParkingProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  container: { paddingHorizontal: 20, paddingBottom: 32 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  appName: { fontSize: 20, fontWeight: '700', color: C.brand },

  // Success
  successSection: { alignItems: 'center', paddingVertical: 20 },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  errorIconCircle: { backgroundColor: '#E53935' },
  successTitle: { fontSize: 24, fontWeight: '800', color: C.textPrimary, marginBottom: 8 },
  successSubtitle: { fontSize: 14, color: C.textSecondary, textAlign: 'center', lineHeight: 20 },
  errorText: { color: '#E53935' },

  // Map
  map: {
    height: 170,
    borderRadius: 14,
    backgroundColor: C.mapBg,
    marginBottom: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  road: { position: 'absolute', backgroundColor: C.mapRoad },
  roadH: { left: 0, right: 0, height: 10 },
  roadV: { top: 0, bottom: 0, width: 10 },
  pMarker: {
    position: 'absolute',
    backgroundColor: '#5B7FA6',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  pMarkerText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  positionRing: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 36,
    height: 36,
    marginLeft: -18,
    marginTop: -18,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(100,160,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#4A90D9' },
  positionLockedBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  positionLockedText: { color: C.green, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  // Sensor cards row
  sensorRow: { flexDirection: 'row', marginBottom: 12 },
  sensorCard: {
    flex: 1,
    backgroundColor: C.cardBg,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  sensorCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sensorIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensorLabel: { fontSize: 12, color: C.textSecondary, marginBottom: 4 },
  sensorValue: { fontSize: 14, fontWeight: '700', color: C.textPrimary },
  sensorSubValue: { fontSize: 12, color: C.textSecondary, marginTop: 2 },

  // Badge
  badge: { borderRadius: 20, paddingHorizontal: 7, paddingVertical: 3 },
  badgeActive: { backgroundColor: C.activeBg },
  badgeCalibrating: { backgroundColor: '#FFF8E1' },
  badgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  badgeTextActive: { color: C.activeText },
  badgeTextCalibrating: { color: '#F57F17' },

  // Barometer
  barometerCard: {
    backgroundColor: C.cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  barometerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  barometerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barometerValue: { fontSize: 15, fontWeight: '700', color: C.green },
  progressBar: { height: 5, backgroundColor: '#E0E0E0', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: C.green, borderRadius: 3 },
  barometerSubtitle: { fontSize: 12, color: C.textSecondary },

  // Buttons
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.brand,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 12,
  },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.brand,
    paddingVertical: 14,
    backgroundColor: C.cardBg,
  },
  secondaryButtonText: { color: C.brand, fontSize: 15, fontWeight: '600' },
});
