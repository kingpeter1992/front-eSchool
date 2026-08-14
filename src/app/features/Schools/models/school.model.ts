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
