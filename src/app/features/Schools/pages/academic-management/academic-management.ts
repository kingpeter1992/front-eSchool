import { Component,   EventEmitter,   inject, Input, OnChanges,  Output,  signal, SimpleChanges } from '@angular/core';
import { SCHOOL_IMPORTS } from '../../services/school-imports';
import { AcademicPeriod,  AcademicPeriodStatus,  AcademicTerm, AcademicYear, AcademicYearStatus  } from '../../models/academic.model';
import { AcademicApiStore } from '../../services/academic-structure/AcademicApiStore';
import { Toast } from '../../../../shared/toaste/Toast';

@Component({
  selector: 'app-academic-management',
  standalone: true,
  imports: [SCHOOL_IMPORTS],
  templateUrl: './academic-management.html',
  styleUrl: './academic-management.scss',
})
export class AcademicManagement implements OnChanges {

  @Input({ required: true }) schoolId!: string;
  @Input() academicYears: AcademicYear[] = [];

  @Output() academicYearSelected = new EventEmitter<AcademicYear>();

  readonly store = inject(AcademicApiStore);
  readonly toast = inject(Toast)

  // ============================================================
  // UI
  // ============================================================
  readonly isYearModalOpen = signal(false);
  readonly isPeriodModalOpen = signal(false);
  readonly selectedPeriodCategory = signal<'TRIMESTER' | 'SEMESTER' | 'PERIOD'>('TRIMESTER');

  // ============================================================
  // NOUVELLE ANNÉE
  // ============================================================
  readonly newYear = signal<{
    name: string;
    startDate: string;
    endDate: string;
    status: AcademicYearStatus;
  }>({
    name: '',
    startDate: '',
    endDate: '',
    status: 'PREPARATION'
  });

  // ============================================================
  // NOUVELLE PÉRIODE
  // ============================================================
  readonly newPeriod = signal<{
    name: string;
    code: string;
    startDate: string;
    endDate: string;
    status: AcademicPeriodStatus;
  }>({
    name: '',
    code: '',
    startDate: '',
    endDate: '',
    status: 'UPCOMING'
  });

  // ============================================================
  // LIFECYCLE
  // ============================================================
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['schoolId'] && this.schoolId) {
      this.store.loadYears(this.schoolId);
    }
  }

  // ============================================================
  // ANNÉE SCOLAIRE
  // ============================================================
  selectYear(year: AcademicYear): void {
    this.store.selectYear(this.schoolId, year);
    this.academicYearSelected.emit(year);
  }

  activateYear(yearId: string): void {
    this.store.activateYear(this.schoolId, yearId).subscribe({
      next: () => this.toast.showSuccess('Année académique activée avec succès'),
      error: () =>  this.toast.info("Erreur lors de l'activation de l'année")
    });
  }

  openYearModal(): void {
    this.resetYearForm();
    this.isYearModalOpen.set(true);
  }

  closeYearModal(): void {
    this.isYearModalOpen.set(false);
    this.resetYearForm();
  }

  saveYear(): void {
    const data = this.newYear();

    if (!data.name || !data.startDate || !data.endDate) {
      this.toast.info('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (data.endDate <= data.startDate) {
      this.toast.info('La date de fin doit être postérieure à la date de début.');
      return;
    }

    this.store.createYear(this.schoolId, data).subscribe({
      next: () => {
        this.toast.showSuccess('Année académique créée avec succès');
        this.closeYearModal();
      },
      error: () => this.toast.info("Erreur lors de la création de l'année")
    });
  }

  resetYearForm(): void {
    this.newYear.set({
      name: '',
      startDate: '',
      endDate: '',
      status: 'PREPARATION'
    });
  }

  updateYearField(
    field: 'name' | 'startDate' | 'endDate' | 'status',
    value: string
  ): void {
    this.newYear.update(current => ({
      ...current,
      [field]: value
    }));
  }

  // ============================================================
  // PÉRIODES
  // ============================================================
  openPeriodModal(): void {
    this.resetPeriodForm();
    this.isPeriodModalOpen.set(true);
  }

  closePeriodModal(): void {
    this.isPeriodModalOpen.set(false);
    this.resetPeriodForm();
  }

  savePeriod(): void {
    const currentYear = this.store.selectedYear();
    const data = this.newPeriod();

    if (!currentYear || !data.name || !data.code || !data.startDate || !data.endDate) {
      this.toast.info('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (data.endDate <= data.startDate) {
     this.toast.info('La date de fin doit être postérieure à la date de début.');
      return;
    }

    this.store.createPeriod(this.schoolId, {
      ...data,
      code: data.code.toUpperCase()
    }).subscribe({
      next: () => {
       this.toast.showSuccess('Période créée avec succès');
        this.closePeriodModal();
      },
      error: () => this.toast.info('Erreur lors de la création de la période')
    });
  }

  resetPeriodForm(): void {
    this.newPeriod.set({
      name: '',
      code: '',
      startDate: '',
      endDate: '',
      status: 'UPCOMING'
    });
    this.selectedPeriodCategory.set('TRIMESTER');
  }

  updatePeriodField(
    field: 'name' | 'code' | 'startDate' | 'endDate' | 'status',
    value: string
  ): void {
    this.newPeriod.update(current => ({
      ...current,
      [field]: value
    }));
  }

  updatePeriodStatus(periodId: string, status: AcademicPeriodStatus): void {
    this.store.updatePeriodStatus(this.schoolId, periodId, status).subscribe({
      next: () => this.toast.showSuccess('Statut de la période mis à jour'),
      error: () => this.toast.info('Erreur lors de la mise à jour du statut')
    });
  }

  onCategoryChange(category: 'TRIMESTER' | 'SEMESTER' | 'PERIOD'): void {
    this.selectedPeriodCategory.set(category);
    const current = this.newPeriod();

    if (category === 'TRIMESTER') {
      this.newPeriod.set({ ...current, code: 'T1', name: 'Trimestre 1' });
    } else if (category === 'SEMESTER') {
      this.newPeriod.set({ ...current, code: 'S1', name: 'Semestre 1' });
    } else if (category === 'PERIOD') {
      this.newPeriod.set({ ...current, code: 'P1', name: 'Période 1' });
    }
  }

  // ============================================================
  // HELPERS UI
  // ============================================================
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      ACTIVE: 'Active',
      PREPARATION: 'Préparation',
      CLOSED: 'Clôturée',
      ARCHIVED: 'Archivée',
      UPCOMING: 'À venir',
      OPEN_FOR_GRADING: 'Saisie ouverte',
      LOCKED: 'Verrouillée'
    };

    return labels[status] ?? status;
  }

  getCategoryLabel(): string {
    const category = this.selectedPeriodCategory();
    if (category === 'TRIMESTER') return 'Trimestre';
    if (category === 'SEMESTER') return 'Semestre';
    return 'Période';
  }

  getYearCount(): number {
    return this.store.yearsList().length;
  }

  getPeriodCount(): number {
    return this.store.periodsList().length;
  }
}
