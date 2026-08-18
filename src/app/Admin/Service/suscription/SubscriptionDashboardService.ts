import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SubscriptionDashboardDto, SubscriptionItem, CreateSubscriptionRequestDto, UpdateSubscriptionRequestDto } from '../../models/SubscriptionDashboardDto';
import { environment } from '../../../env';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionDashboardService {
  private http = inject(HttpClient);

  // 🟢 Pointer sur /subscriptions au lieu de /subscriptions/dashboard
  private baseUrl = `${environment.BASIC_URL}/subscriptions`;

  // GET /api/v1/subscriptions/dashboard
  getDashboardStats(): Observable<SubscriptionDashboardDto> {
    return this.http.get<SubscriptionDashboardDto>(`${this.baseUrl}/dashboard`);
  }

  // GET /api/v1/subscriptions/dashboard/school/{schoolId}
  getDashboardBySchool(schoolId: string): Observable<SubscriptionItem> {
    return this.http.get<SubscriptionItem>(`${this.baseUrl}/dashboard/school/${schoolId}`);
  }

  // GET /api/v1/subscriptions
  getAllSubscriptions(): Observable<SubscriptionItem[]> {
    return this.http.get<SubscriptionItem[]>(this.baseUrl);
  }

  // POST /api/v1/subscriptions/school/{schoolId}/send-email
  sendEmail(schoolId: string, payload: { subject: string; message: string }): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/school/${schoolId}/send-email`, payload);
  }

  // POST /api/v1/subscriptions/school/{schoolId}
  createSubscription(schoolId: string, payload: CreateSubscriptionRequestDto): Observable<SubscriptionItem> {
    return this.http.post<SubscriptionItem>(`${this.baseUrl}/school/${schoolId}`, payload);
  }

  // PUT /api/v1/subscriptions/{subscriptionId}
  updateSubscription(subscriptionId: string, payload: UpdateSubscriptionRequestDto): Observable<SubscriptionItem> {
    return this.http.put<SubscriptionItem>(`${this.baseUrl}/${subscriptionId}`, payload);
  }
}
