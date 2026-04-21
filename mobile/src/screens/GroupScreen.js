import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList,
  Alert, ActivityIndicator, Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { createGroup, joinGroup, getMembers } from '../api/groups';
import OfflineBanner from '../components/OfflineBanner';

const AVATAR_COLORS = ['#1a73e8', '#34a853', '#ea4335', '#fbbc04', '#9c27b0', '#00bcd4'];
function avatarColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function GroupScreen() {
  const { user, groupId, setGroup, logout } = useAuth();
  const [members, setMembers] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('menu');

  useEffect(() => {
    if (groupId) loadMembers();
  }, [groupId]);

  const loadMembers = async () => {
    try {
      setMembers(await getMembers(groupId));
    } catch (e) {
      console.warn('Failed to load members:', e.message);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return Alert.alert('Error', 'Enter a group name');
    setLoading(true);
    try {
      const group = await createGroup(groupName.trim());
      setGroupInfo(group);
      await setGroup(group.id);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (inviteCode.trim().length !== 6) return Alert.alert('Error', 'Enter 6-character invite code');
    setLoading(true);
    try {
      const group = await joinGroup(inviteCode.trim().toUpperCase());
      setGroupInfo(group);
      await setGroup(group.id);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    Share.share({
      message: `Join my CommuteSplit group!\nInvite code: ${groupInfo?.inviteCode || ''}\nDownload CommuteSplit to track shared commute expenses.`,
    });
  };

  const confirmLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  if (groupId) {
    return (
      <SafeAreaView style={styles.safe}>
        <OfflineBanner />
        <FlatList
          data={members}
          keyExtractor={m => m.userId}
          ListHeaderComponent={() => (
            <View>
              <View style={styles.groupHeader}>
                <Text style={styles.headerLabel}>Your Group</Text>
                {groupInfo && (
                  <TouchableOpacity style={styles.inviteBox} onPress={handleShare} activeOpacity={0.8}>
                    <Text style={styles.inviteCode}>{groupInfo.inviteCode}</Text>
                    <View style={styles.inviteHintRow}>
                      <Ionicons name="share-social-outline" size={13} color="rgba(255,255,255,0.7)" style={{ marginRight: 4 }} />
                      <Text style={styles.inviteHint}>Tap to share invite code</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.membersHeader}>
                <Ionicons name="people-outline" size={16} color="#888" style={{ marginRight: 6 }} />
                <Text style={styles.sectionLabel}>Members ({members.length})</Text>
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.memberCard}>
              <View style={[styles.avatar, { backgroundColor: avatarColor(item.name) }]}>
                <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{item.name}</Text>
                <Text style={styles.memberEmail}>{item.email}</Text>
              </View>
              {item.userId === user?.id && (
                <View style={styles.youBadge}>
                  <Text style={styles.youBadgeText}>You</Text>
                </View>
              )}
            </View>
          )}
          ListFooterComponent={() => (
            <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
              <Ionicons name="log-out-outline" size={18} color="#ef4444" style={{ marginRight: 8 }} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <OfflineBanner />
      <View style={styles.container}>
        <View style={styles.titleSection}>
          <View style={styles.titleIconBox}>
            <Ionicons name="people" size={36} color="#1a73e8" />
          </View>
          <Text style={styles.pageTitle}>Set Up Your Group</Text>
          <Text style={styles.pageSubtitle}>Create a new group or join an existing one</Text>
        </View>

        {mode === 'menu' && (
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionCard} onPress={() => setMode('create')}>
              <View style={styles.optionIconBox}>
                <Ionicons name="add-circle" size={32} color="#fff" />
              </View>
              <Text style={styles.optionTitle}>Create Group</Text>
              <Text style={styles.optionDesc}>Start a new commute group</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionCard, styles.optionCardOutline]} onPress={() => setMode('join')}>
              <View style={[styles.optionIconBox, { backgroundColor: '#e8f0fe' }]}>
                <Ionicons name="link" size={32} color="#1a73e8" />
              </View>
              <Text style={[styles.optionTitle, { color: '#1a73e8' }]}>Join Group</Text>
              <Text style={styles.optionDesc}>Enter a 6-char invite code</Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'create' && (
          <View>
            <View style={styles.inputWrapper}>
              <Ionicons name="people-outline" size={20} color="#aaa" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.input} placeholder="e.g. B.Garden Gang"
                value={groupName} onChangeText={setGroupName} autoFocus
              />
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleCreate} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryBtnText}>Create Group</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMode('menu')} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={16} color="#1a73e8" style={{ marginRight: 4 }} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'join' && (
          <View>
            <TextInput
              style={styles.codeInput}
              placeholder="XXXXXX"
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
              maxLength={6}
              autoFocus
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleJoin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="enter-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryBtnText}>Join Group</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMode('menu')} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={16} color="#1a73e8" style={{ marginRight: 4 }} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
          <Ionicons name="log-out-outline" size={18} color="#ef4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f7fa' },
  container: { flex: 1, padding: 24 },
  titleSection: { alignItems: 'center', marginBottom: 32 },
  titleIconBox: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#e8f0fe',
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 6 },
  pageSubtitle: { color: '#888', textAlign: 'center' },
  optionsContainer: { gap: 14 },
  optionCard: {
    backgroundColor: '#1a73e8', borderRadius: 18, padding: 24, alignItems: 'center', gap: 8,
  },
  optionCardOutline: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#1a73e8' },
  optionIconBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  optionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  optionDesc: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e8e8e8', borderRadius: 12,
    paddingHorizontal: 14, backgroundColor: '#fff', marginBottom: 16,
  },
  input: { flex: 1, fontSize: 16, color: '#333', paddingVertical: 14 },
  codeInput: {
    borderWidth: 1.5, borderColor: '#e8e8e8', borderRadius: 12,
    padding: 16, fontSize: 28, backgroundColor: '#fff', marginBottom: 16,
    textAlign: 'center', letterSpacing: 10, fontWeight: 'bold', color: '#1a73e8',
  },
  primaryBtn: {
    backgroundColor: '#1a73e8', borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  backText: { color: '#1a73e8', fontSize: 15 },
  groupHeader: { backgroundColor: '#1a73e8', padding: 24 },
  headerLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: 14, textTransform: 'uppercase' },
  inviteBox: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, padding: 18, alignItems: 'center' },
  inviteCode: { fontSize: 34, fontWeight: 'bold', color: '#fff', letterSpacing: 10 },
  inviteHintRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  inviteHint: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  membersHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase' },
  memberCard: {
    marginHorizontal: 16, marginBottom: 8, backgroundColor: '#fff', borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center',
    elevation: 1,
  },
  avatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  memberEmail: { fontSize: 12, color: '#999', marginTop: 2 },
  youBadge: { backgroundColor: '#e8f0fe', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  youBadgeText: { color: '#1a73e8', fontSize: 12, fontWeight: '600' },
  logoutBtn: {
    marginTop: 'auto', marginHorizontal: 16, borderWidth: 1.5, borderColor: '#ef4444',
    borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  logoutText: { color: '#ef4444', fontWeight: '600', fontSize: 15 },
});
