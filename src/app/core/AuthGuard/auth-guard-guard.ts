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

    // Sécurité : Vérifie si l'utilisateur est connecté et si l'objet user existe
    if (!isLoggedIn || !authResponse || !authResponse.user) {
      this.toast.info('Veuillez vous connecter.');
      return this.router.createUrlTree(['/login']);
    }

    const allowedRoles = route.data['roles'] as Role[] | undefined;

    // Si aucune restriction de rôle n'est définie sur la route, on laisse passer
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    // Récupération sécurisée des rôles depuis l'objet user
    const userRoles = authResponse.user.roles || [];

    console.log('Allowed:', allowedRoles);
    console.log('User roles:', userRoles);

    // Vérifie si l'utilisateur possède au moins l'un des rôles autorisés
    const hasRole = userRoles.some(
      (role: Role) => allowedRoles.includes(role)
    );

    if (hasRole) {
      return true;
    }

    this.toast.error('Accès refusé.');
    return this.router.createUrlTree(['/unauthorized']);
  }
}
