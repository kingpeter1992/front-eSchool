import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { switchMap, map, finalize } from 'rxjs';
import { Toast } from '../../shared/toaste/Toast';
import { User, LoginRequest, CreateUserDto, Role, AuthResponse } from '../models/User';
import { StorageService } from '../storage-service/storage-service';
import { AppInitializerStore } from './AppInitializerStore';
import { AuthService } from './auth-service';
import { SplashStore } from './SplashStore';

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

  private readonly _user = signal<AuthResponse | null>(this.storage.getUser());

  private readonly _loading = signal(false);

  private readonly _error = signal<string | null>(null);

  readonly user = this._user.asReadonly();

  readonly loading = this._loading.asReadonly();

  readonly error = this._error.asReadonly();

  readonly isLoggedIn = computed(() => !!this.storage.getToken());

  readonly roles = computed<string[]>(() => {
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
        }),
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
        },
      });
  }

  logout(): void {
    this.storage.clean();

    this._user.set(null);

    this.router.navigate(['/login']);
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }

private redirectBasedOnRoles(roles: string[]): void {
    if (roles.includes('ROLE_SUPER_ADMIN')) {
      this.router.navigate(['/dashboard']);
      return;
    }

    if (roles.includes('ROLE_ADMIN_ECOLE')) {
      this.router.navigate(['/admin_ecole']);
      return;
    }

    if (roles.includes('ROLE_ENSEIGNANT')) {
      this.router.navigate(['/teacher']);
      return;
    }

    if (roles.includes('ROLE_ELEVE')) {
      this.router.navigate(['/student']);
      return;
    }

    if (roles.includes('ROLE_PARENT')) {
      this.router.navigate(['/parent']);
      return;
    }

    this.router.navigate(['/unauthorized']);
  }

 register(payload: CreateUserDto): void {
    this._loading.set(true);
    this._error.set(null);

    // Si vous souhaitez afficher un écran de chargement (Splash), décommentez la ligne suivante :
    this.splash.show('Inscription en cours...');

    this.service.register(payload).pipe(
      finalize(() => {
        this._loading.set(false);
         this.splash.hide();
      })
    ).subscribe({
      next: (response) => {
        // Affichez une notification de succès (selon l'API de votre service Toast)
        this.toast.success('Compte créé avec succès ! Veuillez vous connecter.');

        // Redirection vers la page de connexion ou autre
        this.router.navigate(['/login']);
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Une erreur est survenue lors de l\'inscription.';
        this._error.set(message);
        this.toast.error(message);
      }
    });
  }

}
