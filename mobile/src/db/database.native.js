import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './schema';
import Expense from './models/Expense';
import ExpenseSplit from './models/ExpenseSplit';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'commutesplit',
  jsi: true,
  onSetUpError: (error) => {
    console.error('WatermelonDB setup error:', error);
  },
});

const database = new Database({
  adapter,
  modelClasses: [Expense, ExpenseSplit],
});

export default database;
