import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators';

export default class Expense extends Model {
  static table = 'expenses';
  static associations = {
    expense_splits: { type: 'has_many', foreignKey: 'expense_id' },
  };

  @field('server_id') serverId;
  @field('group_id') groupId;
  @field('payer_id') payerId;
  @field('payer_name') payerName;
  @field('amount') amount;
  @field('type') type;
  @field('description') description;
  @field('expense_date') expenseDate;
  @field('sync_id') syncId;
  @field('is_synced') isSynced;
  @readonly @date('created_at') createdAt;
  @date('updated_at') updatedAt;

  @children('expense_splits') splits;
}
