import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { ActivationContext, CompleteActivationPayload } from "../../../core/models/User";
import { environment } from "../../../env";

@Injectable({
  providedIn: 'root'
})
export class ActivationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.BASIC_URL}`;

  verifyToken(token: string): Observable<ActivationContext> {
    return this.http.get<ActivationContext>(`${this.baseUrl}/verify-activation-token?token=${token}`);
  }

  completeActivation(payload: CompleteActivationPayload): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/complete-activation`, payload);
  }
}
