import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ParkingHistoryItem } from '../../domain/entities/ParkingHistoryItem';
import { useHistory } from '../context/historyContext';

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
};

function formatDate(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  if (isYesterday) return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function HistoryCard({ item }: { item: ParkingHistoryItem }) {
  return (
    <View style={styles.card}>
      <View style={[styles.stripe, { backgroundColor: item.active ? C.green : C.textMuted }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardDate}>{formatDate(item.savedAt)}</Text>
          {item.active && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          )}
        </View>

        <Text style={styles.cardZone}>{item.zone ?? 'Unknown zone'}</Text>

        <View style={styles.cardMeta}>
          {item.level != null && (
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="layers-outline" size={14} color={C.textSecondary} />
              <Text style={styles.metaText}>Floor {item.level}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="compass-outline" size={14} color={C.textSecondary} />
            <Text style={styles.metaText}>{item.compassDirection}</Text>
          </View>
          {item.durationMinutes != null && (
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="clock-outline" size={14} color={C.textSecondary} />
              <Text style={styles.metaText}>{formatDuration(item.durationMinutes)}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export default function HistoryScreen({ navigation }: { navigation: any }) {
  const { history, isLoading, error, refresh } = useHistory();

  useEffect(() => {
    const unsub = navigation.addListener('focus', refresh);
    return unsub;
  }, [navigation, refresh]);

  if (isLoading && history.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color={C.brand} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <TouchableOpacity onPress={refresh} disabled={isLoading} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialCommunityIcons
            name="refresh"
            size={22}
            color={isLoading ? C.textMuted : C.brand}
          />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HistoryCard item={item} />}
        contentContainerStyle={history.length === 0 ? styles.emptyContainer : styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={refresh}
        refreshing={isLoading}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="history" size={56} color={C.textMuted} />
            <Text style={styles.emptyText}>No parking history yet</Text>
            <Text style={styles.emptySubtext}>Your saved parking sessions will appear here</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  centered: { alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: { fontSize: 22, fontWeight: '700', color: C.brand },

  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    padding: 12,
  },
  errorText: { color: '#D32F2F', fontSize: 13, fontWeight: '500' },

  listContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },

  card: {
    flexDirection: 'row',
    backgroundColor: C.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  stripe: { width: 4 },
  cardContent: { flex: 1, padding: 14 },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardDate: { fontSize: 12, color: C.textMuted, fontWeight: '500' },
  activeBadge: {
    backgroundColor: C.greenBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  activeBadgeText: { color: C.greenDark, fontSize: 11, fontWeight: '600' },
  cardZone: { fontSize: 17, fontWeight: '700', color: C.textPrimary, marginBottom: 10 },
  cardMeta: { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: C.textSecondary },

  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 80 },
  emptyText: { fontSize: 15, color: C.textMuted, fontWeight: '600' },
  emptySubtext: { fontSize: 13, color: C.textMuted },
});
