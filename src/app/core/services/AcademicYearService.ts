import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AcademicYear } from '../../features/Schools/models/academic.model';
import { environment } from '../../env';


@Injectable({
  providedIn: 'root',
})
export class AcademicYearService {
  private readonly http = inject(HttpClient);
      private readonly apiUrl = environment.BASIC_URL+'/academic-years';

  getActiveYear(schoolId: string | null): Observable<AcademicYear | null> {
    if (!schoolId) {
      return new Observable((observer) => {
        observer.next(null);
        observer.complete();
      });
    }
    const params = new HttpParams().set('schoolId', schoolId);
    return this.http.get<AcademicYear>(`${this.apiUrl}/active`, { params });
  }
}
