import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../env';
import { SchoolClassResponse, CreateClassDTO, UpdateClassDTO } from '../../models/class.model';


@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BASIC_URL}/classes`;

  getClassesByCampus(campusId: string): Observable<SchoolClassResponse[]> {
    return this.http.get<SchoolClassResponse[]>(`${this.apiUrl}/campus/${campusId}`);
  }

  getClassById(id: string): Observable<SchoolClassResponse> {
    return this.http.get<SchoolClassResponse>(`${this.apiUrl}/${id}`);
  }

  createClass(dto: CreateClassDTO): Observable<SchoolClassResponse> {
    return this.http.post<SchoolClassResponse>(this.apiUrl, dto);
  }

  updateClass(id: string, dto: UpdateClassDTO): Observable<SchoolClassResponse> {
    return this.http.put<SchoolClassResponse>(`${this.apiUrl}/${id}`, dto);
  }

  deleteClass(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
