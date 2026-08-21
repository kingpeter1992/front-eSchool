import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, timer, tap, catchError, delay, of } from 'rxjs';

import { SplashStore } from './SplashStore';
import { SubscriptionDashboardStore } from '../../Admin/Service/suscription/SubscriptionDashboardStore';
import { SchoolStore } from '../../features/Schools/services/school.store';
import { RbacStore } from './RbacStore';
import { Role } from '../models/User';
import { SchoolResponse } from '../../features/Schools/models/school.model';

@Injectable({
  providedIn: 'root',
})
export class AppInitializerStore {
  private readonly splash = inject(SplashStore);
  private readonly schoolStore = inject(SchoolStore);
  private readonly subscriptionStore = inject(SubscriptionDashboardStore);
  private readonly rbacStore = inject(RbacStore);

  initialize(
    roles: (Role | string)[],
    school?: SchoolResponse | null,
    permissions?: string[],
  ): Observable<any> {
    this.splash.show('Préparation de votre espace...');

    const roleKeys = roles.map((r) => (typeof r === 'string' ? r : r.id || r.slug || r.name));

    console.log('🔐 Rôles détectés :', roleKeys);

    /**
     * =====================================================
     * 👑 SUPER ADMIN
     * =====================================================
     */
    if (roleKeys.includes('ROLE_SUPER_ADMIN') || roleKeys.includes('SUPER_ADMIN')) {
      return forkJoin({
        // 1. Configurations système
        config: timer(200).pipe(
          tap(() => this.splash.update('Chargement des configurations...', 25)),
        ),

        // 2. Toutes les écoles
        schools: this.schoolStore.loadSchools(true).pipe(
          tap(() => this.splash.update('Chargement des établissements...', 50)),
          catchError((err) => {
            console.warn('⚠️ Impossible de pré-charger les écoles :', err);

            return of(null);
          }),
        ),

        // 3. RBAC
        rbac: this.rbacStore.loadRbacCache().pipe(
          tap(() => this.splash.update('Chargement des rôles et permissions...', 75)),
          catchError((err) => {
            console.warn('⚠️ Impossible de pré-charger la matrice RBAC :', err);

            return of(null);
          }),
        ),

        // 4. Statistiques abonnements
        subscriptions: this.subscriptionStore.fetchStatsObservable(true).pipe(
          tap(() => this.splash.update("Chargement des statistiques d'abonnement...", 90)),
          catchError((err) => {
            console.warn('⚠️ Impossible de pré-charger les souscriptions :', err);

            return of(null);
          }),
        ),
      }).pipe(
        tap(() => this.splash.update('Bienvenue 👋', 100)),
        delay(300),
        tap(() => this.splash.hide()),
      );
    }

    /**
     * =====================================================
     * 🏫 ADMIN ÉCOLE
     * =====================================================
     */
    if (roleKeys.includes('ROLE_ADMIN_ECOLE') || roleKeys.includes('ADMIN_ECOLE')) {
      return forkJoin({
        config: timer(200).pipe(
          tap(() => this.splash.update('Préparation de votre établissement...', 25)),
        ),

        school: school
          ? this.schoolStore.loadMySchool(school).pipe(
              tap(() => this.splash.update('Chargement de votre établissement...', 60)),
              catchError((err) => {
                console.warn('⚠️ Impossible de charger votre établissement :', err);

                return of(null);
              }),
            )
          : of(null),

        rbac: this.rbacStore.MyloadRbacCache(roles, permissions ?? []).pipe(
          tap(() => this.splash.update('Chargement de vos rôles et permissions...', 85)),
          catchError((err) => {
            console.warn('⚠️ Impossible de charger les permissions :', err);

            return of(null);
          }),
        ),
      }).pipe(
        tap(() => this.splash.update('Bienvenue 👋', 100)),
        delay(300),
        tap(() => this.splash.hide()),
      );
    }
    /**
     * =====================================================
     * 👤 AUTRES UTILISATEURS
     * =====================================================
     */
    return timer(300).pipe(
      tap(() => this.splash.update('Préparation de votre espace...', 80)),
      tap(() => this.splash.update('Bienvenue 👋', 100)),
      delay(300),
      tap(() => this.splash.hide()),
    );
  }
}
