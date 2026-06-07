export type UserRole = 'admin' | 'supervisor' | 'store_manager' | 'area_manager';

export interface User {
  id: number;
  username: string;
  realName: string;
  phone: string;
  role: UserRole;
  areaId?: number;
  avatar?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Area {
  id: number;
  name: string;
  code: string;
  parentId?: number;
  level: number;
  managerId?: number;
  children?: Area[];
}

export interface Store {
  id: number;
  name: string;
  code: string;
  areaId: number;
  areaName?: string;
  address: string;
  longitude: number;
  latitude: number;
  checkinRadius: number;
  managerId?: number;
  managerName?: string;
  franchiseeName?: string;
  franchiseePhone?: string;
  openingDate?: string;
  status: number;
}

export interface CheckCategory {
  id: number;
  name: string;
  code: string;
  sortOrder: number;
  description?: string;
}

export interface CheckItem {
  id: number;
  categoryId: number;
  name: string;
  scoringCriteria: string;
  weight: number;
  maxScore: number;
  sortOrder: number;
  mustPass: number;
  status: number;
}

export interface CheckItemWithCategory extends CheckItem {
  category?: CheckCategory;
}

export type TaskType = 'routine' | 'special' | 'recheck';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskStoreCheckStatus = 'pending' | 'checked' | 'recheck_needed';

export interface SupervisionTask {
  id: number;
  taskNo: string;
  name: string;
  supervisorId: number;
  supervisorName?: string;
  description?: string;
  taskType: TaskType;
  startDate: string;
  endDate: string;
  status: TaskStatus;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  stores?: TaskStore[];
}

export interface TaskStore {
  id: number;
  taskId: number;
  storeId: number;
  storeName?: string;
  checkStatus: TaskStoreCheckStatus;
  checkedAt?: string;
}

export interface CheckinRecord {
  id: number;
  taskId: number;
  storeId: number;
  storeName?: string;
  supervisorId: number;
  supervisorName?: string;
  longitude: number;
  latitude: number;
  distance?: number;
  isValid: number;
  invalidReason?: string;
  checkinTime: string;
  photoUrl?: string;
  createdAt: string;
}

export type ReportStatus = 'draft' | 'submitted' | 'confirmed';

export interface InspectionReport {
  id: number;
  reportNo: string;
  taskId: number;
  taskName?: string;
  storeId: number;
  storeName?: string;
  supervisorId: number;
  supervisorName?: string;
  checkinId: number;
  totalScore: number;
  maxScore: number;
  scoreRate: number;
  isPass: number;
  problemCount: number;
  mustPassFailed: number;
  summary?: string;
  improvementSuggestions?: string;
  inspectionDate: string;
  status: ReportStatus;
  submittedAt?: string;
  confirmedBy?: number;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
  itemScores?: InspectionItemScore[];
  photos?: InspectionPhoto[];
}

export interface InspectionItemScore {
  id: number;
  reportId: number;
  itemId: number;
  itemName?: string;
  categoryId: number;
  categoryName?: string;
  score: number;
  maxScore: number;
  weight: number;
  weightedScore: number;
  isPass: number;
  mustPass: number;
  problemDescription?: string;
}

export interface InspectionPhoto {
  id: number;
  reportId: number;
  itemScoreId?: number;
  photoUrl: string;
  photoType: 'overall' | 'problem' | 'evidence';
  description?: string;
  sortOrder: number;
}

export type RectificationStatus = 'pending' | 'rectified' | 'rechecked' | 'overdue';
export type RecheckResult = 'pass' | 'fail';

export interface RectificationOrder {
  id: number;
  orderNo: string;
  reportId: number;
  storeId: number;
  storeName?: string;
  itemScoreId: number;
  title: string;
  problemDescription: string;
  rectificationRequirements: string;
  deadlineDays: number;
  deadline: string;
  status: RectificationStatus;
  rectificationDescription?: string;
  rectifiedAt?: string;
  rectifiedBy?: number;
  rectifiedByName?: string;
  recheckReportId?: number;
  recheckResult?: RecheckResult;
  recheckedAt?: string;
  recheckedBy?: number;
  recheckedByName?: string;
  createdBy: number;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  photos?: RectificationPhoto[];
}

export interface RectificationPhoto {
  id: number;
  rectificationId: number;
  photoUrl: string;
  photoType: 'before' | 'after';
  description?: string;
}

export interface MonthlyScore {
  id: number;
  storeId: number;
  storeName?: string;
  areaId: number;
  areaName?: string;
  year: number;
  month: number;
  inspectionCount: number;
  avgScore: number;
  avgScoreRate: number;
  passCount: number;
  failCount: number;
  problemCount: number;
  rectificationCount: number;
  rankInArea?: number;
  rankCity?: number;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}
