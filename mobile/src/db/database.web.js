import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import schema from './schema';
import Expense from './models/Expense';
import ExpenseSplit from './models/ExpenseSplit';

const adapter = new LokiJSAdapter({
  schema,
  dbName: 'commutesplit',
  useWebWorker: false,
  useIncrementalIndexedDB: true,
  onSetUpError: (error) => {
    console.error('WatermelonDB setup error:', error);
  },
});

const database = new Database({
  adapter,
  modelClasses: [Expense, ExpenseSplit],
});

export default database;
