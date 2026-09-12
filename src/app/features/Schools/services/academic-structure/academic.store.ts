import { Injectable, computed, inject, signal } from '@angular/core';
import { AcademicService } from './academic.service';
import { Toast } from '../../../../shared/toaste/Toast';
import { AcademicCycle, AcademicLevel, AcademicPeriod, AcademicPeriodStatus, AcademicTerm, AcademicYear } from '../../models/academic.model';
import { CycleNode } from '../../models/academic-tree.model';
import { finalize, Observable, of, tap } from 'rxjs';
import { StorageService } from '../../../../core/storage-service/storage-service';

@Injectable({
  providedIn: 'root',
})
export class AcademicStore {

// ==========================================
  // INJECTIONS
  // ==========================================
  private readonly academicService = inject(AcademicService);
  private readonly academicYearService = inject(AcademicService);
  private readonly storageService = inject(StorageService);

  private readonly toast = inject(Toast);

  // ==========================================
  // ÉTATS (SIGNALS)
  // ==========================================
  // États Années Académiques (Cache)
  private readonly _years = signal<AcademicYear[]>([]);
  private readonly _activeYear = signal<AcademicYear | null>(null);
  private readonly _loadingYears = signal<boolean>(false);

  // États Structure & Classes
  readonly cycles = signal<AcademicCycle[]>([]);
  readonly levels = signal<AcademicLevel[]>([]);
  readonly classes = signal<any[]>([]); // Nouveau signal pour les classes
  // Dans les états (SIGNALS)
  readonly sections = signal<any[]>([]);
  readonly options = signal<any[]>([]);

  // États UI / Formulaires
  readonly loading = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly searchQuery = signal<string>('');

  // ==========================================
  // SELECTEURS PUBLICS & COMPUTED
  // ==========================================
  readonly years = this._years.asReadonly();
  readonly loadingYears = this._loadingYears.asReadonly();

  readonly activeYear = computed(() =>
    this._years().find((year) => year.status === 'ACTIVE') ?? null
  );

  // Selecteurs publics (Read-only)
  readonly activeYearId = computed(() => this._activeYear()?.id || '');

  // Signals
  private readonly _isYearsLoaded = signal<boolean>(false);
  readonly isCyclesLoaded = signal<boolean>(false);

// Signal principal stockant l'arborescence brute
  readonly tree = signal<CycleNode[]>([]);

  // Chargement de l'arborescence
  loadStructureTree(schoolId: string) {
    this.loading.set(true);
    this.academicService.getStructureTree(schoolId).subscribe({
      next: (data) => {
        this.tree.set(data);
        this.loading.set(false);
//        console.log('Structure académique chargée avec succès :', data);
      },
      error: (err) => {
     //   console.error('Erreur chargement structure académique', err);
        this.loading.set(false);
      }
    });
  }

  // ==========================================
  // MODULE : Années Académiques (Cache & Active)
  // ==========================================


  // Charge l'année académique active
  loadActiveYear(schoolId: string): void {
    if (!schoolId) return;
    this.academicYearService.getYearsBySchoolActive(schoolId).subscribe({
      next: (activeYear) => {
        this._activeYear.set(activeYear);
      },
      error: (err) => {
        console.error("Erreur lors du chargement de l'année active:", err);
        this._activeYear.set(null);
      },
    });
  }


  loadYears(schoolId: string, forceRefresh = false): void {
    if (!schoolId) return;
    if (!forceRefresh && this._years().length > 0) return; // Utilise le cache

    this._loadingYears.set(true);
    this.academicYearService.getYearsBySchool(schoolId).subscribe({
      next: (data) => {
        this._years.set(data);
        this._loadingYears.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des années:', err);
        this._loadingYears.set(false);
      },
    });
  }

  updateYearsCache(updatedYears: AcademicYear[]): void {
    this._years.set(updatedYears);
  }

  // ==========================================
  // MODULE 5 : Structure Académique (UC-AST)
  // ==========================================

  loadCycles(schoolId: string): void {
    if (!schoolId) return;
    this.loading.set(true);
    this.error.set(null);

    this.academicService.getCycles(schoolId).subscribe({
      next: (data) => {
        this.cycles.set(data);
        this.loading.set(false);
      //  console.log('Charger les cycles et l\'arborescence', data)
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors du chargement des cycles');
        this.loading.set(false);
      },
    });
  }


  /**
   * Ajoute un Niveau d'études à un Cycle donné
   */
  addLevelToCycle(
    cycleId: string,
    name: string,
    numericOrder: number,
    onSuccess?: () => void
  ): void {
    this.isSubmitting.set(true);
    this.error.set(null);

    const payload = { cycleId, name, numericOrder };

    this.academicService.addLevelToCycle(payload).subscribe({
      next: (newLevel) => {
        // Met à jour localement le cycle impacté sans tout recharger
        this.cycles.update((list) =>
          list.map((cycle) => {
            if (cycle.id === cycleId) {
              return {
                ...cycle,
                levels: [...(cycle.levels || []), newLevel],
              };
            }
            return cycle;
          })
        );

        this.isSubmitting.set(false);
        this.toast.showSuccess('Niveau ajouté au cycle avec succès !');
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        this.error.set(err.error?.message || "Erreur lors de l'ajout du niveau");
        this.isSubmitting.set(false);
      },
    });
  }

  createSection(dto: { cycleId: string; name: string }, onSuccess?: () => void): void {
    this.isSubmitting.set(true);
    this.error.set(null);

    this.academicService.createSection(dto).subscribe({
      next: (newSection) => {
        // Met à jour localement les sections du cycle
        this.cycles.update((list) =>
          list.map((cycle) => {
            if (cycle.id === dto.cycleId) {
              return {
                ...cycle,
                sections: [...(cycle.sections || []), newSection],
              };
            }
            return cycle;
          })
        );
        this.isSubmitting.set(false);
        this.toast.showSuccess('Section créée avec succès !');
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la création de la section');
        this.isSubmitting.set(false);
      },
    });
  }

  createOption(dto: { sectionId: string; name: string; code: string }, onSuccess?: () => void): void {
    this.isSubmitting.set(true);
    this.error.set(null);

    this.academicService.createOption(dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.showSuccess('Option créée avec succès !');
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        this.error.set(err.error?.message || "Erreur lors de la création de l'option");
        this.isSubmitting.set(false);
      },
    });
  }

  loadLevelsByOption(optionId: string): void {
    this.loading.set(true);
    this.academicService.getLevelsByOption(optionId).subscribe({
      next: (data) => {
        this.levels.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors du chargement des niveaux');
        this.loading.set(false);
      },
    });
  }


  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  // ==========================================
  // EDITION & SUPPRESSION STRUCTURE
  // ==========================================

  // Cycles
  updateCycle(id: string, name: string, onSuccess?: () => void): void {
    this.isSubmitting.set(true);
    this.academicService.updateCycle(id, { name }).subscribe({
      next: (updated) => {
        this.cycles.update((list) => list.map((c) => (c.id === id ? { ...c, name: updated.name } : c)));
        this.isSubmitting.set(false);
        this.toast.showSuccess('Cycle mis à jour avec succès !');
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la mise à jour du cycle');
        this.isSubmitting.set(false);
      },
    });
  }

  deleteCycle(id: string): void {
    this.loading.set(true);
    this.academicService.deleteCycle(id).subscribe({
      next: () => {
        this.cycles.update((list) => list.filter((c) => c.id !== id));
        this.loading.set(false);
        this.toast.showSuccess('Cycle supprimé avec succès !');
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Impossible de supprimer ce cycle.');
        this.loading.set(false);
      },
    });
  }

  // Niveaux
  updateLevel(levelId: string, name: string, numericOrder: number, onSuccess?: () => void): void {
    this.isSubmitting.set(true);
    this.academicService.updateLevel(levelId, { name, numericOrder }).subscribe({
      next: (updatedLevel) => {
        this.cycles.update((list) =>
          list.map((cycle) => ({
            ...cycle,
            levels: cycle.levels?.map((lvl) => (lvl.id === levelId ? updatedLevel : lvl)),
          }))
        );
        this.isSubmitting.set(false);
        this.toast.showSuccess('Niveau mis à jour !');
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur de modification du niveau');
        this.isSubmitting.set(false);
      },
    });
  }

  deleteLevel(levelId: string): void {
    this.loading.set(true);
    this.academicService.deleteLevel(levelId).subscribe({
      next: () => {
        this.cycles.update((list) =>
          list.map((cycle) => ({
            ...cycle,
            levels: cycle.levels?.filter((lvl) => lvl.id !== levelId),
          }))
        );
        this.loading.set(false);
        this.toast.showSuccess('Niveau supprimé !');
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Impossible de supprimer ce niveau.');
        this.loading.set(false);
      },
    });
  }

  // Sections
  updateSection(sectionId: string, name: string, onSuccess?: () => void): void {
    this.isSubmitting.set(true);
    this.academicService.updateSection(sectionId, { name }).subscribe({
      next: (updatedSec) => {
        this.cycles.update((list) =>
          list.map((cycle) => ({
            ...cycle,
            sections: cycle.sections?.map((sec) => (sec.id === sectionId ? updatedSec : sec)),
          }))
        );
        this.isSubmitting.set(false);
        this.toast.showSuccess('Section mise à jour !');
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur de modification de la section');
        this.isSubmitting.set(false);
      },
    });
  }

  deleteSection(sectionId: string): void {
    this.loading.set(true);
    this.academicService.deleteSection(sectionId).subscribe({
      next: () => {
        this.cycles.update((list) =>
          list.map((cycle) => ({
            ...cycle,
            sections: cycle.sections?.filter((sec) => sec.id !== sectionId),
          }))
        );
        this.loading.set(false);
        this.toast.showSuccess('Section supprimée !');
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Impossible de supprimer cette section.');
        this.loading.set(false);
      },
    });
  }


  // ==========================================
  // OPTIONS PÉDAGOGIQUES
  // ==========================================


  /**
   * Alias de convenance pour les formulaires Angular réactifs / Partial inputs
   */
  addOption(value: Partial<{ sectionId: string | null; name: string | null; code: string | null }>, onSuccess?: () => void): void {
    if (!value.sectionId || !value.name || !value.code) {
      this.error.set('Champs manquants pour la création de l\'option.');
      return;
    }

    this.createOption(
      {
        sectionId: value.sectionId,
        name: value.name,
        code: value.code,
      },
      onSuccess
    );
  }

  /**
   * Mettre à jour une Option d'une Section
   */
  updateOption(optionId: string, name: string, code: string, onSuccess?: () => void): void {
    this.isSubmitting.set(true);
    this.error.set(null);

    this.academicService.updateOption(optionId, { name, code }).subscribe({
      next: (updatedOption) => {
        this.cycles.update((list) =>
          list.map((cycle) => ({
            ...cycle,
            sections: cycle.sections?.map((section) => ({
              ...section,
              options: section.options?.map((opt) => (opt.id === optionId ? updatedOption : opt)),
            })),
          }))
        );
        this.isSubmitting.set(false);
        this.toast.showSuccess('Option mise à jour !');
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        this.error.set(err.error?.message || "Erreur lors de la modification de l'option");
        this.isSubmitting.set(false);
      },
    });
  }

  /**
   * Supprimer une Option
   */
  deleteOption(optionId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.academicService.deleteOption(optionId).subscribe({
      next: () => {
        this.cycles.update((list) =>
          list.map((cycle) => ({
            ...cycle,
            sections: cycle.sections?.map((section) => ({
              ...section,
              options: section.options?.filter((opt) => opt.id !== optionId),
            })),
          }))
        );
        this.loading.set(false);
        this.toast.showSuccess('Option supprimée !');
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Impossible de supprimer cette option.');
        this.loading.set(false);
      },
    });
  }



// Charger les années avec support du cache
  loadYearsObservable(schoolId: string, forceRefresh = false): Observable<AcademicYear[]> {
    if (!schoolId) return of([]);
    if (!forceRefresh && this._isYearsLoaded()) {
      return of(this._years());
    }

    this._loadingYears.set(true);
    return this.academicYearService.getYearsBySchool(schoolId).pipe(
      tap((data) => {
        this._years.set(data);
        this._isYearsLoaded.set(true);
      }),
      finalize(() => this._loadingYears.set(false))
    );
  }

  // Charger les cycles avec cache
  loadCyclesObservable(schoolId: string, forceRefresh = false): Observable<AcademicCycle[]> {
    if (!schoolId) return of([]);
    if (!forceRefresh && this.isCyclesLoaded()) {
      return of(this.cycles());
    }

    this.loading.set(true);
    return this.academicService.getCycles(schoolId).pipe(
      tap((data) => {
        this.cycles.set(data);
        this.isCyclesLoaded.set(true);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  // Exemples de mise à jour du cache lors d'une création
  createCycle(dto: { schoolId: string; name: string }, onSuccess?: () => void): void {
    this.academicService.createCycle(dto).subscribe({
      next: (newCycle) => {
        // Mise à jour locale sans re-fetch serveur
        this.cycles.update((list) => [...list, newCycle]);
        this.toast.showSuccess('Cycle créé avec succès !');
        if (onSuccess) onSuccess();
      }
    });
  }





  // État
  readonly yearsList = signal<AcademicYear[]>([]);
  readonly selectedYear = signal<AcademicYear | null>(null);
  readonly academicPeriods = signal<AcademicPeriod[]>([]);
  readonly isLoading = signal<boolean>(false);

  // Sécurité et Rôles
  readonly canEditSchool = computed(() => {
    const user = this.storageService.getUser();
    if (!user || !user.roles || !Array.isArray(user.roles)) return false;

    const allowedRoles = ['ROLE_SUPER_ADMIN', 'SUPER_ADMIN', 'ROLE_ADMIN_ECOLE', 'ADMIN_ECOLE'];
    const userRoles: string[] = user.roles.map((r: any) =>
      typeof r === 'string' ? r : (r.slug || r.name || r.code || r.id || '')
    );

    return userRoles.some(role => allowedRoles.includes(role));
  });



  selectYear(year: AcademicYear): void {
    this.selectedYear.set(year);
    this.academicYearService.getPeriods(year.id).subscribe({
      next: (periods) => this.academicPeriods.set(periods),
      error: () => this.academicPeriods.set([])
    });
  }



  activateYear(schoolId: string, yearId: string): void {
    if (!this.canEditSchool()) return;

    this.academicYearService.activateYear(schoolId, yearId).subscribe({
      next: () => this.loadYears(schoolId)
    });
  }

  createYear(schoolId: string, data: Partial<AcademicYear>, callback?: () => void): void {
    if (!this.canEditSchool()) return;

    this.academicYearService.createYear(schoolId, data).subscribe({
      next: () => {
        this.loadYears(schoolId);
        if (callback) callback();
      }
    });
  }

  createPeriod(periodData: Partial<AcademicPeriod>, callback?: () => void): void {
    if (!this.canEditSchool()) return;

    this.academicYearService.createPeriod(periodData).subscribe({
      next: (created) => {
        this.academicPeriods.update(list => [...list, created]);
        if (callback) callback();
      }
    });
  }

  updatePeriodStatus(periodId: string, status: AcademicPeriodStatus): void {
    if (!this.canEditSchool()) return;

    this.academicYearService.updatePeriodStatus(periodId, status).subscribe({
      next: (updated) => {
        this.academicPeriods.update(periods =>
          periods.map(p => p.id === periodId ? updated : p)
        );
      }
    });
  }
}
