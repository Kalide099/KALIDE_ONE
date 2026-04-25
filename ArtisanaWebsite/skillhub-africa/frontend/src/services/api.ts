const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.kalideone.com/api/v1/kalide-one';

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  role: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    [key: string]: unknown;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface Project {
  id: number;
  title: Record<string, string>;
  description: Record<string, string>;
  budget: string;
  status: string;
  start_date: string;
  deadline: string;
  client: number;
  professional?: number;
}

export interface Professional {
  id: number;
  user_name: string;
  skills: string;
  hourly_rate: number;
  rating: number;
  experience_years: number;
  is_verified: boolean;
  profile_picture?: string;
  bio: unknown;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'An error occurred',
          errors: data.errors,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async register(userData: RegisterData): Promise<ApiResponse> {
    return this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: LoginData): Promise<ApiResponse<AuthResponse>> {
    return this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProjects(): Promise<ApiResponse<Project[]>> {
    return this.request('/projects/');
  }

  async getProjectDetail(id: number): Promise<ApiResponse<Project>> {
    return this.request(`/projects/${id}/`);
  }

  async getProfessionals(): Promise<ApiResponse<Professional[]>> {
    // Note: The backend view logic filters for is_verified=True
    return this.request('/professionals/');
  }

  async getProfessionalDetail(id: number): Promise<ApiResponse<Professional>> {
    return this.request(`/professionals/${id}/`);
  }

  async releaseEscrow(id: number): Promise<ApiResponse> {
    return this.request(`/projects/${id}/release-escrow/`, {
      method: 'POST',
    });
  }

  // ==== ADMIN ENDPOINTS ====
  async getAdminUsers(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request('/auth/admin/users/');
  }

  async getAdminProjects(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request('/auth/admin/projects/');
  }

  async getAdminPayments(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request('/auth/admin/payments/');
  }

  async deleteUser(id: number): Promise<ApiResponse> {
    return this.request(`/auth/admin/users/${id}/`, {
      method: 'DELETE',
    });
  }

  async warnUser(id: number, reason: string): Promise<ApiResponse> {
    return this.request(`/auth/admin/users/${id}/warn/`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async toggleUserAccess(id: number): Promise<ApiResponse> {
    return this.request(`/auth/admin/users/${id}/toggle-access/`, {
      method: 'POST',
    });
  }

  async upgradeUserSubscription(id: number, tier: string): Promise<ApiResponse> {
    return this.request(`/auth/admin/users/${id}/subscription/`, {
      method: 'POST',
      body: JSON.stringify({ plan: tier }),
    });
  }
  // =========================

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getAccessToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }
}

export const apiService = new ApiService();