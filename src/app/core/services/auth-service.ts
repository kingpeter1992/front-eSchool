import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { environment } from '../../env';
import { LoaderService } from '../../shared/loader/loader-service';
import { LoginRequest, User, CreateUserDto, AuthResponse, Permission, Role } from '../models/User';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly http = inject(HttpClient);

  private readonly loaderService = inject(LoaderService);

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  login(payload: LoginRequest): Observable<AuthResponse> {
    this.loaderService.show();

    return this.http
      .post<AuthResponse>(environment.BASIC_URL_AUTH_LOGIN, payload, this.httpOptions)
      .pipe(finalize(() => this.loaderService.hide()));
  }

  register(payload: CreateUserDto): Observable<AuthResponse> {
    this.loaderService.show();

    return this.http
      .post<AuthResponse>(environment.BASIC_URL_REGISTER, payload, this.httpOptions)
      .pipe(finalize(() => this.loaderService.hide()));
  }

    forgotPassword(email: string): Observable<any> {
    this.loaderService.show();
    return this.http
      .post(environment.BASIC_URL_FORGOT, { email }, this.httpOptions)
      .pipe(finalize(() => this.loaderService.hide()));
  }

  resetPassword(token: string, password: string): Observable<any> {
    this.loaderService.show();
    return this.http
      .post(environment.BASIC_URL_RENITIALISATION, { token, password }, this.httpOptions)
      .pipe(finalize(() => this.loaderService.hide()));
  }

    getUser(user: any) {
          this.loaderService.show();
   return this.http
      .post(environment.BASIC_URL+'/'+user?.id, this.httpOptions)
      .pipe(finalize(() => this.loaderService.hide()));

    }
getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${environment.BASIC_URL}/roles`);
  }

  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${environment.BASIC_URL}/permissions`);
  }

  updateRolePermissions(roleId: string, permissionIds: string[]): Observable<void> {
    return this.http.put<void>(`${environment.BASIC_URL}/roles/${roleId}/permissions`, permissionIds);
  }
  }
