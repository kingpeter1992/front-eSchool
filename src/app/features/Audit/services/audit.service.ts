import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../env';

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  userRole: string;
  timestamp: string;
  schoolId: string;
  campusId: string;
  ipAddress: string;
  deviceInfo: string;
  actionType: string;
  targetEntity: string;
  targetId: string;
  oldValue: string;
  newValue: string;
  details: string;
}

export interface AuditFilter {
  page: number;
  size: number;
  actionType?: string;
  targetEntity?: string;
  fromDate?: string;
  schoolId?: string;       // 👈 Ajout de la propriété optionnelle
  toDate?: string;
}

@Injectable({ providedIn: 'root' })
export class AuditService {

 private readonly apiUrl = `${environment.BASIC_URL}/audit-logs`;
  constructor(private http: HttpClient) {}

  getLogs(filters: AuditFilter): Observable<any> {
    let params = new HttpParams()
      .set('page', filters.page.toString())
      .set('size', filters.size.toString());

    if (filters.actionType) params = params.set('actionType', filters.actionType);
    if (filters.targetEntity) params = params.set('targetEntity', filters.targetEntity);
    if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
    if (filters.toDate) params = params.set('toDate', filters.toDate);

    return this.http.get<any>(this.apiUrl, { params });
  }
}
