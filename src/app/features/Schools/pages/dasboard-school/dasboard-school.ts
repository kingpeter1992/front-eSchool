import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SchoolStatus, SchoolResponse, SchoolRequest } from '../../models/school.model';
import { SchoolStore } from '../../services/school.store';
import { SCHOOL_IMPORTS } from '../../services/school-imports';
import { Toast } from '../../../../shared/toaste/Toast';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dasboard-school',
  standalone: true,
  imports: [SCHOOL_IMPORTS],
  templateUrl: './dasboard-school.html',
  styleUrl: './dasboard-school.css',
})
export class DasboardSchool implements OnInit {
 protected readonly store = inject(SchoolStore);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(Toast)
  private readonly router = inject(Router);

  // 🟢 Signal/Variable pour le loader de soumission
  isSubmitting = signal<boolean>(false);

  readonly SchoolStatus = SchoolStatus;

  showModal = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  selectedSchoolId = signal<string | null>(null);
  selectedLogoFile: File | null = null;
  logoPreviewUrl = signal<string | null>(null);

  schoolForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    currency: ['USD'],
    timezone: ['UTC'],
    domain: ['']
  });

  ngOnInit(): void {
    this.store.loadSchools().subscribe();
  }

  filterByStatus(status?: SchoolStatus): void {
    this.store.setStatusFilter(status);
  }

  openCreateModal(): void {
    this.isEditMode.set(false);
    this.selectedSchoolId.set(null);
    this.selectedLogoFile = null;
    this.logoPreviewUrl.set(null);
    this.schoolForm.reset({ currency: 'USD', timezone: 'UTC' });
    this.showModal.set(true);
  }

  openEditModal(school: SchoolResponse): void {
    this.isEditMode.set(true);
    this.selectedSchoolId.set(school.id);
    this.selectedLogoFile = null;
    this.logoPreviewUrl.set(school.logoUrl || null);

    this.schoolForm.patchValue({
      name: school.name,
      email: school.email,
      phone: school.phone,
      currency: school.currency,
      timezone: school.timezone,
      domain: school.domain
    });
    this.showModal.set(true);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedLogoFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.logoPreviewUrl.set(reader.result as string);
      reader.readAsDataURL(this.selectedLogoFile);
    }
  }

saveSchool(): void {
  if (this.schoolForm.invalid) return;

  // 🟢 Activer le loader
  this.isSubmitting.set(true);

  const request: SchoolRequest = {
    name: this.schoolForm.value.name,
    email: this.schoolForm.value.email,
    phone: this.schoolForm.value.phone,
    currency: this.schoolForm.value.currency,
    timezone: this.schoolForm.value.timezone,
    domain: this.schoolForm.value.domain,
    logoFile: this.selectedLogoFile
  };

  const action$ = (this.isEditMode() && this.selectedSchoolId())
    ? this.store.updateSchool(this.selectedSchoolId()!, request)
    : this.store.createSchool(request);

  action$.subscribe({
    next: () => {
      this.toast.showSuccess('opération reusi avec succes')
      this.isSubmitting.set(false); // 🔴 Stopper le loader
      this.closeModal();
    },
    error: (err) => {
      console.error('Erreur lors de la sauvegarde:', err);
      this.toast.showError('Erreur lors de la sauvegarde')
      this.isSubmitting.set(false); // 🔴 Stopper le loader même en cas d'erreur
    }
  });
}

  getCountByStatus(status: SchoolStatus): number {
  return this.store.schools().filter(s => s.status === status).length;
}

  changeStatus(schoolId: string, status: SchoolStatus): void {
    this.store.updateStatus(schoolId, status).subscribe();
  }

  deleteSchool(schoolId: string): void {
    if (confirm('Voulez-vous vraiment supprimer cet établissement ?')) {
      this.store.deleteSchool(schoolId).subscribe();
    }
  }

  closeModal(): void {
    this.showModal.set(false);
  }

// Option 1 : Chemin absolu complet
viewSchoolDetails(school: SchoolResponse): void {
  if (!school?.id) {
    console.error('ID de l’école manquant');
    return;
  }

  this.router.navigate(['/admin/schools', school.id]);
}
}
