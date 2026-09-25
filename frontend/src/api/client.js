import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  (config) => {
    if (!navigator.onLine && config.method && config.method.toLowerCase() !== 'get') {
      return Promise.reject(new Error('You are currently offline. Changes cannot be saved until connectivity is restored.'));
    }
    const token = localStorage.getItem('reeltrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Frontend-only phase:
// Do not clear the local frontend session when the backend returns 401.
// Backend authentication/authorization will be wired in during the backend phase.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Allow the application to handle 401 (e.g., AuthContext)
    }
    return Promise.reject(error);
  }
);

export default client;
