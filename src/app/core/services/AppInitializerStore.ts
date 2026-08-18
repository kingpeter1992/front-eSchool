import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, timer, tap, catchError, delay } from 'rxjs';
import { SplashStore } from './SplashStore';
import { SubscriptionDashboardStore } from '../../Admin/Service/suscription/SubscriptionDashboardStore';
import { SchoolStore } from '../../features/Schools/services/school.store';
import { RbacStore } from './RbacStore';

@Injectable({
  providedIn: 'root',
})
export class AppInitializerStore {
  private readonly splash = inject(SplashStore);
  private readonly schoolStore = inject(SchoolStore);
  private readonly subscriptionStore = inject(SubscriptionDashboardStore);
  private readonly rbacStore = inject(RbacStore);

  initialize(): Observable<any> {
    this.splash.show('Préparation de votre espace...');

    return forkJoin({
      // 1. Chargement des configurations système
      config: timer(200).pipe(
        tap(() => this.splash.update('Chargement des configurations...', 25))
      ),
      // 2. Pré-chargement des écoles dans le cache
      schools: this.schoolStore.loadSchools(true).pipe(
        tap(() => this.splash.update('Chargement des établissements...', 50)),
        catchError((err) => {
          console.warn('⚠️ Impossible de pré-charger les écoles :', err);
          return timer(0);
        })
      ),
      // 3. Pré-chargement de la matrice RBAC (Rôles & Permissions)
      rbac: this.rbacStore.loadRbacCache().pipe(
        tap(() => this.splash.update('Chargement des rôles et permissions...', 75)),
        catchError((err) => {
          console.warn('⚠️ Impossible de pré-charger la matrice RBAC :', err);
          return timer(0);
        })
      ),
      // 4. Pré-chargement des statistiques d'abonnement
      subscriptions: this.subscriptionStore.fetchStatsObservable(true).pipe(
        tap(() => this.splash.update("Chargement des statistiques d'abonnement...", 90)),
        catchError((err) => {
          console.warn('⚠️ Impossible de pré-charger les souscriptions :', err);
          return timer(0);
        })
      ),
    }).pipe(
      tap(() => this.splash.update('Bienvenue 👋', 100)),
      delay(300),
      tap(() => this.splash.hide())
    );
  }
}