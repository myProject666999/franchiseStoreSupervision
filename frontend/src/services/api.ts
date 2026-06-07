import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';
import { ApiResponse, AuthResponse, User, PageResult, Area, Store, CheckCategory, CheckItem, SupervisionTask, CheckinRecord, InspectionReport, RectificationOrder, MonthlyScore } from '../types';

const API_BASE_URL = '/api';

class ApiService {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.token = localStorage.getItem('token');
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        const data = response.data as ApiResponse;
        if (data.code !== 0 && data.code !== 200) {
          message.error(data.message || '请求失败');
          return Promise.reject(new Error(data.message || '请求失败'));
        }
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else {
          message.error(error.response?.data?.message || error.message || '网络错误');
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.request<ApiResponse<T>>(config);
    return response.data.data;
  }

  async get<T = any>(url: string, params?: any): Promise<T> {
    return this.request<T>({ method: 'GET', url, params });
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'PUT', url, data });
  }

  async patch<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'PATCH', url, data });
  }

  async delete<T = any>(url: string): Promise<T> {
    return this.request<T>({ method: 'DELETE', url });
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await this.axiosInstance.post<ApiResponse<AuthResponse>>('/auth/login', { username, password });
    const data = response.data.data;
    if (data.accessToken) {
      this.setToken(data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }

  async getProfile(): Promise<User> {
    return this.get<User>('/auth/profile');
  }

  async getUserList(params?: any): Promise<PageResult<User>> {
    return this.get<PageResult<User>>('/users', params);
  }

  async createUser(data: Partial<User>): Promise<User> {
    return this.post<User>('/users', data);
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    return this.patch<User>(`/users/${id}`, data);
  }

  async deleteUser(id: number): Promise<void> {
    return this.delete(`/users/${id}`);
  }

  async getAreaTree(): Promise<Area[]> {
    return this.get<Area[]>('/areas/tree');
  }

  async getAreaList(params?: any): Promise<PageResult<Area>> {
    return this.get<PageResult<Area>>('/areas', params);
  }

  async createArea(data: Partial<Area>): Promise<Area> {
    return this.post<Area>('/areas', data);
  }

  async updateArea(id: number, data: Partial<Area>): Promise<Area> {
    return this.patch<Area>(`/areas/${id}`, data);
  }

  async deleteArea(id: number): Promise<void> {
    return this.delete(`/areas/${id}`);
  }

  async getStoreList(params?: any): Promise<PageResult<Store>> {
    return this.get<PageResult<Store>>('/stores', params);
  }

  async createStore(data: Partial<Store>): Promise<Store> {
    return this.post<Store>('/stores', data);
  }

  async updateStore(id: number, data: Partial<Store>): Promise<Store> {
    return this.patch<Store>(`/stores/${id}`, data);
  }

  async deleteStore(id: number): Promise<void> {
    return this.delete(`/stores/${id}`);
  }

  async getCategoryList(params?: any): Promise<CheckCategory[]> {
    return this.get<CheckCategory[]>('/check-categories/all', params);
  }

  async createCategory(data: Partial<CheckCategory>): Promise<CheckCategory> {
    return this.post<CheckCategory>('/check-categories', data);
  }

  async updateCategory(id: number, data: Partial<CheckCategory>): Promise<CheckCategory> {
    return this.patch<CheckCategory>(`/check-categories/${id}`, data);
  }

  async deleteCategory(id: number): Promise<void> {
    return this.delete(`/check-categories/${id}`);
  }

  async getCheckItemTree(): Promise<{ category: CheckCategory; items: CheckItem[] }[]> {
    return this.get('/check-items/tree');
  }

  async getCheckItemList(params?: any): Promise<PageResult<CheckItem>> {
    return this.get<PageResult<CheckItem>>('/check-items', params);
  }

  async createCheckItem(data: Partial<CheckItem>): Promise<CheckItem> {
    return this.post<CheckItem>('/check-items', data);
  }

  async updateCheckItem(id: number, data: Partial<CheckItem>): Promise<CheckItem> {
    return this.patch<CheckItem>(`/check-items/${id}`, data);
  }

  async deleteCheckItem(id: number): Promise<void> {
    return this.delete(`/check-items/${id}`);
  }

  async getTaskList(params?: any): Promise<PageResult<SupervisionTask>> {
    return this.get<PageResult<SupervisionTask>>('/supervision-tasks', params);
  }

  async getMyTasks(params?: any): Promise<PageResult<SupervisionTask>> {
    return this.get<PageResult<SupervisionTask>>('/supervision-tasks/my-tasks', params);
  }

  async getTaskDetail(id: number): Promise<SupervisionTask> {
    return this.get<SupervisionTask>(`/supervision-tasks/${id}`);
  }

  async createTask(data: any): Promise<SupervisionTask> {
    return this.post<SupervisionTask>('/supervision-tasks', data);
  }

  async updateTask(id: number, data: Partial<SupervisionTask>): Promise<SupervisionTask> {
    return this.patch<SupervisionTask>(`/supervision-tasks/${id}`, data);
  }

  async deleteTask(id: number): Promise<void> {
    return this.delete(`/supervision-tasks/${id}`);
  }

  async assignTaskStores(id: number, storeIds: number[]): Promise<void> {
    return this.post(`/supervision-tasks/${id}/stores`, { storeIds });
  }

  async changeTaskStatus(id: number, status: string): Promise<void> {
    return this.patch(`/supervision-tasks/${id}/status`, { status });
  }

  async createCheckin(data: Partial<CheckinRecord>): Promise<CheckinRecord> {
    return this.post<CheckinRecord>('/checkins', data);
  }

  async getCheckinList(params?: any): Promise<PageResult<CheckinRecord>> {
    return this.get<PageResult<CheckinRecord>>('/checkins', params);
  }

  async getInspectionList(params?: any): Promise<PageResult<InspectionReport>> {
    return this.get<PageResult<InspectionReport>>('/inspections', params);
  }

  async getInspectionDetail(id: number): Promise<InspectionReport> {
    return this.get<InspectionReport>(`/inspections/${id}`);
  }

  async createInspection(data: any): Promise<InspectionReport> {
    return this.post<InspectionReport>('/inspections', data);
  }

  async updateInspection(id: number, data: any): Promise<InspectionReport> {
    return this.put<InspectionReport>(`/inspections/${id}`, data);
  }

  async submitInspection(id: number, data: any): Promise<InspectionReport> {
    return this.post<InspectionReport>(`/inspections/${id}/submit`, data);
  }

  async confirmInspection(id: number): Promise<void> {
    return this.post(`/inspections/${id}/confirm`);
  }

  async getRectificationList(params?: any): Promise<PageResult<RectificationOrder>> {
    return this.get<PageResult<RectificationOrder>>('/rectifications', params);
  }

  async getRectificationDetail(id: number): Promise<RectificationOrder> {
    return this.get<RectificationOrder>(`/rectifications/${id}`);
  }

  async submitRectification(id: number, data: any): Promise<RectificationOrder> {
    return this.post<RectificationOrder>(`/rectifications/${id}/submit`, data);
  }

  async recheckRectification(id: number, data: any): Promise<RectificationOrder> {
    return this.post<RectificationOrder>(`/rectifications/${id}/recheck`, data);
  }

  async getMonthlyRanking(params?: any): Promise<PageResult<MonthlyScore>> {
    return this.get<PageResult<MonthlyScore>>('/statistics/monthly-ranking', params);
  }

  async getStoreTrend(params?: any): Promise<any[]> {
    return this.get<any[]>('/statistics/store-trend', params);
  }

  async getAreaOverview(params?: any): Promise<any> {
    return this.get<any>('/statistics/area-overview', params);
  }

  async getProblemDistribution(params?: any): Promise<any[]> {
    return this.get<any[]>('/statistics/problem-distribution', params);
  }

  async calculateMonthly(params: { year: number; month: number }): Promise<void> {
    return this.post('/statistics/calculate-monthly', params);
  }
}

export const apiService = new ApiService();
