import { Injectable, signal, computed, inject } from '@angular/core';
import { SchoolService } from '../services/school.service';
import { SchoolResponse, SchoolRequest, SchoolStatus } from '../models/school.model';
import { tap, catchError, of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SchoolStore {
 private schoolService = inject(SchoolService);

  // État local en mémoire (Signals)
  private _schools = signal<SchoolResponse[]>([]);
  private _isLoading = signal<boolean>(false);
  private _isInitialized = signal<boolean>(false);
  private _selectedStatus = signal<SchoolStatus | undefined>(undefined);

  // Selectors réactifs
  readonly schools = computed(() => {
    const status = this._selectedStatus();
    if (!status) return this._schools();
    return this._schools().filter(s => s.status === status);
  });

  readonly isLoading = computed(() => this._isLoading());
  readonly selectedStatus = computed(() => this._selectedStatus());

  /**
   * Charge la liste avec cache.
   * Si forceRefresh = false et déjà initialisé, fait une synchronisation silencieuse.
   */
  loadSchools(forceRefresh = false): Observable<SchoolResponse[]> {
    if (this._isInitialized() && !forceRefresh) {
      this.fetchAndSync().subscribe(); // Sync en arrière-plan sans bloquer
      return of(this._schools());
    }

    this._isLoading.set(true);
    return this.fetchAndSync().pipe(
      tap(() => this._isLoading.set(false))
    );
  }

  private fetchAndSync(): Observable<SchoolResponse[]> {
    return this.schoolService.getAllSchools().pipe(
      tap((data) => {
        this._schools.set(data);
        this._isInitialized.set(true);
      }),
      catchError((err) => {
        console.error('Erreur lors du chargement des écoles :', err);
        return of(this._schools());
      })
    );
  }

  setStatusFilter(status?: SchoolStatus): void {
    this._selectedStatus.set(status);
  }

  // --- Actions / Mutations ---

  createSchool(request: SchoolRequest): Observable<SchoolResponse> {
    this._isLoading.set(true);
    return this.schoolService.createSchool(request).pipe(
      tap((newSchool) => {
        // Mise à jour réactive du Signal local
        this._schools.update(list => [newSchool, ...list]);
        this._isLoading.set(false);
      }),
      catchError((err) => {
        this._isLoading.set(false);
        throw err;
      })
    );
  }

  updateSchool(id: string, request: SchoolRequest): Observable<SchoolResponse> {
    this._isLoading.set(true);
    return this.schoolService.updateSchool(id, request).pipe(
      tap((updatedSchool) => {
        this._schools.update(list =>
          list.map(s => s.id === id ? updatedSchool : s)
        );
        this._isLoading.set(false);
      }),
      catchError((err) => {
        this._isLoading.set(false);
        throw err;
      })
    );
  }

  updateStatus(id: string, status: SchoolStatus): Observable<SchoolResponse> {
    return this.schoolService.updateStatus(id, status).pipe(
      tap((updatedSchool) => {
        this._schools.update(list =>
          list.map(s => s.id === id ? updatedSchool : s)
        );
      })
    );
  }

  deleteSchool(id: string): Observable<void> {
    return this.schoolService.deleteSchool(id).pipe(
      tap(() => {
        this._schools.update(list => list.filter(s => s.id !== id));
      })
    );
  }
}
