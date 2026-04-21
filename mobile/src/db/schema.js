import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'expenses',
      columns: [
        { name: 'server_id', type: 'string', isOptional: true },
        { name: 'group_id', type: 'string' },
        { name: 'payer_id', type: 'string' },
        { name: 'payer_name', type: 'string' },
        { name: 'amount', type: 'number' },
        { name: 'type', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'expense_date', type: 'string' },
        { name: 'sync_id', type: 'string' },
        { name: 'is_synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'expense_splits',
      columns: [
        { name: 'expense_id', type: 'string' },
        { name: 'user_id', type: 'string' },
        { name: 'user_name', type: 'string' },
        { name: 'amount_owed', type: 'number' },
        { name: 'is_synced', type: 'boolean' },
      ],
    }),
  ],
});
