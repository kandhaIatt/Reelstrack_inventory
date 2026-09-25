import client from './client';

export const authApi = {
  login: (credentials) => client.post('/auth/login', credentials),
  me: () => client.get('/auth/me'),
  changePassword: (data) => client.post('/auth/change-password', data),
};

export const dashboardApi = {
  getStats: (unit) => client.get('/dashboard/stats', { params: { unit } }),
  getActivity: () => client.get('/dashboard/activity'),
};

export const reelsApi = {
  getAll: (unit) => client.get('/reel-inventory', { params: { unit } }),
  getById: (id) => client.get(`/reel-inventory/${id}`),
  create: (data) => client.post('/reel-inventory', data),
  bulkAdd: (data) => client.post('/reels/bulk', data),
  search: (params) => client.get('/reel-inventory/search', { params }),
  hold: (id, notes) => client.post(`/reels/${id}/hold`, { notes }),
  release: (id, notes) => client.post(`/reels/${id}/release`, { notes }),
  writeOff: (id, notes) => client.post(`/reels/${id}/write-off`, { notes }),
  correction: (id, width, gsm, mill) => client.post(`/reels/${id}/correction`, { width, gsm, mill }),
  printLabel: (id) => client.get(`/reels/${id}/label`),
  getLedger: (id) => client.get(`/reels/${id}/ledger`),
  adjustWeight: (id, newWeight, reason, notes) => client.post(`/reels/${id}/adjust-weight`, { newWeight, reason, notes }),
  recommend: (data, unit) => client.post('/reels/recommend', data, { params: { unit } }),
  splitPlan: (data, unit) => client.post('/reels/split-plan', data, { params: { unit } }),
  importCsv: (formData) => client.post('/reel-inventory/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const jobsApi = {
  getAll: (unit, reel) => client.get('/jobs', { params: { unit, reel } }),
  calculate: (data) => client.post('/jobs/calculate', data),
  execute: (data) => client.post('/jobs/execute', data),
  executeSplit: (data) => client.post('/jobs/execute-split', data),
  reverse: (id) => client.post(`/jobs/${id}/reverse`),
  reverseJob: (id) => client.post(`/jobs/${id}/reverse`),
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
  receive: (id) => client.post(`/transfers/${id}/receive`),
  reject: (id, data) => client.post(`/transfers/${id}/reject`, data),
};

export const stockCountsApi = {
  getAll: (unit) => client.get('/stock-counts', { params: { unit } }),
  getById: (id) => client.get(`/stock-counts/${id}`),
  initiate: (unit) => client.post('/stock-counts/initiate', null, { params: { unit } }),
  updateLines: (id, lines) => client.put(`/stock-counts/${id}/lines`, lines),
  reconcile: (id) => client.post(`/stock-counts/${id}/reconcile`),
};

export const mastersApi = {
  getUnits: (params) => client.get('/units', { params }),
  getAllUnits: () => client.get('/units', { params: { activeOnly: false } }),
  createUnit: (data) => client.post('/units', data),
  updateUnit: (id, data) => client.put(`/units/${id}`, data),
  toggleUnitActive: (id) => client.patch(`/units/${id}/toggle-active`),
  // Convenience wrappers for unit handling
  saveUnit: (id, data) => (id ? client.put(`/units/${id}`, data) : client.post('/units', data)),
  setUnitActive: (id) => client.patch(`/units/${id}/toggle-active`),

  getMills: (params) => client.get('/mills', { params }),
  // Fetch all mills regardless of active status
  getAllMills: () => client.get('/mills', { params: { activeOnly: false } }),
  createMill: (data) => client.post('/mills', data),
  updateMill: (id, data) => client.put(`/mills/${id}`, data),
  toggleMillActive: (id) => client.patch(`/mills/${id}/toggle-active`),
  // Convenience wrappers for mill handling
  saveMill: (id, data) => (id ? client.put(`/mills/${id}`, data) : client.post('/mills', data)),
  setMillActive: (id) => client.patch(`/mills/${id}/toggle-active`),

  getReelTypes: (params) => client.get('/reel-types', { params }),
  // Fetch all reel types regardless of active status
  getAllReelTypes: () => client.get('/reel-types', { params: { activeOnly: false } }),
  createReelType: (data) => client.post('/reel-types', data),
  updateReelType: (id, data) => client.put(`/reel-types/${id}`, data),
  toggleReelTypeActive: (id) => client.patch(`/reel-types/${id}/toggle-active`),
  // Convenience wrappers for reel type handling
  saveReelType: (id, data) => (id ? client.put(`/reel-types/${id}`, data) : client.post('/reel-types', data)),
  setReelTypeActive: (id) => client.patch(`/reel-types/${id}/toggle-active`),

  getConfig: () => client.get('/config'),
  updateConfig: (data) => client.put('/config', data),

  // Settings
  getSettings: () => client.get('/settings'),
  saveSetting: (key, data) => client.put(`/settings/${encodeURIComponent(key)}`, data),

  getSuppliers: () => client.get('/suppliers'),
  saveSupplier: (id, data) => (id ? client.put(`/suppliers/${id}`, data) : client.post('/suppliers', data)),
  deleteSupplier: (id) => client.delete(`/suppliers/${id}`),

  getUsers: () => client.get('/users'),
  createUser: (data) => client.post('/users', data),
  updateUser: (id, data) => client.put(`/users/${id}`, data),
  setUserActive: (id) => client.patch(`/users/${id}/toggle-active`),
  changeUserPassword: (id, newPassword) => client.patch(`/users/${id}/password`, { newPassword }),
  deleteUser: (id) => client.delete(`/users/${id}`),
};

export const userApi = mastersApi;

export const reportsApi = {
  downloadDailyStockPdf: () => client.get('/reports/daily-stock/pdf', { responseType: 'blob' }),
  downloadProductionPlanPdf: () => client.get('/reports/production-plan/pdf', { responseType: 'blob' }),
  downloadLedgerHistoryExcel: () => client.get('/reports/ledger-history/excel', { responseType: 'blob' }),
  downloadPOSummaryExcel: () => client.get('/reports/po-summary/excel', { responseType: 'blob' }),
  downloadRateTrendsExcel: () => client.get('/reports/rate-trends/excel', { responseType: 'blob' }),
  downloadSupplierPerformanceExcel: () => client.get('/reports/supplier-performance/excel', { responseType: 'blob' }),
  downloadWastageExcel: () => client.get('/reports/wastage/excel', { responseType: 'blob' }),
  downloadReconciliationExcel: () => client.get('/reports/reconciliation/excel', { responseType: 'blob' }),
};

export const passwordApi = authApi;

export const notificationsApi = {
  getAll: () => client.get('/notifications'),
  getUnreadCount: () => client.get('/notifications/unread-count'),
  markAsRead: (id) => client.patch(`/notifications/${id}/read`),
  markAllAsRead: () => client.patch('/notifications/read-all'),
};  