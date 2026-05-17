import { useSavedParkingList } from '@/src/features/save-parking/presentation/context/savedParkingListContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useParking } from '../context/parkingContext';

function formatAccuracy(meters: number | null): string {
  if (meters === null) return 'Unknown';
  return `${meters <= 5 ? 'High' : meters <= 20 ? 'Medium' : 'Low'} (±${Math.round(meters)}m)`;
}

const C = {
  brand: '#1A1D6E',
  bg: '#EEEEF8',
  cardBg: '#FFFFFF',
  green: '#4CAF50',
  greenBg: '#E8F5E9',
  greenDark: '#2E7D32',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B6B8A',
  textMuted: '#9898B0',
  border: '#E0E0F0',
  chargingIconBg: '#1A1D6E',
  outerCircle: '#DFE0F0',
};

export default function HomeScreen({ navigation }: { navigation: any }) {
  const { session, chargingInfo, isLoading, durationLabel, expiringInLabel, refresh } = useParking();
  const { latest: latestSaved, refresh: refreshSaved } = useSavedParkingList();

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      refresh();
      refreshSaved();
    });
    return unsub;
  }, [navigation, refresh, refreshSaved]);

  const orientation = latestSaved?.compass.direction ?? session?.orientation ?? '--';
  const accuracyLabel = latestSaved
    ? formatAccuracy(latestSaved.gps.accuracy)
    : (session?.accuracyLabel ?? '--');

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={C.brand} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <MaterialCommunityIcons name="parking" size={30} color={C.brand} />
            <Text style={styles.appName}>ParkSmart</Text>
          </View>
          <MaterialCommunityIcons name="access-point" size={26} color={C.brand} />
        </View>

        {/* ── Current Session Card ── */}
        {latestSaved && (
          <>
            <View style={styles.sessionCard}>
              <View style={styles.greenStripe} />
              <View style={styles.sessionContent}>
                <View style={styles.sessionTopRow}>
                  <Text style={styles.sessionLabel}>CURRENT SESSION</Text>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Active</Text>
                  </View>
                </View>
                <Text style={styles.sessionLocation}>
                  {latestSaved?.zone ?? session?.zone ?? '--'}
                </Text>
                <View style={styles.sessionMetaRow}>
                  <View>
                    <Text style={styles.metaLabel}>Duration</Text>
                    <Text style={styles.durationValue}>{durationLabel}</Text>
                  </View>
                  <View>
                    <Text style={styles.metaLabel}>Accuracy</Text>
                    <Text style={styles.metaValue}>{accuracyLabel}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* ── Orientation + Expiring In ── */}
            <View style={styles.infoRow}>
              <View style={[styles.infoCard, { marginRight: 8 }]}>
                <View style={styles.infoIconCircle}>
                  <MaterialCommunityIcons name="compass-outline" size={20} color={C.brand} />
                </View>
                <Text style={styles.infoLabel}>Orientation</Text>
                <Text style={styles.infoValue}>{orientation}</Text>
              </View>
              <View style={[styles.infoCard, { marginLeft: 8 }]}>
                <View style={styles.infoIconCircle}>
                  <MaterialCommunityIcons name="timer-outline" size={20} color={C.brand} />
                </View>
                <Text style={styles.infoLabel}>Expiring In</Text>
                <Text style={styles.infoValue}>{expiringInLabel}</Text>
              </View>
            </View>
          </>
        )}

        {/* ── Save Parking Button ── */}
        <View style={styles.pButtonWrapper}>
          <View style={[styles.pButtonOuter, !!latestSaved && styles.pButtonOuterDisabled]}>
            <TouchableOpacity
              style={[styles.pButtonInner, !!latestSaved && styles.pButtonInnerDisabled]}
              onPress={() => navigation.navigate('SaveParking')}
              activeOpacity={0.85}
              disabled={!!latestSaved}
            >
              <Text style={styles.pLetter}>P</Text>
              <Text style={styles.pLabel}>{latestSaved ? 'Active Session' : 'Save Parking'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Find My Car ── */}
        <TouchableOpacity
          style={styles.findCarButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Find')}
        >
          <MaterialCommunityIcons name="target" size={20} color={C.brand} />
          <Text style={styles.findCarText}>Find My Car</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  // Session Card
  sessionCard: {
    flexDirection: 'row',
    backgroundColor: C.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  greenStripe: {
    width: 4,
    backgroundColor: C.green,
  },
  sessionContent: {
    flex: 1,
    padding: 16,
  },
  sessionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textMuted,
    letterSpacing: 1,
  },
  activeBadge: {
    backgroundColor: C.greenBg,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  activeBadgeText: {
    color: C.greenDark,
    fontSize: 12,
    fontWeight: '600',
  },
  sessionLocation: {
    fontSize: 22,
    fontWeight: '700',
    color: C.textPrimary,
    marginBottom: 12,
  },
  sessionMetaRow: {
    flexDirection: 'row',
    gap: 32,
  },
  metaLabel: {
    fontSize: 12,
    color: C.textSecondary,
    marginBottom: 2,
  },
  durationValue: {
    fontSize: 16,
    fontWeight: '700',
    color: C.green,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textPrimary,
  },

  // Info Cards Row
  infoRow: {
    flexDirection: 'row',
    marginBottom: 28,
  },
  infoCard: {
    flex: 1,
    backgroundColor: C.cardBg,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  infoIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: C.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textPrimary,
  },

  // P Button
  pButtonWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pButtonOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: C.outerCircle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pButtonOuterDisabled: {
    opacity: 0.45,
  },
  pButtonInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: C.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pButtonInnerDisabled: {
    backgroundColor: C.textMuted,
  },
  pLetter: {
    fontSize: 54,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 60,
  },
  pLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
  },

  // Find My Car
  findCarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: C.brand,
    paddingVertical: 14,
    backgroundColor: C.cardBg,
    marginBottom: 20,
  },
  findCarText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.brand,
  },

  // Charging Card
  chargingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.cardBg,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  chargingIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: C.chargingIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chargingTextGroup: {
    flex: 1,
  },
  chargingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textPrimary,
  },
  chargingSubtitle: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 2,
  },
});
