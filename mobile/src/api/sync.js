import client from './client';

export const pushExpenses = (expenses) =>
  client.post('/api/sync/push', { expenses }).then(r => r.data);

export const pullExpenses = (groupId, since) =>
  client.get('/api/sync/pull', { params: { groupId, since } }).then(r => r.data);
