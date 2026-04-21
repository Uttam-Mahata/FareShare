import client from './client';

export const createGroup = (name) =>
  client.post('/api/groups', { name }).then(r => r.data);

export const joinGroup = (inviteCode) =>
  client.post('/api/groups/join', { inviteCode }).then(r => r.data);

export const getMembers = (groupId) =>
  client.get(`/api/groups/${groupId}/members`).then(r => r.data);

export const getBalances = (groupId) =>
  client.get(`/api/groups/${groupId}/balances`).then(r => r.data);
