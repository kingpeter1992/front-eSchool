import { Component, computed, EventEmitter, inject, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { SCHOOL_IMPORTS } from '../../services/school-imports';
import { AcademicPeriod, AcademicPeriodStatus, AcademicYear } from '../../models/academic.model';
import { StorageService } from '../../../../core/storage-service/storage-service';

@Component({
  selector: 'app-academic-management',
  standalone: true,
  imports: [SCHOOL_IMPORTS],
  templateUrl: './academic-management.html',
  styleUrl: './academic-management.scss',
})
export class AcademicManagement implements OnChanges {

  // Inputs transmis par le composant parent
  @Input({ required: true }) schoolId!: string;
  @Input({ required: true }) academicYears: AcademicYear[] = [];

  // Output émis vers le composant parent
  @Output() academicYearSelected = new EventEmitter<AcademicYear>();

  // Signals locaux pour la gestion de l'état du composant
  yearsList = signal<AcademicYear[]>([]);
  selectedYear = signal<AcademicYear | null>(null);

  // Exemple de données simulées pour les périodes de l'année sélectionnée
  academicPeriods = signal<AcademicPeriod[]>([
    { id: 'p1', academicYearId: '2', name: 'Premier Trimestre', code: 'T1', startDate: '2026-09-01', endDate: '2026-11-30', status: 'OPEN_FOR_GRADING' },
    { id: 'p2', academicYearId: '2', name: 'Deuxième Trimestre', code: 'T2', startDate: '2026-12-01', endDate: '2027-02-28', status: 'UPCOMING' },
    { id: 'p3', academicYearId: '2', name: 'Troisième Trimestre', code: 'T3', startDate: '2027-03-01', endDate: '2027-06-30', status: 'UPCOMING' }
  ]);


   private readonly storageService = inject(StorageService);

  // Signal / Computed pour vérifier les rôles
  readonly canEditSchool = computed(() => {
  const user = this.storageService.getUser();
  if (!user || !user.roles) return false;

  const allowedRoles = ['ROLE_SUPER_ADMIN', 'SUPER_ADMIN', 'ROLE_ADMIN_ECOLE', 'ADMIN_ECOLE'];

  // Extraction propre des rôles qu'ils soient sous forme de chaînes ou d'objets
  const userRoleKeys: string[] = user.roles.map((r: any) => {
    if (typeof r === 'string') return r;
    return r.slug || r.name || r.id || '';
  });

  return userRoleKeys.some((roleKey) => allowedRoles.includes(roleKey));
});



  // Modales & Formulaires
  isYearModalOpen = signal(false);
  isPeriodModalOpen = signal(false);

  newYear = signal<Partial<AcademicYear>>({ name: '', startDate: '', endDate: '' });
  newPeriod = signal<Partial<AcademicPeriod>>({ name: '', code: '', startDate: '', endDate: '' });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['academicYears'] && this.academicYears) {
      this.yearsList.set(this.academicYears);

      // Définit par défaut l'année ACTIVE ou la première de la liste
      const active = this.academicYears.find(y => y.status === 'ACTIVE') || this.academicYears[0] || null;
      if (active) {
        this.selectYear(active);
      }
    }
  }

  // Sélectionner une année et notifier le parent
  selectYear(year: AcademicYear): void {
    this.selectedYear.set(year);
    this.academicYearSelected.emit(year);
  }

  // Action pour activer une année
  activateYear(yearId: string): void {
    const updated = this.yearsList().map(y => ({
      ...y,
      status: y.id === yearId ? ('ACTIVE' as const) : (y.status === 'ACTIVE' ? ('CLOSED' as const) : y.status)
    }));

    this.yearsList.set(updated);
    const newlyActive = updated.find(y => y.id === yearId);
    if (newlyActive) {
      this.selectYear(newlyActive);
    }
  }

  // Enregistrer une nouvelle année
  saveYear(): void {
    const yearData = this.newYear();
    if (!yearData.name || !yearData.startDate || !yearData.endDate) return;

    if (yearData.endDate! <= yearData.startDate!) {
      alert("La date de fin doit être strictement postérieure à la date de début.");
      return;
    }

    const created: AcademicYear = {
      id: Date.now().toString(),
      schoolId: this.schoolId,
      name: yearData.name!,
      startDate: yearData.startDate!,
      endDate: yearData.endDate!,
      status: 'PREPARATION'
    };

    this.yearsList.update(list => [...list, created]);
    this.isYearModalOpen.set(false);
    this.newYear.set({ name: '', startDate: '', endDate: '' });
  }

  // Action sur les périodes
  updatePeriodStatus(periodId: string, status: AcademicPeriodStatus): void {
    this.academicPeriods.update(periods =>
      periods.map(p => p.id === periodId ? { ...p, status } : p)
    );
  }

  isLateSubmission(endDate: string): boolean {
    return new Date() > new Date(endDate);
  }
}
