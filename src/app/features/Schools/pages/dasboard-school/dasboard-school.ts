import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SchoolStatus, SchoolResponse, SchoolRequest } from '../../models/school.model';
import { SchoolStore } from '../../services/school.store';
import { SCHOOL_IMPORTS } from '../../services/school-imports';

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

    // Confection stricte de l'objet conforme à SchoolRequest
    const request: SchoolRequest = {
      name: this.schoolForm.value.name,
      email: this.schoolForm.value.email,
      phone: this.schoolForm.value.phone,
      currency: this.schoolForm.value.currency,
      timezone: this.schoolForm.value.timezone,
      domain: this.schoolForm.value.domain,
      logoFile: this.selectedLogoFile
    };

    if (this.isEditMode() && this.selectedSchoolId()) {
      this.store.updateSchool(this.selectedSchoolId()!, request).subscribe(() => this.closeModal());
    } else {
      this.store.createSchool(request).subscribe(() => this.closeModal());
    }
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
}
