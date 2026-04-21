import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { login, register } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const { setUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password) return Alert.alert('Error', 'Email and password required');
    if (!isLogin && !name.trim()) return Alert.alert('Error', 'Name is required');
    setLoading(true);
    try {
      const data = isLogin
        ? await login(email.trim(), password)
        : await register(name.trim(), email.trim(), password);
      setUser(data.user);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <Ionicons name="bus" size={64} color="#fff" />
          </View>
          <Text style={styles.title}>CommuteSplit</Text>
          <Text style={styles.subtitle}>Split commute expenses effortlessly</Text>

          {!isLogin && (
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
              <TextInput
                style={styles.input} placeholder="Full Name" placeholderTextColor="rgba(255,255,255,0.5)"
                value={name} onChangeText={setName} autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
            <TextInput
              style={styles.input} placeholder="Email" placeholderTextColor="rgba(255,255,255,0.5)"
              value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]} placeholder="Password" placeholderTextColor="rgba(255,255,255,0.5)"
              value={password} onChangeText={setPassword} secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#1a73e8" />
              : <Text style={styles.btnText}>{isLogin ? 'Login' : 'Create Account'}</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setName(''); }} style={styles.switchBtn}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.switchLink}>{isLogin ? 'Sign Up' : 'Login'}</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a73e8' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  logoContainer: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center',
    alignItems: 'center', alignSelf: 'center', marginBottom: 12,
  },
  title: { fontSize: 34, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginBottom: 36 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 14, paddingVertical: 4,
    marginBottom: 12,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#fff', paddingVertical: 12 },
  btn: { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#1a73e8', fontWeight: 'bold', fontSize: 16 },
  switchBtn: { marginTop: 24, alignItems: 'center' },
  switchText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  switchLink: { color: '#fff', fontWeight: 'bold' },
});
