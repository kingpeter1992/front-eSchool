import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { CreateUserDto, Role, User } from '../../../core/models/User';
import { environment } from '../../../env';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.BASIC_URL}/api/users/v1`;

  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  loadUsers(): void {
    this.http.get<User[]>(this.apiUrl).pipe(
      tap(users => this.usersSubject.next(users))
    ).subscribe();
  }


  updateUser(id: string, dto: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, dto).pipe(
      tap(() => this.loadUsers())
    );
  }

  assignRoles(userId: string, roleSlugs: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/roles`, { roleSlugs }).pipe(
      tap(() => this.loadUsers())
    );
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadUsers())
    );
  }
}
