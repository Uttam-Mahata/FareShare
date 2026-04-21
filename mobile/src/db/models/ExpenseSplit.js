import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';

export default class ExpenseSplit extends Model {
  static table = 'expense_splits';
  static associations = {
    expenses: { type: 'belongs_to', key: 'expense_id' },
  };

  @field('expense_id') expenseId;
  @field('user_id') userId;
  @field('user_name') userName;
  @field('amount_owed') amountOwed;
  @field('is_synced') isSynced;

  @relation('expenses', 'expense_id') expense;
}
