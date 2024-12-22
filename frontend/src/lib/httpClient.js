import axios from 'axios';
import { supabase } from './auth';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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

// レスポンスインターセプター
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      // 認証エラーの場合の処理
      console.error('Authentication error');
    }
    return Promise.reject(error);
  }
);

export default httpClient;