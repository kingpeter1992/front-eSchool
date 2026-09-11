export type ShiftType = 'MORNING' | 'AFTERNOON';

export interface CreateClassDTO {
  schoolId: string;
  campusId: string;
  levelId: string;
  name: string;
  shift: ShiftType; // Obligatoire
  maxCapacity?: number;
  mainTeacherId?: string;
  cycleId?: string;
  sectionId?: string;
  optionId?: string;
  roomId?: string;
  status?: string;
}

export interface UpdateClassDTO {
  name: string;
  shift?: ShiftType;
  maxCapacity?: number;
  mainTeacherId?: string;
  status?: string;
  cycleId?: string;
  levelId?: string;
  sectionId?: string;
  optionId?: string;
  roomId?: string;
  schoolId?: string;
  campusId?: string;
}
export interface SchoolClassResponse {
  id: string;
  schoolId: string;
  campusId: string;
  levelId: string;
  levelName: string;
  roomId?: string;
  shift?: ShiftType;
  name: string;
  maxCapacity: number;
  currentEnrollment: number;
  mainTeacherId?: string;
  status: string;
}
