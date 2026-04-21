import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStoredUser, logout as apiLogout } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [groupId, setGroupIdState] = useState(null);

  useEffect(() => {
    (async () => {
      const u = await getStoredUser();
      const gid = await AsyncStorage.getItem('group_id');
      setUser(u);
      setGroupIdState(gid);
      setLoading(false);
    })();
  }, []);

  const setGroup = async (id) => {
    await AsyncStorage.setItem('group_id', id);
    setGroupIdState(id);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    setGroupIdState(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, groupId, setGroup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
