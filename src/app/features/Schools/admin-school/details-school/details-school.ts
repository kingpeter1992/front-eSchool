import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SchoolStore } from '../../services/school.store';
import { SCHOOL_IMPORTS } from '../../services/school-imports';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SchoolRequest } from '../../models/school.model';
import { Toast } from '../../../../shared/toaste/Toast';
import { StorageService } from '../../../../core/storage-service/storage-service';
import { Role } from '../../../../core/models/User';
import { UserStore } from '../../../Users/services/UserStore';
import { UserList } from '../../pages/user-list/user-list';
export type SchoolTab = 'general' | 'campuses' | 'years' | 'users' | 'security' | 'audit';
@Component({
  selector: 'app-details-school',
 standalone: true,
   imports: [SCHOOL_IMPORTS, UserList],
  templateUrl: './details-school.html',
  styleUrl: './details-school.scss',
})

export class DetailsSchool implements OnInit {
readonly store = inject(SchoolStore);
  readonly storeUser = inject(UserStore);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(Toast);
  private readonly storageService = inject(StorageService);

  selectedAcademicYear = signal<string>('2025-2026');
  activeTab = signal<SchoolTab>('general');
  isEditModalOpen = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  selectedSchoolId = signal<string | null>(null);
  selectedLogoFile: File | null = null;
  logoPreviewUrl = signal<string | null>(null);
  isEditMode = signal<boolean>(true);
  isSuperAdmin = signal<boolean>(false);

  schoolForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    currency: ['USD'],
    domain: ['']
  });

  academicYears = signal<string[]>(['2023-2024', '2024-2025', '2025-2026', '2026-2027']);

  ngOnInit(): void {
    this.checkUserRole();
    this.loadSchoolCurrentUser();
  }

  private checkUserRole(): void {
    const authData = this.storageService.getUser();
    const roles: Role[] = authData?.user?.roles || [];
    const roleKeys = roles.map((r) => typeof r === 'string' ? r : r.slug || r.name || r.id);

    this.isSuperAdmin.set(
      roleKeys.includes('ROLE_SUPER_ADMIN') || roleKeys.includes('SUPER_ADMIN')
    );
  }

  loadSchoolCurrentUser(): void {
    const authData = this.storageService.getUser();
    let schoolId = this.route.snapshot.paramMap.get('id');

    if (!this.isSuperAdmin() || !schoolId) {
      schoolId = authData?.school?.id || authData?.user?.schoolId || null;
    }

    if (!schoolId) {
      this.toast.showError("Aucun établissement associé trouvé.");
      return;
    }

    this.store.loadSchool(schoolId);
  }

  setTab(tab: SchoolTab): void {
    this.activeTab.set(tab);
  }

  onAcademicYearChange(year: string): void {
    this.selectedAcademicYear.set(year);
  }

  saveSchool(): void {
    if (this.schoolForm.invalid) {
      this.schoolForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const request: SchoolRequest = {
      name: this.schoolForm.value.name,
      email: this.schoolForm.value.email,
      phone: this.schoolForm.value.phone,
      currency: this.schoolForm.value.currency,
      domain: this.schoolForm.value.domain,
      logoFile: this.selectedLogoFile ?? undefined
    };

    const action$ = (this.isEditMode() && this.selectedSchoolId())
      ? this.store.updateSchool(this.selectedSchoolId()!, request)
      : this.store.createSchool(request);

    action$.subscribe({
      next: () => {
        this.toast.showSuccess('Opération réussie avec succès');
        this.isSubmitting.set(false);
        this.closeModal();
      },
      error: (err) => {
        console.error('Erreur lors de la sauvegarde:', err);
        this.toast.showError('Erreur lors de la sauvegarde');
        this.isSubmitting.set(false);
      }
    });
  }

  goBack(): void {
    if (this.isSuperAdmin()) {
      this.router.navigate(['/schools']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  reload(): void {
    this.loadSchoolCurrentUser();
  }

  openEditModal(): void {
    const school = this.store.selectedSchool();
    if (school) {
      this.isEditMode.set(true);
      this.selectedSchoolId.set(school.id);

      this.schoolForm.patchValue({
        name: school.name || '',
        email: school.email || '',
        phone: school.phone || '',
        currency: school.currency || 'USD',
        domain: school.domain || ''
      });

      this.logoPreviewUrl.set(school.logoUrl || null);
      this.selectedLogoFile = null;
      this.isEditModalOpen.set(true);
    }
  }

  closeModal(): void {
    this.isEditModalOpen.set(false);
    this.isSubmitting.set(false);
    this.schoolForm.reset();
    this.logoPreviewUrl.set(null);
    this.selectedLogoFile = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedLogoFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreviewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  handleOpenCreateCampusModal(): void {
    // Logique modal campus
  }

  handleCampusSelected(campusId: string): void {
    this.router.navigate(['/admin_ecole/campuses', campusId]);
  }

  handleUsersSelected(user: any): void {
    // Action sur utilisateur
  }

  handleOpenCreateUserModal(): void {
    // Logique modal création utilisateur
  }

}
