import { SchoolResponse } from "../../features/Schools/models/school.model";

export interface Permission {
  id: string;
  name: string;
  code: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
  school?: SchoolResponse;
  permissions: string[];
}

export interface User {
  id: string;

  email: string;

  firstName: string;

  lastName: string;

  phone?: string;

  status: 'PENDING_ACTIVATION' | 'ACTIVE' | 'SUSPENDED' | 'LOCKED';

  schoolId?: string;

  campusId?: string;

  schoolName?: string;
  school? : any
  roles: Role[];

  permissions: Permission[];
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
export interface School {
  id: string;
  name: string;
}
export interface Permission {
  id: string;
  name: string;
  slug: string;
  category: string;
}
export interface Role {
  id: string;
  name: string;
  slug: string;
  system: boolean;
  permissions: Permission[];
}

export interface AssignUserAccessDto {
  userId: string;
  roleIds: string[];
  permissionIds: string[];
}


export interface ActivationContext {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  schoolId?: string;
}

export interface CompleteActivationPayload {
  token: string;
  password: string;
  phone?: string;
  occupation?: string;
  birthDate?: string;
  matricule?: string;
}
