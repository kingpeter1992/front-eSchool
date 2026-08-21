export enum SchoolStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED'
}

export interface CampusResponse {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  city?:string;
  province?:string;
  country?:string;
  status?: CampusStatus; // 👈 Typage explicite (évite le type 'any')
}

export enum CampusStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface SchoolResponse {
  id: string;
  code: string;
  name: string;
  email: string;
  phone?: string;
  currency: string;
  timezone: string;
  domain?: string;
  logoUrl?: string;
  status: SchoolStatus;
  campuses: CampusResponse[];

  // Statistiques affichées dans le dashboard
  totalStudents?: number;
  totalTeachers?: number;
  totalCourses?: number;
  totalClasses?: number;
  totalParents?: number;
  totalCampuses?: number;
}

export interface SchoolRequest {
  name: string;
  email: string;
  phone?: string;
  currency?: string;
  timezone?: string;
  domain?: string;
  logoFile?: File | null;
}

export interface CampusRequest {
  name: string;
  address?: string;
  phone?: string;
}
