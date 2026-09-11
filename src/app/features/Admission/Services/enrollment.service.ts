// services/enrollment.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../env';
import { AssignClassRequest, CreateEnrollmentRequest, EnrollmentResponse, UpdateEnrollmentRequest } from '../Models/enrollment.model';


@Injectable({ providedIn: 'root' })
export class EnrollmentService {

  private http = inject(HttpClient);
    private readonly apiUrl = `${environment.BASIC_URL}/enrollments`;

  // ============================================================
  // GET ALL
  // ============================================================
  getAll(): Observable<EnrollmentResponse[]> {
    return this.http.get<EnrollmentResponse[]>(this.apiUrl);
  }

  // ============================================================
  // GET BY ID
  // ============================================================
    getById(id: string): Observable<EnrollmentResponse> {
    return this.http.get<EnrollmentResponse>(`${this.apiUrl}/${id}`);
  }


    // ============================================================
  // GET BY SCHOOL
  // ============================================================


   getBySchool(
    schoolId: string
  ): Observable<EnrollmentResponse[]> {

    return this.http.get<EnrollmentResponse[]>(
      `${this.apiUrl}/school/${schoolId}`
    );
  }


  // ============================================================
  // GET BY STATUS
  // ============================================================

  getByStatus(
    status: string
  ): Observable<EnrollmentResponse[]> {

    return this.http.get<EnrollmentResponse[]>(
      `${this.apiUrl}/status/${status}`
    );
  }


// ============================================================
  // CREATE
  // ============================================================
create(
    request: CreateEnrollmentRequest,
    photoFile?: File | null,
    documents?: File[]
  ): Observable<EnrollmentResponse> {
    const formData = new FormData();

    // 1. Ajout du DTO sous forme de Blob JSON
    formData.append(
      'data',
      new Blob([JSON.stringify(request)], { type: 'application/json' })
    );

    // 2. Ajout de la photo de profil
    if (photoFile) {
      formData.append('photo', photoFile, photoFile.name);
    }

    // 3. Ajout des pièces jointes (documents)
    if (documents && documents.length > 0) {
      documents.forEach((file) => {
        formData.append('documents', file, file.name);
      });
    }

    console.log(formData)

    return this.http.post<EnrollmentResponse>(this.apiUrl, formData);
  }


   // ============================================================
  // UPDATE
  // ============================================================

  updateStatus(id: string, request: UpdateEnrollmentRequest): Observable<EnrollmentResponse> {
    return this.http.put<EnrollmentResponse>(`${this.apiUrl}/${id}/status`, request);
  }

  assignClass(id: string, request: AssignClassRequest): Observable<EnrollmentResponse> {
    return this.http.put<EnrollmentResponse>(`${this.apiUrl}/${id}/assign-class`, request);
  }

    // ============================================================
  // DELETE
  // ============================================================

  delete(id: string): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}
