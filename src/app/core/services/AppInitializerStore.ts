import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, timer, tap, catchError, delay, of } from 'rxjs';

import { SplashStore } from './SplashStore';
import { SubscriptionDashboardStore } from '../../Admin/Service/suscription/SubscriptionDashboardStore';
import { SchoolStore } from '../../features/Schools/services/school.store';
import { RbacStore } from './RbacStore';
import { Role, SchoolInfo } from '../models/User';
import { SchoolResponse } from '../../features/Schools/models/school.model';
import { AcademicStore } from '../../features/Schools/services/academic-structure/academic.store';
import { CampusStore } from '../../features/Schools/services/campus/campus.store';

@Injectable({
  providedIn: 'root',
})
export class AppInitializerStore {
private readonly splash = inject(SplashStore);
  private readonly schoolStore = inject(SchoolStore);
  private readonly subscriptionStore = inject(SubscriptionDashboardStore);
  private readonly rbacStore = inject(RbacStore);
  private readonly academicStore = inject(AcademicStore);
  private readonly campusStore = inject(CampusStore);




initialize(
    roles: (Role | string)[],
    school?: SchoolResponse | null,
    permissions?: string[]
  ): Observable<any> {
    this.splash.show('Préparation de votre espace...');

    const roleKeys = roles.map((r) => (typeof r === 'string' ? r : r.slug || r.name || r.id));
    const isSuperAdmin = roleKeys.includes('ROLE_SUPER_ADMIN') || roleKeys.includes('SUPER_ADMIN');
    const isAdminEcole = roleKeys.includes('ROLE_ADMIN_ECOLE') || roleKeys.includes('ADMIN_ECOLE');

    /**
     * 👑 SUPER ADMIN : Pré-chargement des données globales
     */
    if (isSuperAdmin) {
      return forkJoin({
        config: timer(200).pipe(
          tap(() => this.splash.update('Chargement des configurations...', 20))
        ),
        schools: this.schoolStore.loadSchools(false).pipe(
          tap(() => this.splash.update('Chargement des établissements...', 40)),
          catchError(() => of(null))
        ),
        rbac: this.rbacStore.loadRbacCache().pipe(
          tap(() => this.splash.update('Chargement des rôles et permissions...', 70)),
          catchError(() => of(null))
        ),
        subscriptions: this.subscriptionStore.fetchStatsObservable(false).pipe(
          tap(() => this.splash.update("Chargement des abonnements...", 90)),
          catchError(() => of(null))
        )
      }).pipe(
        tap(() => this.splash.update('Bienvenue 👋', 100)),
        delay(300),
        tap(() => this.splash.hide())
      );
    }

    /**
     * 🏫 ADMIN ÉCOLE : Charger uniquement le contexte de son établissement
     */
    if (isAdminEcole && school?.id) {
      return forkJoin({
        school: this.schoolStore.loadMySchool(school).pipe(
          tap(() => this.splash.update('Chargement de votre établissement...', 30)),
          catchError(() => of(null))
        ),
        years: this.academicStore.loadYearsObservable(school.id).pipe(
          tap(() => this.splash.update('Chargement des années académiques...', 50)),
          catchError(() => of(null))
        ),
        cycles: this.academicStore.loadCyclesObservable(school.id).pipe(
          tap(() => this.splash.update('Chargement de la structure académique...', 70)),
          catchError(() => of(null))
        ),
        campuses: this.campusStore.loadCampusesObservable(school.id).pipe(
          tap(() => this.splash.update('Chargement des campus...', 85)),
          catchError(() => of(null))
        ),
        rbac: this.rbacStore.MyloadRbacCache(roles, permissions ?? []).pipe(
          tap(() => this.splash.update('Chargement de vos permissions...', 95)),
          catchError(() => of(null))
        )
      }).pipe(
        tap(() => this.splash.update('Bienvenue 👋', 100)),
        delay(300),
        tap(() => this.splash.hide())
      );
    }

    /**
     * 👤 AUTRES RÔLES
     */
    return timer(300).pipe(
      tap(() => this.splash.update('Bienvenue 👋', 100)),
      delay(200),
      tap(() => this.splash.hide())
    );
  }

}
