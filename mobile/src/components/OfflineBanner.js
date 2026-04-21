import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSync } from '../context/SyncContext';

export default function OfflineBanner() {
  const { isOnline, syncing } = useSync();
  if (isOnline && !syncing) return null;
  return (
    <View style={[styles.banner, { backgroundColor: isOnline ? '#f59e0b' : '#ef4444' }]}>
      <Ionicons
        name={syncing ? 'sync' : 'cloud-offline-outline'}
        size={15}
        color="#fff"
        style={{ marginRight: 6 }}
      />
      <Text style={styles.text}>
        {syncing ? 'Syncing...' : 'Offline — changes saved locally'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { paddingVertical: 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
