import { Injectable, signal, computed, inject } from '@angular/core';
import { SchoolService } from '../services/school.service';
import { SchoolResponse, SchoolRequest, SchoolStatus } from '../models/school.model';
import { tap, catchError, of, Observable, finalize, EMPTY, map, throwError } from 'rxjs';
import { Toast } from '../../../shared/toaste/Toast';

@Injectable({
  providedIn: 'root',
})
export class SchoolStore {

  private readonly schoolService = inject(SchoolService);
  private readonly toast = inject(Toast);


  // ==============================
  // STATE
  // ==============================

  private readonly _schools = signal<SchoolResponse[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _isInitialized = signal(false);
  private readonly _selectedStatus = signal<SchoolStatus | undefined>(undefined);

  private readonly _selectedSchool = signal<SchoolResponse | null>(null);
  private readonly _isLoadingSchool = signal(false);
  private readonly _schoolError = signal<string | null>(null);



  readonly schools = this._schools.asReadonly();

  // ==============================
  // SELECTORS
  // ==============================

  readonly selectedSchool = this._selectedSchool.asReadonly();

  readonly isLoadingSchool = this._isLoadingSchool.asReadonly();

  readonly schoolError = this._schoolError.asReadonly();

  readonly selectedStatus = this._selectedStatus.asReadonly();

  readonly isLoading = this._isLoading.asReadonly();



  // ==============================
  // STATISTIQUES
  // ==============================

  readonly totalStudents = computed(() =>
    this._schools().reduce((total, school) => total + (school.totalStudents ?? 0), 0),
  );

  readonly totalTeachers = computed(() =>
    this._schools().reduce((total, school) => total + (school.totalTeachers ?? 0), 0),
  );

  readonly totalCourses = computed(() =>
    this._schools().reduce((total, school) => total + (school.totalCourses ?? 0), 0),
  );

  readonly totalClasses = computed(() =>
    this._schools().reduce((total, school) => total + (school.totalClasses ?? 0), 0),
  );

  // ==============================
  // LOAD SCHOOLS
  // ==============================

loadSchools(forceRefresh = false): Observable<SchoolResponse[]> {
  if (this._isInitialized() && !forceRefresh) {
    return of(this._schools());
  }
  this._isLoading.set(true);
  return this.fetchAndSync().pipe(
    finalize(() => {
      this._isLoading.set(false);
    })
  );
}

private fetchAndSync(): Observable<SchoolResponse[]> {
  return this.schoolService.getAllSchools().pipe(
    tap((schools) => {
      this._schools.set(schools);
      this._isInitialized.set(true);
    })
  );
}

  // ==============================
  // FILTER
  // ==============================

  setStatusFilter(status?: SchoolStatus): void {
    this._selectedStatus.set(status);
  }

  // ==============================
  // CREATE
  // ==============================

  createSchool(request: SchoolRequest): Observable<SchoolResponse> {
    this._isLoading.set(true);

    return this.schoolService.createSchool(request).pipe(
      tap((newSchool) => {
        this._schools.update((list) => [newSchool, ...list]);
      }),

      finalize(() => {
        this._isLoading.set(false);
      }),
    );
  }

  // ==============================
  // UPDATE
  // ==============================

  updateSchool(id: string, request: SchoolRequest): Observable<SchoolResponse> {
    this._isLoading.set(true);

    return this.schoolService.updateSchool(id, request).pipe(
      tap((updatedSchool) => {
        this._schools.update((list) =>
          list.map((school) => (school.id === id ? updatedSchool : school)),
        );
      }),

      finalize(() => {
        this._isLoading.set(false);
      }),
    );
  }

  // ==============================
  // STATUS
  // ==============================

  updateStatus(id: string, status: SchoolStatus): Observable<SchoolResponse> {
    return this.schoolService.updateStatus(id, status).pipe(
      tap((updatedSchool) => {
        this._schools.update((list) =>
          list.map((school) => (school.id === id ? updatedSchool : school)),
        );
      }),
    );
  }

  // ==============================
  // DELETE
  // ==============================

  deleteSchool(id: string): Observable<void> {
    return this.schoolService.deleteSchool(id).pipe(
      tap(() => {
        this._schools.update((list) => list.filter((school) => school.id !== id));
      }),
    );
  }

  // ==============================
  // GET ONE SCHOOL
  // ==============================

  loadSchool(id: string): void {
    this._isLoadingSchool.set(true);
    this._schoolError.set(null);
    this._selectedSchool.set(null);

    this.schoolService
      .getById(id)
      .pipe(
        tap((school) => {
          this._selectedSchool.set(school);
          console.log('ecole', school)
        }),
        catchError((error) => {
          this._schoolError.set(
            error?.error?.message ?? 'Impossible de récupérer les informations de cette école.',
          );
          return EMPTY;
        }),

        finalize(() => {
          this._isLoadingSchool.set(false);
        }),
      )
      .subscribe();
  }

// ==============================
// GET MY SCHOOL
// ==============================

loadMySchool(school: SchoolResponse): Observable<SchoolResponse> {

  if (!school) {
    return throwError(
      () => new Error(
        "Aucune école n'est associée à l'utilisateur connecté"
      )
    );
  }

  this._isLoadingSchool.set(true);
  this._schoolError.set(null);

  return of(school).pipe(
    tap((school) => {
      this._selectedSchool.set(school);

      console.log(
        '🏫 École de l’utilisateur connecté :',
        school
      );
    }),
    finalize(() => {
      this._isLoadingSchool.set(false);
    })
  );
}

}
