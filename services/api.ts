import { StorageService } from './storage';

const API_BASE_PATH = '/wp-json/valcode-appoint/v1';

export interface Permissions {
  can_view_all_appointments: boolean;
  can_create_appointments: boolean;
  can_edit_appointments: boolean;
  can_delete_appointments: boolean;
  can_view_customers: boolean;
  can_edit_customers: boolean;
  can_edit_blockers: boolean;
  can_view_all_staff: boolean;
}

export interface License {
  valid: boolean;
  type: string;
}

export interface LoginResponse {
  token: string;
  staff: {
    id: string;
    name: string;
    email: string;
    phone: string;
    permissions: Permissions;
  };
  license: License;
}

export interface Service {
  id: string;
  name: string;
  duration_minutes: string;
  price: string;
  active: string;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  permissions?: Permissions;
}

export interface Appointment {
  id: string;
  service_id: string;
  service_name: string;
  staff_id: string;
  staff_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  starts_at: string;
  ends_at: string;
  status: string;
  notes?: string;
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
}

class ApiService {
  private baseUrl: string = '';
  private token: string = '';

  async initialize() {
    const domain = await StorageService.getDomain();
    const token = await StorageService.getToken();

    if (domain) {
      this.baseUrl = `${domain}${API_BASE_PATH}`;
    }
    if (token) {
      this.token = token;
    }
  }

  setBaseUrl(domain: string) {
    this.baseUrl = `${domain}${API_BASE_PATH}`;
  }

  setToken(token: string) {
    this.token = token;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token && !endpoint.includes('/auth/login')) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: 'Network error',
        }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.setToken(response.token);
    return response;
  }

  async validateToken(): Promise<{ valid: boolean; staff: Staff; license: License }> {
    return this.request('/auth/validate', {
      method: 'POST',
    });
  }

  // Services
  async getServices(): Promise<Service[]> {
    return this.request('/services');
  }

  async getService(id: string): Promise<Service> {
    return this.request(`/services/${id}`);
  }

  // Staff
  async getStaff(): Promise<Staff[]> {
    return this.request('/staff');
  }

  async getStaffMember(id: string): Promise<Staff> {
    return this.request(`/staff/${id}`);
  }

  async updateStaff(
    id: string,
    data: {
      name: string;
      email: string;
      phone?: string;
    }
  ): Promise<{ message: string; staff: Staff }> {
    return this.request(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Appointments
  async getAppointments(params?: {
    staff_id?: string;
    start?: string;
    end?: string;
  }): Promise<Appointment[]> {
    const queryParams = new URLSearchParams();
    if (params?.staff_id) queryParams.append('staff_id', params.staff_id);
    if (params?.start) queryParams.append('start', params.start);
    if (params?.end) queryParams.append('end', params.end);

    const query = queryParams.toString();
    return this.request(`/appointments${query ? `?${query}` : ''}`);
  }

  async getAppointment(id: string): Promise<Appointment> {
    return this.request(`/appointments/${id}`);
  }

  async createAppointment(data: {
    service_id: number;
    staff_id: number;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    starts_at: string;
    ends_at: string;
    status: string;
    notes?: string;
  }): Promise<{ id: number; message: string }> {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAppointment(
    id: string,
    data: Partial<{
      starts_at: string;
      ends_at: string;
      status: string;
      notes: string;
    }>
  ): Promise<{ message: string }> {
    return this.request(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAppointment(id: string): Promise<{ message: string }> {
    return this.request(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return this.request('/customers');
  }

  async getCustomer(id: string): Promise<Customer> {
    return this.request(`/customers/${id}`);
  }

  async createCustomer(data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ id: number; message: string }> {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomer(
    id: string,
    data: Partial<{
      first_name: string;
      last_name: string;
      phone: string;
      password: string;
    }>
  ): Promise<{ message: string }> {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCustomer(id: string): Promise<{ message: string }> {
    return this.request(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  // Availability
  async getAvailability(staffId?: string): Promise<any[]> {
    const query = staffId ? `?staff_id=${staffId}` : '';
    return this.request(`/availability${query}`);
  }

  // Time Slots
  async getTimeSlots(params: {
    service_id: string;
    date: string;
    staff_id?: string;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams({
      service_id: params.service_id,
      date: params.date,
    });
    if (params.staff_id) {
      queryParams.append('staff_id', params.staff_id);
    }
    return this.request(`/slots?${queryParams.toString()}`);
  }

  // Check if API is available
  async checkConnection(): Promise<boolean> {
    try {
      // Try to fetch services as a simple health check
      await this.getServices();
      return true;
    } catch (error) {
      console.error('Connection check failed:', error);
      return false;
    }
  }
}

export const API = new ApiService();
