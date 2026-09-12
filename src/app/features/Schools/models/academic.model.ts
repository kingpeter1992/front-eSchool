export type AcademicYearStatus = 'PREPARATION' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
export type AcademicTermType = 'TRIMESTER' | 'SEMESTER' | 'PERIOD';
export type AcademicPeriodStatus = 'UPCOMING' | 'OPEN_FOR_GRADING' | 'CLOSED' | 'LOCKED';

export interface AcademicYear {
  id: string;
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: AcademicYearStatus;
}

export interface AcademicTerm {
  id: string;
  academicYearId: string;
  type: AcademicTermType;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  status?: string;
}

export interface AcademicPeriod {
  id: string;
  academicYearId: string;
  academicTermId: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  status: AcademicPeriodStatus;
}
export interface EditDialogData {
  title: string;
  name: string;
  numericOrder?: number;
  hasDependents: boolean;
  dependentMessage?: string;
}

// --- Modèles de données ---
export interface AcademicCycle {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  sections: AcademicSection[];
  levels?: AcademicLevel[];
}
export interface AcademicSection {
  id: string;
  cycleId: string;
  name: string;
  options: AcademicOption[];
}
export interface AcademicOption {
  id: string;
  sectionId: string;
  name: string;
  code: string;
}

export interface AcademicLevel {
  id: string;
  name: string;
  orderIndex: number;
  optionId?: string;
  cycleId?:string
}


