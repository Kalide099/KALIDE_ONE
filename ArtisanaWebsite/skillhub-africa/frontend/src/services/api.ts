const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  || (process.env.NODE_ENV === 'production'
    ? 'https://api.kalideone.com/api/v1/kalide-one'
    : 'http://127.0.0.1:8000/api/v1/kalide-one');

function normalizeEndpoint(endpoint: string): string {
  if (!endpoint) return '/';
  const [path, query] = endpoint.split('?');
  const normalizedPath = path.endsWith('/') ? path : `${path}/`;
  return query ? `${normalizedPath}?${query}` : normalizedPath;
}

async function parseJsonSafe(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
}

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
  team_id?: number;
  insurance_active?: boolean;
  insurance_fee?: string;
}

export interface TeamMember {
  id: number;
  professional_id: number;
  base_role: string;
  permissions: string[];
  skills: string[];
  user?: {
    id: number;
    name: string;
    email: string;
    city?: string;
    country?: string;
  } | null;
}

export interface TeamRecord {
  id: number;
  name: string;
  description: string;
  members_count?: number;
  members: TeamMember[];
}

export interface TeamProjectSkillTask {
  id: number;
  title: string;
  description?: string;
  required_skill?: string;
  assigned_to?: number | null;
  member?: { id?: number; name?: string; email?: string } | null;
  assigned_member?: TeamMember | null;
  status?: string;
}

export interface ClientPerformanceMetrics {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  spend_total: number;
  committed_budget_total: number;
  quality_rating_avg: number;
  quality_reviews_count: number;
  on_time_completion_rate: number;
}

export interface WorkerPerformanceMetrics {
  quotes_submitted: number;
  quotes_accepted: number;
  win_rate: number;
  response_rate: number;
  earnings_total: number;
  repeat_clients: number;
  average_rating: number;
  reviews_count: number;
}

export interface AdminPerformanceMetrics {
  total_users: number;
  active_users: number;
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_platform_volume: number;
  total_escrow_volume: number;
  average_marketplace_rating: number;
  global_win_rate: number;
}

export interface PerformanceDashboard {
  client: ClientPerformanceMetrics;
  worker: WorkerPerformanceMetrics;
  admin: AdminPerformanceMetrics;
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

export interface Review {
  id?: number;
  rating: number;
  comment: string;
  reviewer?: { name?: string };
  reviewee?: number;
  created_at?: string;
  [key: string]: any;
}

class ApiService {
  private async refreshAccessToken(): Promise<boolean> {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) return false;

      const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (!data?.access) return false;

      localStorage.setItem('access_token', data.access);
      return true;
    } catch {
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const normalizedEndpoint = normalizeEndpoint(endpoint);
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = `${API_BASE_URL}${normalizedEndpoint}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (
        response.status === 401 &&
        normalizedEndpoint !== '/auth/login/' &&
        normalizedEndpoint !== '/auth/register/' &&
        normalizedEndpoint !== '/auth/refresh/'
      ) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          const retryToken = localStorage.getItem('access_token');
          const retryHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            ...((options.headers as Record<string, string>) || {}),
          };
          if (retryToken) {
            retryHeaders['Authorization'] = `Bearer ${retryToken}`;
          }

          const retryResponse = await fetch(url, {
            ...options,
            headers: retryHeaders,
          });

          const retryData = await parseJsonSafe(retryResponse);
          if (!retryResponse.ok) {
            return {
              success: false,
              message: retryData?.message || 'An error occurred',
              errors: retryData?.errors,
            };
          }

          return {
            success: true,
            data: (retryData || ({} as T)),
          };
        }
      }

      const data = await parseJsonSafe(response);

      if (!response.ok) {
        return {
          success: false,
          message: data?.message || 'An error occurred',
          errors: data?.errors,
        };
      }

      return {
        success: true,
        data: (data || ({} as T)),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async register(userData: RegisterData): Promise<ApiResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: LoginData): Promise<ApiResponse<AuthResponse>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProjects(): Promise<ApiResponse<Project[]>> {
    return this.request('/projects');
  }

  async getProjectDetail(id: number): Promise<ApiResponse<Project>> {
    return this.request(`/projects/${id}/`);
  }

  async getProfessionals(): Promise<ApiResponse<Professional[]>> {
    // Note: The backend view logic filters for is_verified=True
    return this.request('/professionals');
  }

  async searchProfessionals(query: string, location: string, sortBy: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (location) params.append('location', location);
    if (sortBy === 'price_asc') {
      params.append('sort_by', 'price');
      params.append('sort_order', 'asc');
    } else if (sortBy === 'price_desc') {
      params.append('sort_by', 'price');
      params.append('sort_order', 'desc');
    } else {
      params.append('sort_by', 'rating');
      params.append('sort_order', 'desc');
    }
    return this.request(`/professionals/search/?${params.toString()}`);
  }

  async getProfessionalDetail(id: number): Promise<ApiResponse<Professional>> {
    return this.request(`/professionals/${id}/`);
  }

  async releaseEscrow(id: number): Promise<ApiResponse> {
    return this.request(`/projects/${id}/release-escrow`, {
      method: 'POST',
    });
  }

  async getQuotes(): Promise<ApiResponse<any[]>> {
    return this.request('/payments/quotes');
  }

  async fundQuote(id: number): Promise<ApiResponse> {
    return this.request(`/payments/quotes/${id}/fund`, {
      method: 'POST',
    });
  }

  async getTeams(): Promise<ApiResponse<TeamRecord[]>> {
    return this.request('/teams');
  }

  async createTeam(payload: { name: string; description: string; category?: string }): Promise<ApiResponse<TeamRecord>> {
    return this.request('/teams', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async inviteTeamMember(
    teamId: number,
    payload: { email: string; base_role?: string; permissions?: string[]; skills?: string[] }
  ): Promise<ApiResponse<TeamMember>> {
    return this.request(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateTeamMember(
    teamId: number,
    memberId: number,
    payload: { base_role?: string; permissions?: string[]; skills?: string[] }
  ): Promise<ApiResponse<TeamMember>> {
    return this.request(`/teams/${teamId}/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async removeTeamMember(teamId: number, memberId: number): Promise<ApiResponse> {
    return this.request(`/teams/${teamId}/members/${memberId}`, {
      method: 'DELETE',
    });
  }

  async getTeamProjectSkillMap(teamId: number, projectId: number): Promise<ApiResponse<TeamProjectSkillTask[]>> {
    return this.request(`/teams/${teamId}/projects/${projectId}/skills-map`);
  }

  async mapMemberSkillToProject(
    teamId: number,
    projectId: number,
    payload: { member_id: number; required_skill: string; task_title?: string; task_description?: string }
  ): Promise<ApiResponse<TeamProjectSkillTask>> {
    return this.request(`/teams/${teamId}/projects/${projectId}/skills-map`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getPerformanceDashboard(): Promise<ApiResponse<PerformanceDashboard>> {
    return this.request('/analytics/performance');
  }

  // ==== ADMIN ENDPOINTS ====
  async getAdminUsers(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request('/auth/admin/users');
  }

  async getAdminProjects(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request('/auth/admin/projects');
  }

  async getAdminPayments(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request('/auth/admin/payments');
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

  async getReviews(workerId: string): Promise<ApiResponse<Review[]>> {
    return this.request(`/reviews/?worker_id=${workerId}`);
  }

  async submitReview(payload: { reviewee: string; rating: number; comment: string; project_id?: string }): Promise<ApiResponse<Review>> {
    return this.request('/reviews/create/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

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

  async uploadAvatar(file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    // We override default JSON headers for FormData
    const token = this.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/avatar/`, {
        method: 'PATCH',
        headers,
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) return { success: false, message: data.message || 'Upload failed' };
      return { success: true, data };
    } catch (e) {
      return { success: false, message: 'Network error' };
    }
  }

  async uploadProfilePhoto(file: File): Promise<ApiResponse> {
    return this.uploadAvatar(file);
  }

  async uploadPortfolio(professionalId: number, title: string, desc: string, file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('title', JSON.stringify({ en: title }));
    formData.append('description', JSON.stringify({ en: desc }));
    formData.append('image_file', file);
    
    const token = this.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/professionals/${professionalId}/portfolio/`, {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) return { success: false, message: data.message || 'Upload failed' };
      return { success: true, data };
    } catch (e) {
      return { success: false, message: 'Network error' };
    }
  }
}

export const apiService = new ApiService();