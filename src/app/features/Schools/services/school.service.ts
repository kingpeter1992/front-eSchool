import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../env';
import { SchoolStatus, SchoolResponse, SchoolRequest } from '../models/school.model';

@Injectable({
  providedIn: 'root'
})
export class SchoolService {

 private http = inject(HttpClient);
  private apiUrl = `${environment.BASIC_URL}/schools`;

  /**
   * Récupère la liste des écoles depuis l'API
   */
getAllSchools(status?: SchoolStatus): Observable<SchoolResponse[]> {
  let params = new HttpParams();

  if (status) {
    params = params.set('status', status);
  }

  return this.http.get<SchoolResponse[]>(this.apiUrl, { params }).pipe(
    tap((response) => {
      console.log('🔎 RESPONSE GET ALL SCHOOLS:', response);
      console.log('🔎 EST ARRAY ?', Array.isArray(response));
    })
  );
}

  /**
   * Création d'une école (Multipart/Form-Data)
   */
  createSchool(request: SchoolRequest): Observable<SchoolResponse> {
    const formData = this.buildFormData(request);
    return this.http.post<SchoolResponse>(this.apiUrl, formData);
  }

  /**
   * Modification d'une école (Multipart/Form-Data)
   */
  updateSchool(id: string, request: SchoolRequest): Observable<SchoolResponse> {
    const formData = this.buildFormData(request);
    return this.http.put<SchoolResponse>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Mise à jour rapide du statut
   */
  updateStatus(id: string, status: SchoolStatus): Observable<SchoolResponse> {
    return this.http.patch<SchoolResponse>(`${this.apiUrl}/${id}/status`, null, {
      params: { status }
    });
  }

  getById(id: string): Observable<SchoolResponse> {
  return this.http.get<SchoolResponse>(
    `${this.apiUrl}/${id}`
  );
}

  /**
   * Suppression douce
   */
  deleteSchool(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Construction du FormData pour le logo et les champs texte
   */
  private buildFormData(request: SchoolRequest): FormData {
  const formData = new FormData();

  if (request.name) formData.append('name', request.name);
  if (request.email) formData.append('email', request.email);
  if (request.phone) formData.append('phone', request.phone);
  if (request.currency) formData.append('currency', request.currency);
  if (request.timezone) formData.append('timezone', request.timezone);
  if (request.domain) formData.append('domain', request.domain);

  // 🟢 CORRECTION : Utiliser 'logo' au lieu de 'logoFile'
  if (request.logoFile) {
    formData.append('logo', request.logoFile);
  }

  return formData;
}
}
