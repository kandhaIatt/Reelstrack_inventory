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
  getUnits: (params) => client.get('/units', { params }),
  createUnit: (data) => client.post('/units', data),
  updateUnit: (id, data) => client.put(`/units/${id}`, data),
  toggleUnitActive: (id) => client.patch(`/units/${id}/toggle-active`),

  getMills: (params) => client.get('/mills', { params }),
  createMill: (data) => client.post('/mills', data),
  updateMill: (id, data) => client.put(`/mills/${id}`, data),
  toggleMillActive: (id) => client.patch(`/mills/${id}/toggle-active`),

  getReelTypes: (params) => client.get('/reel-types', { params }),
  createReelType: (data) => client.post('/reel-types', data),
  updateReelType: (id, data) => client.put(`/reel-types/${id}`, data),
  toggleReelTypeActive: (id) => client.patch(`/reel-types/${id}/toggle-active`),

  getConfig: () => client.get('/config'),
  updateConfig: (data) => client.put('/config', data),

  getSuppliers: () => client.get('/suppliers'),
  getUsers: () => client.get('/users'),
};
