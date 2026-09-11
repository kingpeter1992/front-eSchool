export interface EnrollmentStudent {

  id: string;

  firstName: string;

  lastName: string;

  gender?: string;

  photoUrl?: string;

  dateOfBirth?: string;

}


export interface EnrollmentParent {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}


export interface EnrollmentSchool {
  id: string;
  name: string;
  code?: string;
}


export interface EnrollmentAcademicYear {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  active?: boolean;
}


export interface EnrollmentClass {
  id: string;
  name: string;
  maxCapacity: number;
  currentStudents?: number;
}


export interface UpdateEnrollmentRequest {
  status: EnrollmentStatus;
  classId?: string;
}

export type EnrollmentStatus =
  | 'PENDING'
  | 'REVIEWING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'ENROLLED';

export interface EnrollmentResponse {
  id: string;
  schoolId: string;
  schoolName?: string;
  campusId: string;
  campusName?: string;
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  candidateFirstName?: string;
  candidateLastName?: string;
  parentName?: string;
  classId?: string;
  className?: string;
  levelName?: string;
  academicYearId: string;
  academicYearName?: string;
  registrationNo?: string;
  status: EnrollmentStatus;
  admissionDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignClassRequest {
  enrollmentId: string;
  classId: string;
  overrideCapacity?: boolean;
  overrideReason?: string;
}

export interface CreateEnrollmentRequest {
  schoolId: string;
  campusId: string;
  academicYearId: string;
  studentId?: string;
  candidateFirstName?: string;
  candidateLastName?: string;
  parentUserId?: string;
}

export interface UpdateEnrollmentRequest {
  status: EnrollmentStatus;
  classId?: string;
}

export interface ClassOption {
  id: string;
  name: string;
  levelName?: string;
  campusId?: string;
  campusName?: string;
  maxCapacity: number;
  currentCount: number;
  availableSeats: number;
  isFull: boolean;
}
export interface EnrollmentStatusResponseModel {
  registrationNo: string;
  candidateFullName: string;
  submissionDate: string;
  schoolName: string;
  campusName: string;
  status: 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED';
  stepNumber: number;
  statusLabel: string;
  remarks?: string;
}
