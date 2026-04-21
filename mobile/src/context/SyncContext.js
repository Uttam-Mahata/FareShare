import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { syncNow } from '../sync/SyncManager';
import { useAuth } from './AuthContext';

const SyncContext = createContext(null);

export function SyncProvider({ children }) {
  const { groupId } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  const doSync = useCallback(async () => {
    if (!groupId || syncing) return;
    setSyncing(true);
    try {
      await syncNow(groupId);
      setLastSynced(new Date());
    } catch (e) {
      console.warn('Sync failed:', e.message);
    } finally {
      setSyncing(false);
    }
  }, [groupId, syncing]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(!!state.isConnected);
      if (state.isConnected && groupId) doSync();
    });
    return () => unsubscribe();
  }, [groupId]);

  return (
    <SyncContext.Provider value={{ syncing, lastSynced, isOnline, doSync }}>
      {children}
    </SyncContext.Provider>
  );
}

export const useSync = () => useContext(SyncContext);
