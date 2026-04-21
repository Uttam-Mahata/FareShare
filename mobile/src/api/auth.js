import client from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const register = async (name, email, password) => {
  const res = await client.post('/api/auth/register', { name, email, password });
  await AsyncStorage.setItem('jwt_token', res.data.token);
  await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
  return res.data;
};

export const login = async (email, password) => {
  const res = await client.post('/api/auth/login', { email, password });
  await AsyncStorage.setItem('jwt_token', res.data.token);
  await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
  return res.data;
};

export const logout = async () => {
  await AsyncStorage.multiRemove(['jwt_token', 'user', 'group_id', 'last_sync_at']);
};

export const getStoredUser = async () => {
  const u = await AsyncStorage.getItem('user');
  return u ? JSON.parse(u) : null;
};
