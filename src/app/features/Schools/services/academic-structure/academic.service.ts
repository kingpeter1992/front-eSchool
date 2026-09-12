import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AcademicCycle, AcademicSection, AcademicOption, AcademicLevel, AcademicYear, AcademicPeriod, AcademicPeriodStatus } from '../../models/academic.model';
import { environment } from '../../../../env';
import { CycleNode } from '../../models/academic-tree.model';


@Injectable({ providedIn: 'root' })
export class AcademicService {


  private readonly http = inject(HttpClient);

  private readonly baseUrl = environment.BASIC_URL + '/academic-years';
  private readonly baseUrl2 = environment.BASIC_URL + '/academic-structures';

  // ==========================================
  // 1. AcademicStructureController Endpoints
  // ==========================================
  getCycles(schoolId: string): Observable<AcademicCycle[]> {
    return this.http.get<AcademicCycle[]>(`${this.baseUrl2}/cycles?schoolId=${schoolId}`);
  }

  createCycle(data: { schoolId: string; name: string }): Observable<AcademicCycle> {
    return this.http.post<AcademicCycle>(`${this.baseUrl2}/cycles`, data);
  }

  /**
   * Ajoute un niveau d'études à un cycle académique
   */
 addLevelToCycle(payload: {
  cycleId: string;
  name: string;
  numericOrder: number;
}): Observable<AcademicLevel> {
  const { cycleId, ...body } = payload;

  // URL corrigée avec l'ID du cycle dans la route
  return this.http.post<AcademicLevel>(
    `${this.baseUrl2}/cycles/${cycleId}/levels`,
    body // Envoie { name, numericOrder } dans le JSON
  );
}

  createSection(data: { cycleId: string; name: string }): Observable<AcademicSection> {
    return this.http.post<AcademicSection>(`${this.baseUrl2}/sections`, data);
  }


  getLevelsByOption(optionId: string): Observable<AcademicLevel[]> {
    return this.http.get<AcademicLevel[]>(`${this.baseUrl2}/levels?optionId=${optionId}`);
  }

  assignOptionToLevel(levelId: string, optionId: string): Observable<AcademicLevel> {
    return this.http.put<AcademicLevel>(`${this.baseUrl2}/levels/${levelId}/options/${optionId}`, {});
  }

  // ==========================================
  // 2. ClassController Endpoints
  // ==========================================


  getYearsBySchool(schoolId: string): Observable<AcademicYear[]> {
    const params = new HttpParams().set('schoolId', schoolId);
    return this.http.get<AcademicYear[]>(`${this.baseUrl}/academic-years-list`, { params });
  }


   getYearsBySchoolActive(schoolId: string): Observable<AcademicYear> {
    const params = new HttpParams().set('schoolId', schoolId);
    return this.http.get<AcademicYear>(`${this.baseUrl}/active`, { params });
  }


  deleteClass(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/classes/${id}`);
  }

getStructureTree(schoolId: string): Observable<CycleNode[]> {
    return this.http.get<CycleNode[]>(`${this.baseUrl2}/tree/${schoolId}`);
  }




  getYears(schoolId: string): Observable<AcademicYear[]> {
    return this.http.get<AcademicYear[]>(`${this.baseUrl}/academic-years-list`, {
      params: new HttpParams().set('schoolId', schoolId)
    });
  }

  createYear(schoolId: string, year: Partial<AcademicYear>): Observable<AcademicYear> {
    return this.http.post<AcademicYear>(`${this.baseUrl}/academic-years-create`, year, {
      params: new HttpParams().set('schoolId', schoolId)
    });
  }

  activateYear(schoolId: string, yearId: string): Observable<AcademicYear> {
    return this.http.patch<AcademicYear>(`${this.baseUrl}/academic-years/${yearId}/activate`, null, {
      params: new HttpParams().set('schoolId', schoolId)
    });
  }

  getPeriods(yearId: string): Observable<AcademicPeriod[]> {
    return this.http.get<AcademicPeriod[]>(`${this.baseUrl}/academic-periods`, {
      params: new HttpParams().set('yearId', yearId)
    });
  }

  createPeriod(period: Partial<AcademicPeriod>): Observable<AcademicPeriod> {
    return this.http.post<AcademicPeriod>(`${this.baseUrl}/academic-periods`, period);
  }

  updatePeriodStatus(periodId: string, status: AcademicPeriodStatus): Observable<AcademicPeriod> {
    return this.http.patch<AcademicPeriod>(`${this.baseUrl}/academic-periods/${periodId}/status`, null, {
      params: new HttpParams().set('status', status)
    });
  }


  // ==========================================
  // UPDATES & DELETES - STRUCTURE ACADÉMIQUE
  // ==========================================

  // Cycle
  updateCycle(id: string, data: { name: string }): Observable<AcademicCycle> {
    return this.http.put<AcademicCycle>(`${this.baseUrl2}/cycles/${id}`, data);
  }

  deleteCycle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl2}/cycles/${id}`);
  }

  // Niveau
  updateLevel(id: string, data: { name: string; numericOrder: number }): Observable<AcademicLevel> {
    return this.http.put<AcademicLevel>(`${this.baseUrl2}/levels/${id}`, data);
  }

  deleteLevel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl2}/levels/${id}`);
  }

  // Section
  updateSection(id: string, data: { name: string }): Observable<AcademicSection> {
    return this.http.put<AcademicSection>(`${this.baseUrl2}/sections/${id}`, data);
  }

  deleteSection(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl2}/sections/${id}`);
  }

  // Dans AcademicService :
createOption(dto: { sectionId: string; name: string; code: string }): Observable<AcademicOption> {
  return this.http.post<AcademicOption>(`${this.baseUrl2}/options`, dto);
}

updateOption(id: string, dto: { name: string; code: string }): Observable<AcademicOption> {
  return this.http.put<AcademicOption>(`${this.baseUrl2}/options/${id}`, dto);
}

deleteOption(id: string): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl2}/options/${id}`);
}
}
