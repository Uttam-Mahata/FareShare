import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Alert, Modal, ActivityIndicator, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import { getMembers } from '../api/groups';
import database from '../db/database';
import { BUS_FARE } from '../config';

const TYPES = ['BUS', 'LUNCH', 'CAB', 'OTHER'];

const TYPE_CONFIG = {
  BUS:   { icon: 'bus',           lib: 'Ionicons',       label: 'Bus'   },
  LUNCH: { icon: 'restaurant',    lib: 'Ionicons',       label: 'Lunch' },
  CAB:   { icon: 'local-taxi',    lib: 'MaterialIcons',  label: 'Cab'   },
  OTHER: { icon: 'cash-outline',  lib: 'Ionicons',       label: 'Other' },
};

function TypeIcon({ type, size = 20, color = '#666' }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.OTHER;
  if (cfg.lib === 'MaterialIcons') return <MaterialIcons name={cfg.icon} size={size} color={color} />;
  return <Ionicons name={cfg.icon} size={size} color={color} />;
}

export default function AddExpenseScreen() {
  const { user, groupId } = useAuth();
  const { doSync } = useSync();
  const [members, setMembers] = useState([]);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('BUS');
  const [description, setDescription] = useState('');
  const [payerId, setPayerId] = useState('');
  const [splits, setSplits] = useState({});
  const [loading, setLoading] = useState(false);
  const [busModal, setBusModal] = useState(false);
  const [busParticipants, setBusParticipants] = useState({});

  useEffect(() => {
    if (groupId) loadMembers();
  }, [groupId]);

  const loadMembers = async () => {
    try {
      const data = await getMembers(groupId);
      setMembers(data);
      setPayerId(user?.id || '');
      const allOn = {};
      data.forEach(m => { allOn[m.userId] = true; });
      setSplits({ ...allOn });
      setBusParticipants({ ...allOn });
    } catch (e) {
      console.warn('Failed to load members:', e.message);
    }
  };

  const saveExpense = async (expAmount, expType, expDesc, expPayerId, expSplits) => {
    const selectedMembers = members.filter(m => expSplits[m.userId]);
    if (selectedMembers.length === 0) throw new Error('Select at least one person to split with');
    const perPerson = parseFloat(expAmount) / selectedMembers.length;
    const syncId = uuidv4();
    const today = new Date().toISOString().split('T')[0];
    const payerName = members.find(m => m.userId === expPayerId)?.name || user?.name || '';

    await database.write(async () => {
      const expense = await database.get('expenses').create(r => {
        r.groupId = groupId;
        r.payerId = expPayerId;
        r.payerName = payerName;
        r.amount = parseFloat(expAmount);
        r.type = expType;
        r.description = expDesc;
        r.expenseDate = today;
        r.syncId = syncId;
        r.isSynced = false;
        r.updatedAt = Date.now();
      });
      for (const m of selectedMembers) {
        await database.get('expense_splits').create(r => {
          r.expenseId = expense.id;
          r.userId = m.userId;
          r.userName = m.name;
          r.amountOwed = perPerson;
          r.isSynced = false;
        });
      }
    });
    doSync();
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return Alert.alert('Error', 'Enter a valid amount');
    }
    if (!payerId) return Alert.alert('Error', 'Select who paid');
    setLoading(true);
    try {
      await saveExpense(amount, type, description, payerId, splits);
      setAmount(''); setDescription('');
      Alert.alert('Saved', 'Expense saved locally. It will sync when online.');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickBus = async () => {
    const selected = members.filter(m => busParticipants[m.userId]);
    if (selected.length === 0) return Alert.alert('Error', 'Select at least one participant');
    const total = (BUS_FARE * selected.length).toFixed(2);
    setBusModal(false);
    setLoading(true);
    try {
      await saveExpense(total, 'BUS', `Bus fare (₹${BUS_FARE}/person)`, user?.id, busParticipants);
      Alert.alert('Saved', `Bus fare ₹${total} saved locally!`);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!groupId) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Ionicons name="people-outline" size={48} color="#bbb" />
          <Text style={styles.emptyText}>Join a group first to add expenses</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Quick Bus Button */}
        <TouchableOpacity style={styles.quickBusBtn} onPress={() => setBusModal(true)} disabled={loading}>
          <Ionicons name="bus" size={22} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.quickBusText}>Quick Add Bus  ₹{BUS_FARE}/person</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          {/* Amount */}
          <Text style={styles.label}>Amount (₹)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="cash-outline" size={20} color="#aaa" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input} value={amount} onChangeText={setAmount}
              keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#ccc"
            />
          </View>

          {/* Type */}
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeRow}>
            {TYPES.map(t => {
              const active = type === t;
              return (
                <TouchableOpacity key={t} style={[styles.typeBtn, active && styles.typeBtnActive]}
                  onPress={() => setType(t)}>
                  <TypeIcon type={t} size={20} color={active ? '#1a73e8' : '#888'} />
                  <Text style={[styles.typeBtnText, active && styles.typeBtnTextActive]}>
                    {TYPE_CONFIG[t].label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Description */}
          <Text style={styles.label}>Description (optional)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="create-outline" size={20} color="#aaa" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input} value={description} onChangeText={setDescription}
              placeholder="Lunch at Mainland China..." placeholderTextColor="#ccc"
            />
          </View>

          {/* Paid by */}
          <Text style={styles.label}>Paid by</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
            {members.map(m => (
              <TouchableOpacity key={m.userId}
                style={[styles.chip, payerId === m.userId && styles.chipActive]}
                onPress={() => setPayerId(m.userId)}>
                <Ionicons
                  name="person"
                  size={13}
                  color={payerId === m.userId ? '#fff' : '#888'}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.chipText, payerId === m.userId && styles.chipTextActive]}>
                  {m.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Split between */}
          <Text style={styles.label}>Split between</Text>
          {members.map(m => (
            <View key={m.userId} style={styles.splitRow}>
              <View style={styles.splitLeft}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>{m.name[0].toUpperCase()}</Text>
                </View>
                <Text style={styles.splitName}>{m.name}</Text>
              </View>
              <Switch
                value={!!splits[m.userId]}
                onValueChange={v => setSplits(prev => ({ ...prev, [m.userId]: v }))}
                trackColor={{ true: '#1a73e8', false: '#e0e0e0' }}
                thumbColor="#fff"
              />
            </View>
          ))}

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>Save Expense</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Quick Bus Modal */}
      <Modal visible={busModal} transparent animationType="slide" onRequestClose={() => setBusModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="bus" size={28} color="#1a73e8" />
              <Text style={styles.modalTitle}>Quick Bus Fare</Text>
            </View>
            <Text style={styles.modalSubtitle}>₹{BUS_FARE} per person — select who's traveling</Text>
            {members.map(m => (
              <View key={m.userId} style={styles.splitRow}>
                <View style={styles.splitLeft}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>{m.name[0].toUpperCase()}</Text>
                  </View>
                  <Text style={styles.splitName}>{m.name}</Text>
                </View>
                <Switch
                  value={!!busParticipants[m.userId]}
                  onValueChange={v => setBusParticipants(prev => ({ ...prev, [m.userId]: v }))}
                  trackColor={{ true: '#1a73e8', false: '#e0e0e0' }}
                  thumbColor="#fff"
                />
              </View>
            ))}
            <View style={styles.busTotalRow}>
              <Ionicons name="wallet-outline" size={18} color="#1a73e8" />
              <Text style={styles.busTotal}>
                Total: ₹{(BUS_FARE * members.filter(m => busParticipants[m.userId]).length).toFixed(2)}
              </Text>
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setBusModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, { flex: 1, marginTop: 0 }]} onPress={handleQuickBus}>
                <Text style={styles.submitBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f7fa' },
  scroll: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  emptyText: { color: '#999', fontSize: 16, textAlign: 'center' },
  quickBusBtn: {
    backgroundColor: '#1a73e8', borderRadius: 14, padding: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  quickBusText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 20, elevation: 2 },
  label: {
    fontWeight: '700', color: '#555', marginBottom: 8, marginTop: 16,
    fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#eee', borderRadius: 10,
    paddingHorizontal: 12, backgroundColor: '#fafafa',
  },
  input: { flex: 1, fontSize: 16, color: '#333', paddingVertical: 13 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#eee', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center', gap: 4, backgroundColor: '#fafafa',
  },
  typeBtnActive: { backgroundColor: '#e8f0fe', borderColor: '#1a73e8' },
  typeBtnText: { fontSize: 11, fontWeight: '700', color: '#888' },
  typeBtnTextActive: { color: '#1a73e8' },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#eee', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, backgroundColor: '#fafafa',
  },
  chipActive: { backgroundColor: '#1a73e8', borderColor: '#1a73e8' },
  chipText: { fontWeight: '600', color: '#666', fontSize: 14 },
  chipTextActive: { color: '#fff' },
  splitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  splitLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  memberAvatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#1a73e8',
    justifyContent: 'center', alignItems: 'center',
  },
  memberAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  splitName: { fontSize: 15, color: '#333' },
  submitBtn: {
    backgroundColor: '#1a73e8', borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20,
  },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a2e' },
  modalSubtitle: { color: '#888', marginBottom: 20, fontSize: 14 },
  busTotalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginVertical: 16 },
  busTotal: { fontSize: 20, fontWeight: 'bold', color: '#1a73e8' },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 12,
    padding: 14, alignItems: 'center',
  },
  cancelBtnText: { color: '#666', fontWeight: '600' },
});
