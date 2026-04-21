import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Q } from '@nozbe/watermelondb';
import database from '../db/database';
import { useSync } from '../context/SyncContext';
import OfflineBanner from '../components/OfflineBanner';

function TypeIcon({ type, size = 24, color = '#1a73e8' }) {
  const map = {
    BUS:   { lib: 'Ionicons',      name: 'bus' },
    LUNCH: { lib: 'Ionicons',      name: 'restaurant' },
    CAB:   { lib: 'MaterialIcons', name: 'local-taxi' },
    OTHER: { lib: 'Ionicons',      name: 'cash' },
  };
  const cfg = map[type] || map.OTHER;
  if (cfg.lib === 'MaterialIcons') return <MaterialIcons name={cfg.name} size={size} color={color} />;
  return <Ionicons name={cfg.name} size={size} color={color} />;
}

const TYPE_BG = { BUS: '#e8f0fe', LUNCH: '#fce8e6', CAB: '#fff3e0', OTHER: '#e8f5e9' };
const TYPE_COLOR = { BUS: '#1a73e8', LUNCH: '#d93025', CAB: '#f57c00', OTHER: '#34a853' };

export default function HistoryScreen() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const { doSync, syncing } = useSync();

  const load = async () => {
    setLoading(true);
    try {
      const expenses = await database.get('expenses')
        .query(Q.sortBy('created_at', Q.desc))
        .fetch();
      const grouped = {};
      expenses.forEach(e => {
        const date = e.expenseDate || 'Unknown';
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(e);
      });
      setSections(Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'Unknown') return dateStr;
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <OfflineBanner />
      <FlatList
        data={sections}
        keyExtractor={([date]) => date}
        refreshControl={
          <RefreshControl
            refreshing={loading || syncing}
            onRefresh={() => { doSync(); load(); }}
            tintColor="#1a73e8"
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.center}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="receipt-outline" size={40} color="#1a73e8" />
            </View>
            <Text style={styles.emptyTitle}>No expenses yet</Text>
            <Text style={styles.emptySubtitle}>Add your first expense from the Add tab</Text>
          </View>
        )}
        renderItem={({ item: [date, expenses] }) => (
          <View style={styles.section}>
            <View style={styles.dateHeaderRow}>
              <Ionicons name="calendar-outline" size={14} color="#aaa" style={{ marginRight: 6 }} />
              <Text style={styles.dateHeader}>{formatDate(date)}</Text>
            </View>
            {expenses.map(e => (
              <View key={e.id} style={styles.expenseCard}>
                <View style={[styles.typeIconBox, { backgroundColor: TYPE_BG[e.type] || '#f0f0f0' }]}>
                  <TypeIcon type={e.type} size={22} color={TYPE_COLOR[e.type] || '#666'} />
                </View>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseDesc} numberOfLines={1}>
                    {e.description || e.type}
                  </Text>
                  <View style={styles.expenseMeta}>
                    <Ionicons name="person-outline" size={12} color="#aaa" style={{ marginRight: 3 }} />
                    <Text style={styles.expenseMetaText}>{e.payerName}</Text>
                  </View>
                </View>
                <View style={styles.expenseRight}>
                  <Text style={styles.expenseAmt}>₹{parseFloat(e.amount).toFixed(2)}</Text>
                  {!e.isSynced && (
                    <View style={styles.unsyncedBadge}>
                      <Ionicons name="cloud-offline-outline" size={10} color="#f59e0b" />
                      <Text style={styles.unsyncedText}>Local</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f7fa' },
  center: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyIconBox: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#e8f0fe',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  emptySubtitle: { color: '#888', fontSize: 14 },
  section: { marginBottom: 4 },
  dateHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#f5f7fa' },
  dateHeader: { fontSize: 12, fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 },
  expenseCard: {
    marginHorizontal: 16, marginBottom: 6, backgroundColor: '#fff', borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3,
  },
  typeIconBox: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  expenseInfo: { flex: 1 },
  expenseDesc: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  expenseMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  expenseMetaText: { fontSize: 12, color: '#aaa' },
  expenseRight: { alignItems: 'flex-end' },
  expenseAmt: { fontSize: 16, fontWeight: 'bold', color: '#1a1a2e' },
  unsyncedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  unsyncedText: { fontSize: 10, color: '#f59e0b', fontWeight: '600' },
});
