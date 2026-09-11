import { Injectable, computed, inject, signal } from '@angular/core';
import {
  EnrollmentResponse,
  CreateEnrollmentRequest,
  UpdateEnrollmentRequest,
  AssignClassRequest,
} from '../Models/enrollment.model';
import { EnrollmentService } from './enrollment.service';

@Injectable({
  providedIn: 'root',
})
export class EnrollmentStore {
  private readonly service = inject(EnrollmentService);

  // Recherche
  private readonly _searchQuery = signal<string>('');

  // ============================================================
  // SELECTORS
  // ============================================================

  private readonly _enrollments = signal<EnrollmentResponse[]>([]);
  private readonly _selectedEnrollment = signal<EnrollmentResponse | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _loadingDetails = signal(false);

  readonly enrollments = this._enrollments.asReadonly();
  readonly selectedEnrollment = this._selectedEnrollment.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly loadingDetails = this._loadingDetails.asReadonly(); // <-- AJOUTER CETTE LIGNE

  // Recherche exposée au composant
  readonly searchQuery = this._searchQuery.asReadonly();

  // ============================================================
  // FILTRAGE
  // ============================================================

  readonly filteredEnrollments = computed(() => {
    const query = this._searchQuery().toLowerCase().trim();

    const enrollments = this._enrollments();

    if (!query) {
      return enrollments;
    }

    return enrollments.filter((enrollment) => {
      const registrationNo = enrollment.registrationNo?.toLowerCase().includes(query);

      const status = enrollment.status?.toLowerCase().includes(query);

      return registrationNo || status;
    });
  });

  // ============================================================
  // KPI
  // ============================================================
  // KPIs
  readonly total = computed(() => this._enrollments().length);
  readonly pending = computed(
    () => this._enrollments().filter((e) => e.status === 'PENDING').length,
  );
  readonly reviewing = computed(
    () => this._enrollments().filter((e) => e.status === 'REVIEWING').length,
  );
  readonly accepted = computed(
    () => this._enrollments().filter((e) => e.status === 'ACCEPTED').length,
  );
  readonly enrolled = computed(
    () => this._enrollments().filter((e) => e.status === 'ENROLLED').length,
  );
  readonly rejected = computed(
    () => this._enrollments().filter((e) => e.status === 'REJECTED').length,
  );

  // ============================================================
  // SEARCH
  // ============================================================

  setSearchQuery(value: string): void {
    this._searchQuery.set(value);
  }

  clearSearch(): void {
    this._searchQuery.set('');
  }

  // ============================================================
  // LOAD BY SCHOOL
  // ============================================================

  loadBySchool(schoolId: string): void {
    this._loading.set(true);
    this._error.set(null);

    this.service.getBySchool(schoolId).subscribe({
      next: (data) => {
        this._enrollments.set(data);

        this._loading.set(false);
      },

      error: (error) => {
        console.error(error);

        this._error.set(error?.error?.message || 'Impossible de charger les inscriptions.');

        this._loading.set(false);
      },
    });
  }

  // ============================================================
  // LOAD DETAILS
  // ============================================================

  loadById(id: string): void {
    this._loadingDetails.set(true);
    this._selectedEnrollment.set(null);
    this._error.set(null);

    this.service.getById(id).subscribe({
      next: (enrollment) => {
        this._selectedEnrollment.set(enrollment);

        this._loadingDetails.set(false);
      },

      error: (error) => {
        console.error('Erreur récupération inscription', error);

        this._error.set(error?.error?.message || 'Impossible de récupérer le dossier.');

        this._loadingDetails.set(false);
      },
    });
  }
  // ============================================================
  // CREATE (avec Photo & Callback)
  // ============================================================

  create(
    request: CreateEnrollmentRequest,
    photoFile?: File | null,
    documents?: File[],
    onSuccess?: () => void,
  ): void {
    this._loading.set(true);
    this._error.set(null);

    // Envoi au service avec la photo ET le tableau de documents
    this.service.create(request, photoFile, documents).subscribe({
      next: (enrollment) => {
        this._enrollments.update((list) => [enrollment, ...list]);
        this._loading.set(false);
        if (onSuccess) {
          onSuccess();
        }
      },
      error: (error) => {
        console.error(error);
        this._error.set(error?.error?.message || "Impossible de créer le dossier d'inscription.");
        this._loading.set(false);
      },
    });
  }

  // ============================================================
  // UPDATE
  // ============================================================

  update(id: string, request: UpdateEnrollmentRequest): void {
    this._loading.set(true);
    this._error.set(null);

    this.service.updateStatus(id, request).subscribe({
      next: (updated) => {
        this._enrollments.update((list) => list.map((item) => (item.id === id ? updated : item)));

        this._selectedEnrollment.set(updated);

        this._loading.set(false);
      },

      error: (error) => {
        console.error(error);

        this._error.set(error?.error?.message || 'Impossible de modifier le dossier.');

        this._loading.set(false);
      },
    });
  }

  // ============================================================
  // DELETE
  // ============================================================

  delete(id: string): void {
    this._loading.set(true);
    this._error.set(null);

    this.service.delete(id).subscribe({
      next: () => {
        this._enrollments.update((list) => list.filter((item) => item.id !== id));

        this._loading.set(false);
      },

      error: (error) => {
        console.error(error);

        this._error.set(error?.error?.message || 'Impossible de supprimer le dossier.');

        this._loading.set(false);
      },
    });
  }

  changeStatus(classId: string | undefined, arg1: { status: string }) {}

  // Actions
  loadAll(): void {
    this._loading.set(true);
    this._error.set(null);
    this.service.getAll().subscribe({
      next: (data) => {
        this._enrollments.set(data);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err?.error?.message || 'Erreur lors du chargement des dossiers.');
        this._loading.set(false);
      },
    });
  }

  loadEnrollment(id: string): void {
    this._loadingDetails.set(true);
    this._error.set(null);
    this.service.getById(id).subscribe({
      next: (data) => {
        this._selectedEnrollment.set(data);
        this._loadingDetails.set(false);
      },
      error: (err) => {
        this._error.set(err?.error?.message || 'Erreur lors du chargement du dossier.');
        this._loadingDetails.set(false);
      },
    });
  }

  updateStatus(id: string, request: UpdateEnrollmentRequest): void {
    this._loading.set(true);
    this.service.updateStatus(id, request).subscribe({
      next: (updated) => {
        this._enrollments.update((list) => list.map((e) => (e.id === id ? updated : e)));
        this._selectedEnrollment.set(updated);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err?.error?.message || 'Erreur de mise à jour.');
        this._loading.set(false);
      },
    });
  }

  assignClass(id: string, request: AssignClassRequest): void {
    this._loading.set(true);
    this.service.assignClass(id, request).subscribe({
      next: (updated) => {
        this._enrollments.update((list) => list.map((e) => (e.id === id ? updated : e)));
        this._selectedEnrollment.set(updated);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err?.error?.message || "Erreur d'affectation.");
        this._loading.set(false);
      },
    });
  }

  // Dans enrollment.store.ts

  // 1. Alias pour correspondre à l'appel dans le composant
  loadEnrollments(): void {
    this.loadAll();
  }
}
