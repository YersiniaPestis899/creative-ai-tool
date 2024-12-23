import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://nv2pbisvha.execute-api.us-west-2.amazonaws.com/prod';

const httpClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// リクエストインターセプター
httpClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
httpClient.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });

    // エラーメッセージのカスタマイズ
    if (error.code === 'ECONNABORTED') {
      error.message = 'リクエストがタイムアウトしました。再度お試しください。';
    } else if (error.message === 'Network Error') {
      error.message = 'ネットワーク接続に問題が発生しました。インターネット接続を確認してください。';
    }

    return Promise.reject(error);
  }
);

export default httpClient;