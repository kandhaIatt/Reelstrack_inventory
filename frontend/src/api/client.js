import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  (config) => {
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
  (error) => Promise.reject(error)
);

export default client;
