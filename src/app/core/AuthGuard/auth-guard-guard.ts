import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from '../storage-service/storage-service';
import { Toast } from '../../shared/toaste/Toast';
import { Role } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private storage: StorageService,
    private toast: Toast
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {

    const isLoggedIn = this.storage.isLoggedIn();
    const authResponse = this.storage.getUser();

    // 1. Vérification de la session
    if (!isLoggedIn || !authResponse) {
      this.toast.info('Veuillez vous connecter.');
      return this.router.createUrlTree(['/login']);
    }

    const allowedRoles = route.data['roles'] as (string | Role)[] | undefined;

    // 2. Si aucun rôle n'est exigé sur la route, accès autorisé
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    // 3. Extraction de la liste des rôles (supporte authResponse.roles ou authResponse.user.roles)
    const rawRoles: (Role | string)[] = authResponse.roles || authResponse.user?.roles || [];

    // Conversion de tous les rôles utilisateur sous forme de chaînes de caractères (slug, name, ou string brute)
    const userRoleSlugs: string[] = rawRoles.map((r) => {
      if (typeof r === 'string') return r;
      return r.slug || r.name || '';
    });

    // Conversion des rôles requis sous forme de chaînes de caractères
    const allowedRoleSlugs: string[] = allowedRoles.map((r) => {
      if (typeof r === 'string') return r;
      return r.slug || r.name || '';
    });

    // 4. Comparaison des chaînes de caractères
    const hasRole = userRoleSlugs.some((userRole) =>
      allowedRoleSlugs.includes(userRole)
    );

    if (hasRole) {
      return true;
    }

    this.toast.error('Accès refusé.');
    return this.router.createUrlTree(['/unauthorized']);
  }
}
