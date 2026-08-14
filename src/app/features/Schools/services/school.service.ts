import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { School } from '../models/school.model';
import { environment } from '../../../env';

@Injectable({
  providedIn: 'root'
})
export class SchoolService {
  private http = inject(HttpClient);

    private apiUrl = environment.BASIC_URL + 'schools';


  private schoolsSubject = new BehaviorSubject<School[]>([]);
  public schools$ = this.schoolsSubject.asObservable();

  // Charger ou rafraîchir les écoles avec mise en cache locale
  loadSchools(): void {
    this.http.get<School[]>(this.apiUrl).pipe(
      tap(schools => this.schoolsSubject.next(schools))
    ).subscribe();
  }

  createSchool(school: Partial<School>): Observable<School> {
    return this.http.post<School>(this.apiUrl, school).pipe(
      tap(() => this.loadSchools()) // Rafraîchit le cache après création
    );
  }

  updateSchool(id: string, school: Partial<School>): Observable<School> {
    return this.http.put<School>(`${this.apiUrl}/${id}`, school).pipe(
      tap(() => this.loadSchools())
    );
  }

  deleteSchool(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadSchools())
    );
  }
}
