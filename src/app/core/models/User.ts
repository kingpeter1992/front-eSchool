export interface Permission {
  id: string;
  name: string;
  code: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
  school?: SchoolInfo;
  permissions: string[];
}

export interface User {

  id: string;

  email: string;

  firstName: string;

  lastName: string;

  phone?: string;

  status:
    | 'PENDING_ACTIVATION'
    | 'ACTIVE'
    | 'SUSPENDED'
    | 'LOCKED';

  schoolId?: string;

  campusId?: string;

  schoolName?: string;

  roles: string[];

  permissions: string[];
}

export interface SchoolInfo {

  id: string;

  name: string;

  code: string;

  email: string;

  phone?: string;

  logoUrl?: string;

  currency: string;

  timezone: string;

  domain?: string;

  status: string;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  schoolId?: string;
  campusId?: string;
  roleSlugs: string[];
}
