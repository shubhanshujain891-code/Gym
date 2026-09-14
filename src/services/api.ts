import {
  Member,
  PaymentRecord,
  AttendanceRecord,
  MembershipPlan,
  Trainer,
  Gym,
  User,
  WorkoutPlan,
  DietPlan,
  ProgressRecord,
  MySQLStatus,
} from '../types';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('fitmanage_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json().catch(() => ({
        success: false,
        error: { code: 'PARSE_ERROR', message: 'Failed to parse JSON response' },
      }));

      return data;
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'NETWORK_ERROR', message: err.message || 'Network request failed' },
      };
    }
  }

  // System & Database Diagnostics
  public async getDatabaseStatus(): Promise<ApiResponse<MySQLStatus>> {
    return this.request<MySQLStatus>('/api/status');
  }

  public async testMySQLConnection(config: any): Promise<ApiResponse<{ connected: boolean; message: string; tables?: string[] }>> {
    return this.request('/api/mysql/test', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  public async getSQLSchema(): Promise<ApiResponse<{ schema: string }>> {
    return this.request('/api/mysql/schema');
  }

  // Members
  public members = {
    list: () => this.request<Member[]>('/api/members'),
    create: (body: Partial<Member>) =>
      this.request<Member>('/api/members', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Member>) =>
      this.request<Member>(`/api/members/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => this.request(`/api/members/${id}`, { method: 'DELETE' }),
    checkIn: (id: string, method: string = 'manual') =>
      this.request<AttendanceRecord>(`/api/members/${id}/check-in`, {
        method: 'POST',
        body: JSON.stringify({ method }),
      }),
  };

  // Payments
  public payments = {
    list: () => this.request<PaymentRecord[]>('/api/payments'),
    create: (body: Partial<PaymentRecord>) =>
      this.request<PaymentRecord>('/api/payments', { method: 'POST', body: JSON.stringify(body) }),
  };

  // Attendance
  public attendance = {
    list: (date?: string) =>
      this.request<AttendanceRecord[]>(`/api/attendance${date ? `?date=${date}` : ''}`),
    mark: (body: any) =>
      this.request<AttendanceRecord>('/api/attendance', { method: 'POST', body: JSON.stringify(body) }),
    verifyQr: (token: string) =>
      this.request<any>('/api/attendance/verify-qr', { method: 'POST', body: JSON.stringify({ token }) }),
  };

  // Plans
  public plans = {
    list: () => this.request<MembershipPlan[]>('/api/plans'),
    create: (body: Partial<MembershipPlan>) =>
      this.request<MembershipPlan>('/api/plans', { method: 'POST', body: JSON.stringify(body) }),
  };

  // Trainers
  public trainers = {
    list: () => this.request<Trainer[]>('/api/trainers'),
    create: (body: Partial<Trainer>) =>
      this.request<Trainer>('/api/trainers', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Trainer>) =>
      this.request<Trainer>(`/api/trainers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => this.request(`/api/trainers/${id}`, { method: 'DELETE' }),
  };

  // Gyms
  public gyms = {
    list: () => this.request<Gym[]>('/api/gyms'),
    get: (id: string) => this.request<Gym>(`/api/gyms/${id}`),
    update: (id: string, body: Partial<Gym>) =>
      this.request<Gym>(`/api/gyms/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  };

  // Workouts
  public workouts = {
    list: () => this.request<WorkoutPlan[]>('/api/workouts'),
    create: (body: Partial<WorkoutPlan>) =>
      this.request<WorkoutPlan>('/api/workouts', { method: 'POST', body: JSON.stringify(body) }),
  };

  // Diets
  public diets = {
    list: () => this.request<DietPlan[]>('/api/diets'),
    create: (body: Partial<DietPlan>) =>
      this.request<DietPlan>('/api/diets', { method: 'POST', body: JSON.stringify(body) }),
  };

  // Progress
  public progress = {
    list: (memberId?: string) =>
      this.request<ProgressRecord[]>(`/api/progress${memberId ? `?memberId=${memberId}` : ''}`),
    create: (body: Partial<ProgressRecord>) =>
      this.request<ProgressRecord>('/api/progress', { method: 'POST', body: JSON.stringify(body) }),
  };
}

export const api = new ApiService();
