import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { switchMap, map, finalize } from 'rxjs/operators';
import { AuthResponse, Role, LoginRequest, CreateUserDto } from '../models/User';
import { StorageService } from '../storage-service/storage-service';
import { AppInitializerStore } from './AppInitializerStore';
import { AuthService } from './auth-service';
import { RbacStore } from './RbacStore';
import { SplashStore } from './SplashStore';
import { Toast } from '../../shared/toaste/Toast';

@Injectable({
  providedIn: 'root'
})
export class AuthStoreService {
  private readonly service = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(Toast);
  private readonly storage = inject(StorageService);
  private readonly initializer = inject(AppInitializerStore);
  private readonly splash = inject(SplashStore);
  private readonly rbacStore = inject(RbacStore);

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
          return this.initializer.initialize().pipe(map(() => response));
        }),
        finalize(() => {
          this._loading.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          this.splash.update('Bienvenue 👋', 100);
          this.splash.hide();
          this.redirectBasedOnRoles(response.user.roles);
        },
        error: (err) => {
          this.splash.hide();
          const message = err?.error?.message ?? 'Identifiants incorrects.';
          this._error.set(message);
          this.toast.error(message);
        }
      });
  }

  logout(): void {
    this.storage.clean();
    this.rbacStore.clearCache();
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  hasRole(role: string): boolean {
    const userRoles = this.roles().map(r => typeof r === 'string' ? r : r.id || r.slug || r.name);
    return userRoles.includes(role);
  }

  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }

  register(payload: CreateUserDto): void {
    this._loading.set(true);
    this._error.set(null);
    this.splash.show('Inscription en cours...');

    this.service.register(payload).pipe(
      finalize(() => {
        this._loading.set(false);
        this.splash.hide();
      })
    ).subscribe({
      next: () => {
        this.toast.success('Compte créé avec succès ! Veuillez vous connecter.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Une erreur est survenue lors de l\'inscription.';
        this._error.set(message);
        this.toast.error(message);
      }
    });
  }

  private redirectBasedOnRoles(roles: (Role | string)[]): void {
    const roleKeys = roles.map(r => typeof r === 'string' ? r : r.id || r.slug || r.name);

    if (roleKeys.includes('ROLE_SUPER_ADMIN') || roleKeys.includes('SUPER_ADMIN')) {
      this.router.navigate(['/dashboard']);
      return;
    }

    if (roleKeys.includes('ROLE_ADMIN_ECOLE') || roleKeys.includes('ADMIN_ECOLE')) {
      this.router.navigate(['/admin_ecole']);
      return;
    }

    if (roleKeys.includes('ROLE_ENSEIGNANT') || roleKeys.includes('ENSEIGNANT')) {
      this.router.navigate(['/teacher']);
      return;
    }

    if (roleKeys.includes('ROLE_ELEVE') || roleKeys.includes('ELEVE')) {
      this.router.navigate(['/student']);
      return;
    }

    if (roleKeys.includes('ROLE_PARENT') || roleKeys.includes('PARENT')) {
      this.router.navigate(['/parent']);
      return;
    }

    this.router.navigate(['/unauthorized']);
  }
}
