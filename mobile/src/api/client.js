import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000,
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('jwt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  res => res,
  async (err) => {
    if (err.response?.status === 503) {
      await new Promise(r => setTimeout(r, 15000));
      return client.request(err.config);
    }
    return Promise.reject(err);
  }
);

export default client;
