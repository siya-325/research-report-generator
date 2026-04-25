import axios, { AxiosError } from 'axios';

// Backend API URL
const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // If 401 and we have a refresh token, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================

export interface RegisterData {
  email: string;
  username: string;
  name: string;
  password: string;
  password_confirm: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    username: string;
    name: string;
  };
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register/', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await api.post('/auth/login/', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },
};

// ============================================
// PAPERS API
// ============================================

export interface Paper {
  id: number;
  title: string;
  authors: string;
  abstract: string;
  published_date: string;
  source_api: string;
  external_url: string;
  citation_count: number | null;
}

export interface SearchPapersRequest {
  query: string;
  max_results?: number;
  sources?: string[];
}

export interface SearchPapersResponse {
  status: string;
  message: string;
  query: string;
  total_found: number;
  new_papers: number;
  existing_papers: number;
  breakdown: {
    arxiv: number;
    semantic_scholar: number;
    pubmed: number;
  };
  papers: Paper[];
}

export const papersAPI = {
  search: async (data: SearchPapersRequest): Promise<SearchPapersResponse> => {
    const response = await api.post('/papers/search/', data);
    return response.data;
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const setAuthTokens = (access: string, refresh: string) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

export const clearAuthTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('access_token');
};

export default api;