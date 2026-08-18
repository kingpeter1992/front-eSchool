import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../env';
import { Permission, Role, CreateUserDto, AssignUserAccessDto } from '../models/User';

@Injectable({
  providedIn: 'root',
})
export class RbacService {
  private readonly http = inject(HttpClient);

  private readonly httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${environment.BASIC_URL}/roles`, this.httpOptions);
  }

  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${environment.BASIC_URL}/permissions`, this.httpOptions);
  }

  updateRolePermissions(roleId: string, permissionIds: string[]): Observable<void> {
    return this.http.put<void>(`${environment.BASIC_URL}/roles/${roleId}/permissions`, permissionIds, this.httpOptions);
  }

  createUser(payload: CreateUserDto): Observable<void> {
    return this.http.post<void>(`${environment.BASIC_URL}/users`, payload, this.httpOptions);
  }

  // 🟢 NOUVELLE MÉTHODE : Affecter les rôles et permissions à un utilisateur
  assignUserRolesAndPermissions(payload: AssignUserAccessDto): Observable<void> {
    return this.http.put<void>(`${environment.BASIC_URL}/users/${payload.userId}/access`, payload, this.httpOptions);
  }
}
