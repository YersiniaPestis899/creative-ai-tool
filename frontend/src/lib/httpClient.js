import axios from 'axios';
import { supabase } from './auth';

const API_URL = import.meta.env.VITE_API_URL;

const httpClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// リクエストインターセプター
httpClient.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  } catch (error) {
    console.error('Auth error:', error);
    return config;
  }
});

export default httpClient;