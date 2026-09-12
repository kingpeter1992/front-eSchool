import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AcademicYear, AcademicTerm, AcademicPeriod } from '../../models/academic.model';
import { environment } from '../../../../env';

@Injectable({ providedIn: 'root' })
export class AcademicApiService {

  private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.BASIC_URL;


  // --- ACADEMIC YEARS ---
  getYears(schoolId: string): Observable<AcademicYear[]> {
    return this.http.get<AcademicYear[]>(`${this.baseUrl}/academic-years/academic-years-list`, {
      params: new HttpParams().set('schoolId', schoolId)
    });
  }

  getActiveYear(schoolId: string): Observable<AcademicYear> {
    return this.http.get<AcademicYear>(`${this.baseUrl}/academic-years/active`, {
      params: new HttpParams().set('schoolId', schoolId)
    });
  }

  createYear(schoolId: string, dto: Partial<AcademicYear>): Observable<AcademicYear> {
    return this.http.post<AcademicYear>(`${this.baseUrl}/academic-years/academic-years-create`, dto, {
      params: new HttpParams().set('schoolId', schoolId)
    });
  }

  // Dans AcademicApiService.ts
updateYear(schoolId: string, yearId: string, dto: Partial<AcademicYear>): Observable<AcademicYear> {
  return this.http.put<AcademicYear>(`${this.baseUrl}/academic-years/${yearId}?schoolId=${schoolId}`, dto);
}

updateTerm(schoolId: string, termId: string, dto: Partial<AcademicTerm>): Observable<AcademicTerm> {
  return this.http.put<AcademicTerm>(`${this.baseUrl}/academic-terms/${termId}?schoolId=${schoolId}`, dto);
}
  activateYear(schoolId: string, yearId: string): Observable<AcademicYear> {
    return this.http.patch<AcademicYear>(`${this.baseUrl}/academic-years/academic-years/${yearId}/activate`, null, {
      params: new HttpParams().set('schoolId', schoolId)
    });
  }

  // --- ACADEMIC TERMS ---
  getTermsByYear(schoolId: string, academicYearId: string): Observable<AcademicTerm[]> {
    return this.http.get<AcademicTerm[]>(`${this.baseUrl}/academic-terms`, {
      params: new HttpParams().set('schoolId', schoolId).set('academicYearId', academicYearId)
    });
  }

  createTerm(schoolId: string, dto: Partial<AcademicTerm>): Observable<AcademicTerm> {
    return this.http.post<AcademicTerm>(`${this.baseUrl}/academic-terms`, dto, {
      params: new HttpParams().set('schoolId', schoolId)
    });
  }

  // --- ACADEMIC PERIODS ---
  getPeriodsByTerm(schoolId: string, academicYearId: string, academicTermId: string): Observable<AcademicPeriod[]> {
    return this.http.get<AcademicPeriod[]>(`${this.baseUrl}/academic-periods`, {
      params: new HttpParams()
        .set('schoolId', schoolId)
        .set('academicYearId', academicYearId)
        .set('academicTermId', academicTermId)
    });
  }

  createPeriod(schoolId: string, dto: Partial<AcademicPeriod>): Observable<AcademicPeriod> {
    return this.http.post<AcademicPeriod>(`${this.baseUrl}/academic-periods`, dto, {
      params: new HttpParams().set('schoolId', schoolId)
    });
  }

  updatePeriodStatus(schoolId: string, periodId: string, status: string): Observable<AcademicPeriod> {
    return this.http.patch<AcademicPeriod>(`${this.baseUrl}/academic-periods/${periodId}/status`, null, {
      params: new HttpParams().set('schoolId', schoolId).set('status', status)
    });
  }
}
