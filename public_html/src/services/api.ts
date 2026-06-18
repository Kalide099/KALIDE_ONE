const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api/v1/kalide-one' : (process.env.NEXT_PUBLIC_API_URL || '/api/v1/kalide-one');

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  role: string;
  password: string;
  expertiseAreas?: string[];
  companyBase?: string;
  companyCapabilities?: string[];
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
  team_id?: number | null;
  insurance_active?: boolean;
  insurance_fee?: string;
}

export interface TeamMember {
  id: number;
  professional_id: number;
  base_role: string;
  permissions: string[];
  skills: string[];
  user: {
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
  category: {
    id: number;
    name: string;
  } | null;
  owner: {
    id: number;
    name: string;
    email: string;
  } | null;
  members_count: number;
  members: TeamMember[];
}

export interface CreateTeamPayload {
  name: string;
  description: string;
  category_id?: number;
}

export interface InviteTeamMemberPayload {
  email: string;
  base_role: string;
  permissions?: string[];
  skills?: string[];
}

export interface UpdateTeamMemberPayload {
  base_role?: string;
  permissions?: string[];
  skills?: string[];
}

export interface TeamProjectSkillTask {
  id: number;
  title: string;
  description: string;
  status: string;
  professional_id: number;
  project_id: number;
  required_skill?: string;
  member: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface MapTeamSkillPayload {
  member_id: number;
  required_skill: string;
  task_title?: string;
  task_description?: string;
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
  total_projects: number;
  active_projects: number;
  completed_projects: number;
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
  total_quotes: number;
  accepted_quotes: number;
  global_win_rate: number;
  average_marketplace_rating: number;
}

export interface PerformanceDashboard {
  role: string;
  client: ClientPerformanceMetrics;
  worker: WorkerPerformanceMetrics;
  admin: AdminPerformanceMetrics | null;
}

export interface ProjectMilestone {
  id: number;
  title: string;
  description: string;
  amount: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'released';
  project_id: number;
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

export interface ProfessionalsFilter {
  verified?: boolean;
  skills?: string;
  location?: string;
  minRating?: number;
}

export interface AvailabilitySlot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  professional_id: number;
}

export interface CreateBookingData {
  professional_id: number;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  project_id?: number;
  team_id?: number;
}

export interface CreateQuoteData {
  total_amount: number;
  terms: string;
  project_id: number;
  client_id: number;
  valid_until?: string;
  structured_proposal?: {
    scope?: string;
    timeline?: string;
    milestones?: string[];
  };
}

export interface DisputeSettlement {
  confidence_score: number;
  client_refund_percentage: number;
  artisan_payout_percentage: number;
  reasoning: string;
  is_accepted_by_both: boolean;
  generated_at: string;
}

export interface DisputeRecord {
  id: number;
  title: string;
  description: string;
  evidence: string;
  status: string;
  priority: string;
  resolution: string | null;
  resolution_notes: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  project_id: number;
  project_title: string;
  initiator_id: number;
  respondent_id: number;
  ai_settlement: DisputeSettlement | null;
}

export interface CreateDisputeData {
  project_id: number;
  respondent_id: number;
  title: string;
  description: string;
  evidence?: string;
  priority?: 'low' | 'medium' | 'high';
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('access_token');
      const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
      const headers: Record<string, string> = {
        ...((options.headers as Record<string, string>) || {}),
      };

      if (!isFormData && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = `${API_BASE_URL}${endpoint}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

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

  async register(userData: RegisterData, profilePhoto?: File | null): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('email', userData.email);
    formData.append('phone', userData.phone);
    formData.append('country', userData.country);
    formData.append('city', userData.city);
    formData.append('role', userData.role);
    formData.append('password', userData.password);
    formData.append('expertiseAreas', JSON.stringify(userData.expertiseAreas || []));
    formData.append('companyBase', userData.companyBase || '');
    formData.append('companyCapabilities', JSON.stringify(userData.companyCapabilities || []));

    if (profilePhoto) {
      formData.append('profilePhoto', profilePhoto);
    }

    return this.request('/auth/register', {
      method: 'POST',
      body: formData,
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

  async getProfessionals(filters: ProfessionalsFilter = {}): Promise<ApiResponse<Professional[]>> {
    const params = new URLSearchParams();

    if (typeof filters.verified === 'boolean') {
      params.set('verified', String(filters.verified));
    }
    if (filters.skills?.trim()) {
      params.set('skills', filters.skills.trim());
    }
    if (filters.location?.trim()) {
      params.set('location', filters.location.trim());
    }
    if (typeof filters.minRating === 'number' && filters.minRating > 0) {
      params.set('minRating', String(filters.minRating));
    }

    const query = params.toString();
    return this.request(`/professionals${query ? `?${query}` : ''}`);
  }

  async getProfessionalDetail(id: number): Promise<ApiResponse<Professional>> {
    return this.request(`/professionals/${id}/`);
  }

  async releaseEscrow(id: number, milestoneId?: number): Promise<ApiResponse> {
    return this.request(`/projects/${id}/release-escrow`, {
      method: 'POST',
      body: JSON.stringify(milestoneId ? { milestone_id: milestoneId } : {}),
    });
  }

  async getProjectMilestones(projectId: number): Promise<ApiResponse<ProjectMilestone[]>> {
    return this.request(`/projects/${projectId}/milestones`);
  }

  async updateProjectMilestone(
    projectId: number,
    milestoneId: number,
    status: ProjectMilestone['status']
  ): Promise<ApiResponse<ProjectMilestone>> {
    return this.request(`/projects/${projectId}/milestones/${milestoneId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getAvailability(professionalId: number, date?: string, availableOnly = true): Promise<ApiResponse<AvailabilitySlot[]>> {
    const params = new URLSearchParams();
    params.set('professional_id', String(professionalId));
    if (date) params.set('date', date);
    params.set('availableOnly', String(availableOnly));

    return this.request(`/bookings/availability?${params.toString()}`);
  }

  async createAvailability(date: string, start_time: string, end_time: string): Promise<ApiResponse<AvailabilitySlot>> {
    return this.request('/bookings/availability', {
      method: 'POST',
      body: JSON.stringify({ date, start_time, end_time }),
    });
  }

  async createBooking(data: CreateBookingData): Promise<ApiResponse> {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createQuote(data: CreateQuoteData): Promise<ApiResponse> {
    return this.request('/payments/quotes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPerformanceDashboard(): Promise<ApiResponse<PerformanceDashboard>> {
    return this.request('/analytics/performance');
  }

  async getTeams(): Promise<ApiResponse<TeamRecord[]>> {
    return this.request('/teams');
  }

  async createTeam(data: CreateTeamPayload): Promise<ApiResponse<TeamRecord>> {
    return this.request('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTeamMembers(teamId: number): Promise<ApiResponse<TeamMember[]>> {
    return this.request(`/teams/${teamId}/members`);
  }

  async inviteTeamMember(teamId: number, data: InviteTeamMemberPayload): Promise<ApiResponse<TeamMember>> {
    return this.request(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeamMember(
    teamId: number,
    memberId: number,
    data: UpdateTeamMemberPayload
  ): Promise<ApiResponse<TeamMember>> {
    return this.request(`/teams/${teamId}/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
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
    data: MapTeamSkillPayload
  ): Promise<ApiResponse<TeamProjectSkillTask>> {
    return this.request(`/teams/${teamId}/projects/${projectId}/skills-map`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDisputes(): Promise<ApiResponse<DisputeRecord[]>> {
    return this.request('/disputes');
  }

  async createDispute(data: CreateDisputeData): Promise<ApiResponse<DisputeRecord>> {
    return this.request('/disputes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async disputeAction(
    disputeId: number,
    payload: {
      action: 'accept_ai_settlement' | 'escalate_to_admin' | 'resolve_manual';
      note?: string;
      resolution?: string;
    }
  ): Promise<ApiResponse<DisputeRecord>> {
    return this.request(`/disputes/${disputeId}/action`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
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

  async approveUser(id: number): Promise<ApiResponse> {
    return this.request(`/auth/admin/users/${id}/approve/`, {
      method: 'POST',
    });
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

  async submitApplication(documentType: string, photo: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('photo', photo);

    return this.request('/auth/application', {
      method: 'POST',
      body: formData,
    });
  }

  async uploadProfilePhoto(photo: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('photo', photo);

    return this.request('/auth/profile-photo', {
      method: 'POST',
      body: formData,
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