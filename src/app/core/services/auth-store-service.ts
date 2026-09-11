import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { switchMap, map, finalize } from 'rxjs/operators';
import {
  AuthResponse,
  Role,
  LoginRequest,
  CreateUserDto,
  School,
  SchoolInfo,
} from '../models/User';
import { StorageService } from '../storage-service/storage-service';
import { AppInitializerStore } from './AppInitializerStore';
import { AuthService } from './auth-service';
import { RbacStore } from './RbacStore';
import { SplashStore } from './SplashStore';
import { Toast } from '../../shared/toaste/Toast';
import { SchoolResponse } from '../../features/Schools/models/school.model';

@Injectable({
  providedIn: 'root',
})
export class AuthStoreService {
  private readonly service = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(Toast);
  private readonly storage = inject(StorageService);
  private readonly initializer = inject(AppInitializerStore);
  private readonly splash = inject(SplashStore);
  private readonly rbacStore = inject(RbacStore);

  private readonly _currentSchool = signal<SchoolResponse | null>(null);
  readonly currentSchool = this._currentSchool.asReadonly();

  // 2. Computed pour récupérer directement l'ID de l'école (avec fallback sur le user ou storage)
  readonly schoolId = computed(() => {
    return this._currentSchool()?.id ?? this._user()?.school?.id ?? '';
  });

  private readonly _user = signal<AuthResponse | null>(this.storage.getUser());
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly isLoggedIn = computed(() => !!this.storage.getToken());

  readonly roles = computed<(Role | string)[]>(() => {
    const user = this._user();
    return user?.user?.roles ?? [];
  });

  readonly permissions = computed<string[]>(() => {
    const user = this._user();
    return user?.permissions ?? [];
  });

  login(payload: LoginRequest): void {
    this._loading.set(true);
    this._error.set(null);
    this.splash.show('Connexion...');

    this.service
      .login(payload)
      .pipe(
        switchMap((response) => {
          this.storage.saveAuth(response);
          this._user.set(response);

          const schoolPayload: SchoolResponse | null = response.school
            ? ({
                ...response.school,
                campuses: (response.school as any).campuses ?? [],
                status: (response.school as any).status,
              } as SchoolResponse)
            : null;

          return this.initializer
            .initialize(response.roles, schoolPayload, response.permissions)
            .pipe(map(() => response));
        }),
        finalize(() => {
          this._loading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.splash.update('Bienvenue 👋', 100);
          this.splash.hide();
          this.redirectBasedOnRoles(response.roles);
        },
        error: (err) => {
          this.splash.hide();
          const serverMessage = err?.error?.message;
          const errorMessage = serverMessage || 'Identifiants ou mot de passe incorrects.';
          this._error.set(errorMessage);
        },
      });
  }

  logout(): void {
    this.storage.clean();
    //    this.rbacStore.clearCache();
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  hasRole(role: string): boolean {
    const userRoles = this.roles().map((r) =>
      typeof r === 'string' ? r : r.id || r.slug || r.name,
    );
    return userRoles.includes(role);
  }

  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }

  register(payload: CreateUserDto): void {
    this._loading.set(true);
    this._error.set(null);
    this.splash.show('Inscription en cours...');

    this.service
      .register(payload)
      .pipe(
        finalize(() => {
          this._loading.set(false);
          this.splash.hide();
        }),
      )
      .subscribe({
        next: () => {
          this.toast.success('Compte créé avec succès ! Veuillez vous connecter.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          const message = err?.error?.message ?? "Une erreur est survenue lors de l'inscription.";
          this._error.set(message);
          this.toast.error(message);
        },
      });
  }
private redirectBasedOnRoles(roles: string[]): void {

    console.log('role user', roles)

  // 1. Si Super Admin -> Redirection vers le dashboard Admin
  if (roles.includes('ROLE_SUPER_ADMIN') || roles.includes('SUPER_ADMIN')) {
    this.router.navigate(['/dashboard']);
    return;
  }

  // 2. Si Admin École -> Redirection vers son espace école  //ROLE_ADMIN
  if (roles.includes('ROLE_ADMIN_ECOLE') || roles.includes('ADMIN_ECOLE') || roles.includes('ROLE_ADMIN') || roles.includes('ADMIN')) {
    this.router.navigate(['/admin_ecole']);
    return;
  }

  // 3. Fallback / Autres rôles
  this.router.navigate(['/unauthorized']);
}
}
