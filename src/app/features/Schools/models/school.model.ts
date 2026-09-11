export enum SchoolStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED'
}

export type CampusStatus = 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED' | 'INACTIVE' | 'DELETED';

export interface CampusResponse {
  id: string;
  schoolId: string;
  schoolName?: string;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  city?: string;
  province?: string;
  country?: string;
  status?: CampusStatus;
  managerId?: string;
  totalCapacity?: number;
  createdAt?: string;
}


export interface RoomResponse {
  id: string;
  name: string;
  code?: string;
  capacity?: number;
  type?: string;
  buildingId?: string;
equipments?: EquipmentResponse[]; // 👈 Spécifier explicitement le tableau d'équipements
}

export interface EquipmentResponse {
  id: string;
  name: string;
  quantity?: number;
  state?: string;
}
export interface CreateRoomRequest {
  name: string;
  code?: string;
  capacity?: number;
  buildingId?: string;
  type?: string; // 👈 Ajouter ici
}
export interface BuildingResponse {
  id: string;
  name: string;
  code?: string;
  floors?:number;
  rooms?: RoomResponse[];
}

export interface CreateBuildingRequest {
  name: string;
  code?: string;
  floors?:number
  campusId: string;
}


export interface BuildingRequest {
  name: string;
  code?: string;
}

export interface RoomRequest {
  requestId?:string;
  name: string;
  capacity?: number;
  equipments?: EquipmentRequest[];
  type?: string; // 👈 Ajouter ici
}

export interface EquipmentRequest {
  id?: string;
  name: string;
  quantity: number;
  state?: string;
}
export interface CampusRequest {
schoolId: string;
  name: string;
  address: string;
  city?: string;
  province?: string;
  country?: string;
  phone?: string;
  code?:string
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
  campuses?: CampusResponse[]; // 👈 Ajout du '?' pour le rendre optionnel

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



export interface ScheduleDTO {
  id?: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  isOpen: boolean;
  morningStartTime?: string; // Format "HH:mm" (ex: "08:00")
  morningEndTime?: string;   // Format "HH:mm" (ex: "12:00")
  eveningStartTime?: string; // Format "HH:mm" (ex: "13:00")
  eveningEndTime?: string;   // Format "HH:mm" (ex: "17:00")
}

export interface CampusScheduleRequest {
  campusId: string;
  schedules: ScheduleDTO[];
}
