import client from './client';

export const authApi = {
  login: (credentials) => client.post('/auth/login', credentials),
  me: () => client.get('/auth/me'),
};

export const dashboardApi = {
  getStats: (unit) => client.get('/dashboard/stats', { params: { unit } }),
  getActivity: () => client.get('/dashboard/activity'),
};

export const reelsApi = {
  getAll: (unit) => client.get('/reels', { params: { unit } }),
  getById: (id) => client.get(`/reels/${id}`),
  recommend: (data, unit) => client.post('/reels/recommend', data, { params: { unit } }),
  splitPlan: (data, unit) => client.post('/reels/split-plan', data, { params: { unit } }),
};

export const jobsApi = {
  getAll: (unit, reel) => client.get('/jobs', { params: { unit, reel } }),
  calculate: (data) => client.post('/jobs/calculate', data),
  execute: (data) => client.post('/jobs/execute', data),
  executeSplit: (data) => client.post('/jobs/execute-split', data),
};

export const posApi = {
  getAll: (unit, supplier, status) => client.get('/pos', { params: { unit, supplier, status } }),
  getById: (id) => client.get(`/pos/${id}`),
  create: (data) => client.post('/pos', data),
  approve: (id) => client.post(`/pos/${id}/approve`),
  cancel: (id, reason) => client.post(`/pos/${id}/cancel`, { reason }),
  receive: (id, data) => client.post(`/pos/${id}/receive`, data),
};

export const transfersApi = {
  getAll: () => client.get('/transfers'),
  getByReel: (reelId) => client.get(`/transfers/reel/${reelId}`),
  create: (data) => client.post('/transfers', data),
};

export const mastersApi = {
  getUnits: () => client.get('/units'),
  getMills: () => client.get('/mills'),
  getReelTypes: () => client.get('/reel-types'),
  getSuppliers: () => client.get('/suppliers'),
  getUsers: () => client.get('/users'),
};
