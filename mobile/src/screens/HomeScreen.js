import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import { getBalances } from '../api/groups';
import OfflineBanner from '../components/OfflineBanner';

export default function HomeScreen({ navigation }) {
  const { user, groupId } = useAuth();
  const { doSync, syncing, isOnline } = useSync();
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadBalances = useCallback(async () => {
    if (!groupId || !isOnline) return;
    setLoading(true);
    try {
      const data = await getBalances(groupId);
      setBalances(data.balances || []);
    } catch (e) {
      console.warn('Balance fetch failed:', e.message);
    } finally {
      setLoading(false);
    }
  }, [groupId, isOnline]);

  useEffect(() => { loadBalances(); }, [groupId, isOnline]);

  const iOwe = balances.filter(b => b.fromUserId === user?.id);
  const owedToMe = balances.filter(b => b.toUserId === user?.id);
  const myBalances = [...iOwe, ...owedToMe];

  if (!groupId) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="people-outline" size={48} color="#1a73e8" />
          </View>
          <Text style={styles.emptyTitle}>No Group Yet</Text>
          <Text style={styles.emptySubtitle}>Create or join a group to start tracking expenses</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => navigation.navigate('Group')}>
            <Ionicons name="add-circle-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.ctaBtnText}>Set Up Group</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <OfflineBanner />
      <FlatList
        data={myBalances}
        keyExtractor={(_, i) => i.toString()}
        refreshControl={
          <RefreshControl
            refreshing={loading || syncing}
            onRefresh={() => { doSync(); loadBalances(); }}
            tintColor="#1a73e8"
          />
        }
        ListHeaderComponent={() => (
          <View>
            <View style={styles.header}>
              <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]}</Text>
              <Ionicons name="hand-right-outline" size={22} color="#1a73e8" />
            </View>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { backgroundColor: '#e8f5e9' }]}>
                <Ionicons name="arrow-down-circle-outline" size={22} color="#2e7d32" />
                <Text style={styles.summaryLabel}>You'll receive</Text>
                <Text style={[styles.summaryAmt, { color: '#2e7d32' }]}>
                  ₹{owedToMe.reduce((s, b) => s + parseFloat(b.amount), 0).toFixed(2)}
                </Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: '#ffebee' }]}>
                <Ionicons name="arrow-up-circle-outline" size={22} color="#c62828" />
                <Text style={styles.summaryLabel}>You owe</Text>
                <Text style={[styles.summaryAmt, { color: '#c62828' }]}>
                  ₹{iOwe.reduce((s, b) => s + parseFloat(b.amount), 0).toFixed(2)}
                </Text>
              </View>
            </View>
            {myBalances.length === 0 && (
              <View style={styles.settledBox}>
                <Ionicons name="checkmark-circle" size={36} color="#34a853" />
                <Text style={styles.settledText}>All settled up!</Text>
              </View>
            )}
            {myBalances.length > 0 && <Text style={styles.sectionLabel}>Balances</Text>}
          </View>
        )}
        renderItem={({ item }) => {
          const isDebtor = item.fromUserId === user?.id;
          return (
            <View style={styles.balanceCard}>
              <View style={[styles.balanceIcon, { backgroundColor: isDebtor ? '#ffebee' : '#e8f5e9' }]}>
                <Ionicons
                  name={isDebtor ? 'arrow-up' : 'arrow-down'}
                  size={18}
                  color={isDebtor ? '#c62828' : '#2e7d32'}
                />
              </View>
              <Text style={styles.balanceName}>
                {isDebtor ? `You → ${item.toUserName}` : `${item.fromUserName} → You`}
              </Text>
              <Text style={[styles.balanceAmt, { color: isDebtor ? '#c62828' : '#2e7d32' }]}>
                ₹{parseFloat(item.amount).toFixed(2)}
              </Text>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f7fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIconBox: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: '#e8f0fe',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  emptySubtitle: { color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  ctaBtn: {
    backgroundColor: '#1a73e8', borderRadius: 12, paddingVertical: 14,
    paddingHorizontal: 28, flexDirection: 'row', alignItems: 'center',
  },
  ctaBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e' },
  summaryRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 12 },
  summaryCard: { flex: 1, borderRadius: 16, padding: 16, gap: 6 },
  summaryLabel: { fontSize: 12, color: '#555' },
  summaryAmt: { fontSize: 22, fontWeight: 'bold' },
  settledBox: { margin: 20, padding: 24, backgroundColor: '#fff', borderRadius: 16, alignItems: 'center', gap: 8 },
  settledText: { fontSize: 16, color: '#555', fontWeight: '600' },
  sectionLabel: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase' },
  balanceCard: {
    marginHorizontal: 20, marginBottom: 8, backgroundColor: '#fff', borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4,
  },
  balanceIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  balanceName: { fontSize: 15, color: '#333', flex: 1 },
  balanceAmt: { fontSize: 17, fontWeight: 'bold' },
});
