import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SCHOOL_IMPORTS } from '../../../features/Schools/services/school-imports';
import { SubscriptionDashboardStore } from '../../Service/suscription/SubscriptionDashboardStore';
import {  PlanType, SubscriptionItem, SubscriptionStatus } from '../../models/SubscriptionDashboardDto';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SchoolStore } from '../../../features/Schools/services/school.store';
import { SchoolResponse } from '../../../features/Schools/models/school.model';
import { Toast } from '../../../shared/toaste/Toast';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-dasboard-subcription',
  standalone: true,
  imports: [SCHOOL_IMPORTS],
  templateUrl: './dasboard-subcription.html',
  styleUrl: './dasboard-subcription.scss',
})
export class DasboardSubcription implements OnInit {
  readonly store = inject(SubscriptionDashboardStore);
  readonly storeEcole = inject(SchoolStore);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toast = inject(Toast)

  readonly isSubmitting = signal<boolean>(false);

  readonly PlanTypes = Object.values(PlanType);
  readonly StatusTypes = Object.values(SubscriptionStatus);

  readonly isModalOpen = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly selectedSubscriptionId = signal<string | null>(null);

  // 🟢 Gestion Autocomplete École
  readonly schoolSearchQuery = signal<string>('');
  readonly isSchoolDropdownOpen = signal<boolean>(false);
  readonly selectedSchoolName = signal<string>('');

  // 🟢 Liste filtrée basée sur l'interface SchoolResponse
readonly filteredSchools = computed<SchoolResponse[]>(() => {
  const query = this.schoolSearchQuery().toLowerCase().trim();

  const schools = this.storeEcole.schools();

  if (!Array.isArray(schools)) {
    console.error('❌ schools n’est pas un tableau :', schools);
    return [];
  }

  if (!query) {
    return schools;
  }

  return schools.filter((school) => {
    const name = school.name?.toLowerCase() ?? '';
    const email = school.email?.toLowerCase() ?? '';
    const code = school.code?.toLowerCase() ?? '';

    return (
      name.includes(query) ||
      email.includes(query) ||
      code.includes(query)
    );
  });
});

  // 🟢 Gestionnaire de saisie pour la recherche
  onSchoolSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.schoolSearchQuery.set(value);
    this.selectedSchoolName.set(value);
    this.isSchoolDropdownOpen.set(true);

    // Invalide l'ID si le texte est modifié manuellement sans sélection dans la liste
    this.subscriptionForm.patchValue({ schoolId: '' });
  }

  // 🟢 Sélection d'une école depuis le dropdown
  selectSchool(school: SchoolResponse): void {
    this.subscriptionForm.patchValue({ schoolId: school.id });
    this.selectedSchoolName.set(school.name);
    this.schoolSearchQuery.set(school.name);
    this.isSchoolDropdownOpen.set(false);
  }

  // 🟢 Bascule l'affichage de la liste déroulante
  toggleSchoolDropdown(): void {
    if (!this.isEditMode()) {
      this.isSchoolDropdownOpen.update((open) => !open);
    }
  }
  subscriptionForm!: FormGroup;

ngOnInit(): void {
  this.initForm();
  this.store.fetchStats();
  this.store.loadSubscriptions();
  this.storeEcole.loadSchools().subscribe({
    next: (schools) => {    },
    error: (error) => {
      console.error('❌ Erreur chargement écoles:', error);
    }
  });
}

  private initForm(): void {
    this.subscriptionForm = this.fb.group({
      schoolId: ['', [Validators.required]],
      planType: [PlanType.BASIC, [Validators.required]],
      durationInMonths: [12, [Validators.required, Validators.min(1)]],
      amount: [0, [Validators.required, Validators.min(0)]],
      currency: ['USD', [Validators.required]],
      status: [SubscriptionStatus.ACTIVE],
    });
  }

  // 🟢 Ouverture Modal Création
  openCreateModal(schoolId?: string): void {
    this.isEditMode.set(false);
    this.selectedSubscriptionId.set(null);
    this.schoolSearchQuery.set('');
    this.selectedSchoolName.set('');
    this.isSchoolDropdownOpen.set(false);

    this.subscriptionForm.reset({
      schoolId: schoolId ?? '',
      planType: PlanType.BASIC,
      durationInMonths: 12,
      amount: 0,
      currency: 'USD',
      status: SubscriptionStatus.ACTIVE,
    });

    // Si un schoolId est transmis, on récupère l'école complète dans le store de l'école
    if (schoolId) {
      const school = this.storeEcole.schools()?.find((s) => s.id === schoolId);
      if (school) {
        this.selectSchool(school);
      }
    }

    this.isModalOpen.set(true);
  }

  // 🟢 Ouverture Modal Modification
  openEditModal(sub: SubscriptionItem): void {
    this.isEditMode.set(true);
    this.selectedSubscriptionId.set(sub.id);
    this.selectedSchoolName.set(sub.schoolName);
    this.isSchoolDropdownOpen.set(false);

    this.subscriptionForm.patchValue({
      schoolId: sub.schoolId,
      planType: sub.planType,
      durationInMonths: 12,
      amount: sub.amount,
      currency: sub.currency,
      status: sub.status,
    });

    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.isSchoolDropdownOpen.set(false);
  }
onSubmit(): void {
  if (this.subscriptionForm.invalid) {
    this.subscriptionForm.markAllAsTouched();
    return;
  }

  const formValue = this.subscriptionForm.value;
  this.isSubmitting.set(true); // 🟢 Active le loader local

  if (this.isEditMode()) {
    const subId = this.selectedSubscriptionId();
    if (!subId) {
      this.isSubmitting.set(false);
      return;
    }

    this.store.updateSubscription(subId, formValue)
      .pipe(finalize(() => this.isSubmitting.set(false))) // 🟢 Désactive le loader à la fin
      .subscribe({
        next: () => {
          this.closeModal();
          this.toast.showSuccess('Abonnement mis à jour !');
        },
        error: () => {
          this.toast.showError('Erreur lors de la mise à jour');
        }
      });
  } else {
    const schoolId = formValue.schoolId;
    if (!schoolId) {
      this.isSubmitting.set(false);
      return;
    }

    this.store.addSubscription(schoolId, formValue)
      .pipe(finalize(() => this.isSubmitting.set(false))) // 🟢 Désactive le loader à la fin
      .subscribe({
        next: () => {
          this.closeModal();
          this.toast.showSuccess('Abonnement créé avec succès !');
        },
        error: () => {
          this.toast.showError('Erreur lors de la création');
        }
      });
  }

}


  openEmailModal(sub: SubscriptionItem): void {
    const subject = prompt(`Sujet de l'email pour ${sub.schoolName} :`);
    if (!subject) return;

    const message = prompt(`Message à envoyer :`);
    if (!message) return;

    this.store.sendEmail(sub.schoolId, { subject, message }).subscribe({
      next: () => alert('Email envoyé avec succès !'),
    });
  }

  refreshData(): void {
    this.store.fetchStats(true);
    this.store.loadSubscriptions();
  }



  // 🟢 Redirection vers le détail de l'abonnement/école
// 🟢 Correction du chemin absolu avec le préfixe /admin/
goToDetails(schoolId: string): void {
  console.log('ecole sub', schoolId);
  if (schoolId) {
    this.router.navigate(['/admin/subscriptions/school', schoolId]);
  }
}



  // 🟢 Calcul du pourcentage de jours écoulés (0% à 100%)
  getElapsedPercentage(startsAt: string | Date, expiresAt: string | Date): number {
    const start = new Date(startsAt).getTime();
    const end = new Date(expiresAt).getTime();
    const now = new Date().getTime();

    if (now <= start) return 0;
    if (now >= end) return 100;

    const totalDuration = end - start;
    const elapsed = now - start;

    return Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
  }

  // 🟢 Calcul du nombre de jours restants
  getRemainingDays(expiresAt: string | Date): number {
    const end = new Date(expiresAt).getTime();
    const now = new Date().getTime();
    const diffTime = end - now;

    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }
}
