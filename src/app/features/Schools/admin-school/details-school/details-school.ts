import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
import { CampusStore } from '../../services/campus/campus.store';
import { AcademicManagement } from '../../pages/academic-management/academic-management';
import { AcademicYear } from '../../models/academic.model';
import { ClassesManagement } from '../../pages/classes-management/classes-management';
import { AuditList } from '../../../Audit/page/audit-list/audit-list';
export type SchoolTab = 'general' | 'campuses' | 'years' | 'users' | 'security' | 'audit';
@Component({
  selector: 'app-details-school',
  standalone: true,
  imports: [SCHOOL_IMPORTS, UserList, AcademicManagement, ClassesManagement, AuditList],
  templateUrl: './details-school.html',
  styleUrl: './details-school.scss',
})
export class DetailsSchool implements OnInit {
  readonly store = inject(SchoolStore);
  readonly storeUser = inject(UserStore);
  readonly campusStore = inject(CampusStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(Toast);

  // 1. Changez string par AcademicYear | null pour l'année sélectionnée
  selectedAcademicYear = signal<AcademicYear | null>(null);
  activeTab = signal<SchoolTab>('general');

  // État Modal Édition École
  isEditModalOpen = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  selectedSchoolId = signal<string | null>(null);
  selectedLogoFile: File | null = null;
  logoPreviewUrl = signal<string | null>(null);
  isEditMode = signal<boolean>(true);
  isSuperAdmin = signal<boolean>(false);
  schoolId = signal<string | null>(null);

  // État Modal Création Campus
  isCreateCampusModalOpen = signal<boolean>(false);

  private readonly storageService = inject(StorageService);

  // Signal / Computed pour vérifier les rôles
  readonly canEditSchool = computed(() => {
    const roles = this.storageService.getUser(); // Ou méthode équivalente de votre store
    const allowedRoles = ['ROLE_SUPER_ADMIN', 'SUPER_ADMIN', 'ROLE_ADMIN_ECOLE', 'ADMIN_ECOLE'];
    return roles?.roles.some((role: string) => allowedRoles.includes(role));
  });

  // Signal / Computed pour vérifier les rôles
  readonly canEditAudit = computed(() => {
    const roles = this.storageService.getUser(); // Ou méthode équivalente de votre store
    const allowedRoles = ['ROLE_SUPER_ADMIN'];
    return roles?.roles.some((role: string) => allowedRoles.includes(role));
  });


  // Formulaires réactifs
  schoolForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    currency: ['USD'],
    domain: [''],
  });

  campusForm!: FormGroup;

  ngOnInit(): void {
    this.checkUserRole();
    this.loadSchoolCurrentUser();
    this.initCampusForm();
  }

  private checkUserRole(): void {
    const authData = this.storageService.getUser();
    const roles: Role[] = authData?.user?.roles || [];
    const roleKeys = roles.map((r) => (typeof r === 'string' ? r : r.slug || r.name || r.id));

    this.isSuperAdmin.set(
      roleKeys.includes('ROLE_SUPER_ADMIN') || roleKeys.includes('SUPER_ADMIN'),
    );
  }

loadSchoolCurrentUser(): void {
    const authData = this.storageService.getUser();
    let currentSchoolId = this.route.snapshot.paramMap.get('id');

    if (!this.isSuperAdmin() || !currentSchoolId) {
      currentSchoolId = authData?.school?.id || authData?.user?.schoolId || null;
    }

    if (!currentSchoolId) {
      this.toast.showError('Aucun établissement associé trouvé.');
      return;
    }

    // Mise à jour de l'ID courant et chargement dans le store
    this.schoolId.set(currentSchoolId);
    this.store.loadSchool(currentSchoolId);
  }

  setTab(tab: SchoolTab): void {
    this.activeTab.set(tab);
  }

  onAcademicYearChange(year: AcademicYear): void {
    this.selectedAcademicYear.set(year);
  }

  // GESTION MODAL ÉCOLE
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
        domain: school.domain || '',
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
      logoFile: this.selectedLogoFile ?? undefined,
    };

    const action$ =
      this.isEditMode() && this.selectedSchoolId()
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
      },
    });
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

  // GESTION MODAL CAMPUS
  private initCampusForm(): void {
    this.campusForm = this.fb.group({
      schoolId: ['', [Validators.required]],
      code: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.maxLength(150)]],
      address: ['', [Validators.required, Validators.maxLength(255)]],
      city: ['', [Validators.maxLength(100)]],
      province: ['', [Validators.maxLength(100)]],
      country: ['RDC', [Validators.maxLength(100)]],
      phone: ['', [Validators.maxLength(20)]],
    });
  }

  handleOpenCreateCampusModal(): void {
    const currentSchool = this.store.selectedSchool();
    if (!currentSchool) return;

    this.campusForm.reset({
      schoolId: currentSchool.id,
      name: '',
      address: '',
      city: '',
      province: '',
      country: 'RDC',
      phone: '',
      code: '',
    });

    this.isCreateCampusModalOpen.set(true);
  }

  closeCreateCampusModal(): void {
    if (this.campusStore.isSubmitting()) return;
    this.isCreateCampusModalOpen.set(false);
  }

  saveCampus(): void {
    if (this.campusForm.invalid) {
      this.campusForm.markAllAsTouched();
      return;
    }

    const dto = this.campusForm.getRawValue();

    this.campusStore.createCampus(dto, () => {
      this.closeCreateCampusModal();
      this.reload();
    });
  }

  // NAVIGATION & ACTIONS SUPLÉMENTAIRES
  handleCampusSelected(campusId: string): void {
    this.router.navigate(['/admin_ecole/campuses', campusId]);
  }

  handleUsersSelected(user: any): void {
    // Action sur utilisateur
  }

  handleOpenCreateUserModal(): void {
    // Logique modal création utilisateur
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

  // 2. Remplacez le tableau de string[] par un tableau d'objets AcademicYear[]
  academicYears = signal<AcademicYear[]>([
    {
      id: '1',
      schoolId: '1',
      name: '2023-2024',
      startDate: '2023-09-01',
      endDate: '2024-06-30',
      status: 'CLOSED',
    },
    {
      id: '2',
      schoolId: '1',
      name: '2024-2025',
      startDate: '2024-09-01',
      endDate: '2025-06-30',
      status: 'CLOSED',
    },
    {
      id: '3',
      schoolId: '1',
      name: '2025-2026',
      startDate: '2025-09-01',
      endDate: '2026-06-30',
      status: 'ACTIVE',
    },
    {
      id: '4',
      schoolId: '1',
      name: '2026-2027',
      startDate: '2026-09-01',
      endDate: '2027-06-30',
      status: 'PREPARATION',
    },
  ]);
}
