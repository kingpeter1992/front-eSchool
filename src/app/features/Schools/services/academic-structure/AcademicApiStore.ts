import { inject, Injectable, signal, computed } from '@angular/core';
import { AcademicApiService } from './AcademicApiService';
import { StorageService } from '../../../../core/storage-service/storage-service';
import { AcademicYear, AcademicTerm, AcademicPeriod } from '../../models/academic.model';
import { Observable, tap } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class AcademicApiStore {

private readonly api = inject(AcademicApiService);
  private readonly storageService = inject(StorageService);

  // CACHE & ÉTAT GLOBAL
  readonly yearsList = signal<AcademicYear[]>([]);
  readonly activeYear = signal<AcademicYear | null>(null);
  readonly selectedYear = signal<AcademicYear | null>(null);

  readonly termsList = signal<AcademicTerm[]>([]);
  readonly activeTerm = signal<AcademicTerm | null>(null);
  readonly selectedTerm = signal<AcademicTerm | null>(null);

  readonly periodsList = signal<AcademicPeriod[]>([]);
  readonly activePeriod = signal<AcademicPeriod | null>(null);
  readonly academicPeriods = computed(() => this.periodsList());

  readonly isLoading = signal<boolean>(false);

  // SÉCURITÉ & ACCÈS
  readonly canEditSchool = computed(() => {
    const user = this.storageService.getUser();
    if (!user || !user.roles || !Array.isArray(user.roles)) return false;

    const allowedRoles = ['ROLE_SUPER_ADMIN', 'SUPER_ADMIN', 'ROLE_ADMIN_ECOLE', 'ADMIN_ECOLE'];
    const userRoles: string[] = user.roles.map((r: any) =>
      typeof r === 'string' ? r : (r.slug || r.name || r.code || r.id || '')
    );

    return userRoles.some(role => allowedRoles.includes(role));
  });

  // CHARGEMENT DES ANNÉES
  loadYears(schoolId: string): void {
    this.isLoading.set(true);
    this.api.getYears(schoolId).subscribe({
      next: (years) => {
        this.yearsList.set(years);
        const active = years.find(y => y.status === 'ACTIVE') || years[0] || null;
        if (active) {
          this.activeYear.set(active);
          this.selectYear(schoolId, active);
        }
        this.isLoading.set(false);
        console.log('annee active',years)
      },
      error: () => this.isLoading.set(false)
    });
  }

  // SÉLECTIONS
  selectYear(schoolId: string, year: AcademicYear): void {
    this.selectedYear.set(year);
    this.api.getTermsByYear(schoolId, year.id).subscribe({
      next: (terms) => {
        this.termsList.set(terms);
        if (terms.length > 0) {
          this.activeTerm.set(terms[0]);
          this.selectTerm(schoolId, year.id, terms[0]);
        } else {
          this.periodsList.set([]);
          this.selectedTerm.set(null);
        }
      }
    });
  }

  selectTerm(schoolId: string, yearId: string, term: AcademicTerm): void {
    this.selectedTerm.set(term);
    this.api.getPeriodsByTerm(schoolId, yearId, term.id).subscribe({
      next: (periods) => {
        this.periodsList.set(periods);
        const openPeriod = periods.find(p => p.status === 'OPEN_FOR_GRADING') || periods[0] || null;
        this.activePeriod.set(openPeriod);
      }
    });
  }

  // GESTION DES ANNÉES (Création, Modification, Activation)
  createYear(schoolId: string, dto: Partial<AcademicYear>): Observable<AcademicYear> {
    return this.api.createYear(schoolId, dto).pipe(
      tap(() => this.loadYears(schoolId))
    );
  }

  updateYear(schoolId: string, yearId: string, dto: Partial<AcademicYear>): Observable<AcademicYear> {
    return this.api.updateYear(schoolId, yearId, dto).pipe(
      tap(() => this.loadYears(schoolId))
    );
  }

  activateYear(schoolId: string, yearId: string): Observable<AcademicYear> {
    return this.api.activateYear(schoolId, yearId).pipe(
      tap(() => this.loadYears(schoolId))
    );
  }

  // GESTION DES TRIMESTRES / SEMESTRES
  createTerm(schoolId: string, dto: Partial<AcademicTerm>): Observable<AcademicTerm> {
    return this.api.createTerm(schoolId, dto).pipe(
      tap(() => {
        if (this.selectedYear()) {
          this.selectYear(schoolId, this.selectedYear()!);
        }
      })
    );
  }

  updateTerm(schoolId: string, termId: string, dto: Partial<AcademicTerm>): Observable<AcademicTerm> {
    return this.api.updateTerm(schoolId, termId, dto).pipe(
      tap(() => {
        if (this.selectedYear()) {
          this.selectYear(schoolId, this.selectedYear()!);
        }
      })
    );
  }

  // GESTION DES PÉRIODES
  createPeriod(schoolId: string, dto: Partial<AcademicPeriod>): Observable<AcademicPeriod> {
    return this.api.createPeriod(schoolId, dto).pipe(
      tap((period) => this.periodsList.update(list => [...list, period]))
    );
  }

  updatePeriodStatus(schoolId: string, periodId: string, status: string): Observable<AcademicPeriod> {
    return this.api.updatePeriodStatus(schoolId, periodId, status).pipe(
      tap((updated) => {
        this.periodsList.update(periods =>
          periods.map(p => p.id === periodId ? updated : p)
        );
      })
    );
  }
}
