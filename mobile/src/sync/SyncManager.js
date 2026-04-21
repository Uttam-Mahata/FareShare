import { Q } from '@nozbe/watermelondb';
import AsyncStorage from '@react-native-async-storage/async-storage';
import database from '../db/database';
import { pushExpenses, pullExpenses } from '../api/sync';
import { v4 as uuidv4 } from 'uuid';

const SYNC_KEY = 'last_sync_at';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function withRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      const wait = Math.pow(2, i) * 5000;
      console.log(`Sync retry ${i + 1}/${retries} in ${wait}ms...`);
      await sleep(wait);
    }
  }
}

export async function syncNow(groupId) {
  if (!groupId) return;

  // Push unsynced local expenses
  const unsyncedExpenses = await database.get('expenses')
    .query(Q.where('is_synced', false))
    .fetch();

  if (unsyncedExpenses.length > 0) {
    const unsyncedSplits = await database.get('expense_splits')
      .query(Q.where('is_synced', false))
      .fetch();

    const splitsByExpense = {};
    unsyncedSplits.forEach(s => {
      if (!splitsByExpense[s.expenseId]) splitsByExpense[s.expenseId] = [];
      splitsByExpense[s.expenseId].push(s);
    });

    const payload = unsyncedExpenses.map(e => ({
      syncId: e.syncId,
      groupId: e.groupId,
      payerId: e.payerId,
      amount: e.amount,
      type: e.type,
      description: e.description || '',
      expenseDate: e.expenseDate,
      splits: (splitsByExpense[e.id] || []).map(s => ({
        userId: s.userId,
        amountOwed: s.amountOwed,
      })),
    }));

    await withRetry(() => pushExpenses(payload));

    await database.write(async () => {
      for (const e of unsyncedExpenses) {
        await e.update(r => { r.isSynced = true; });
      }
      for (const s of unsyncedSplits) {
        await s.update(r => { r.isSynced = true; });
      }
    });
  }

  // Pull new expenses from server
  const lastSync = (await AsyncStorage.getItem(SYNC_KEY)) || '1970-01-01T00:00:00Z';
  const result = await withRetry(() => pullExpenses(groupId, lastSync));

  if (result.expenses?.length > 0) {
    await database.write(async () => {
      for (const e of result.expenses) {
        const existing = await database.get('expenses')
          .query(Q.where('sync_id', String(e.syncId)))
          .fetch();
        if (existing.length > 0) continue;

        const newExpense = await database.get('expenses').create(r => {
          r.serverId = e.id;
          r.groupId = e.groupId;
          r.payerId = e.payerId;
          r.payerName = e.payerName;
          r.amount = parseFloat(e.amount);
          r.type = e.type;
          r.description = e.description || '';
          r.expenseDate = e.expenseDate;
          r.syncId = e.syncId;
          r.isSynced = true;
          r.updatedAt = new Date(e.updatedAt).getTime();
        });

        for (const s of e.splits || []) {
          await database.get('expense_splits').create(r => {
            r.expenseId = newExpense.id;
            r.userId = s.userId;
            r.userName = s.userName;
            r.amountOwed = parseFloat(s.amountOwed);
            r.isSynced = true;
          });
        }
      }
    });
  }

  await AsyncStorage.setItem(SYNC_KEY, result.pulledAt || new Date().toISOString());
}
