import axios from 'axios';
import { supabase, isSupabaseConfigured } from './supabase.js';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 45000
});

// Request interceptor: Attach Supabase JWT Bearer token
apiClient.interceptors.request.use(async (config) => {
  if (isSupabaseConfigured) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } else {
    // In local development mock mode
    config.headers.Authorization = `Bearer dev-token-mock-researcher`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor: Extract structured errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = error.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: error.message || 'Network request failed'
    };
    return Promise.reject(customError);
  }
);

