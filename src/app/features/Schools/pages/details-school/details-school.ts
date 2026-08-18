import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SchoolStore } from '../../services/school.store';
import { SCHOOL_IMPORTS } from '../../services/school-imports';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SchoolRequest } from '../../models/school.model';
import { Toast } from '../../../../shared/toaste/Toast';
export type SchoolTab = 'general' | 'campuses' | 'years' | 'users' | 'security' | 'audit';
@Component({
  selector: 'app-details-school',
 standalone: true,
   imports: [SCHOOL_IMPORTS],
  templateUrl: './details-school.html',
  styleUrl: './details-school.scss',
})
export class DetailsSchool implements OnInit {
  readonly store = inject(SchoolStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(Toast)

   // Année scolaire sélectionnée (ex: "2025-2026")
  selectedAcademicYear = signal<string>('2025-2026');

  // 🟢 SIGNAUX D'ÉTAT
  activeTab = signal<SchoolTab>('general');
  isEditModalOpen = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  selectedSchoolId = signal<string | null>(null);
  selectedLogoFile: File | null = null;
  logoPreviewUrl = signal<string | null>(null);
  isEditMode = signal<boolean>(true); // 👈 Ajouter cette ligne

  // 🟢 Formulaire réactif
  schoolForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    currency: ['USD'],
    domain: ['']
  });


  // Liste fictive/mock des années disponibles (peut venir du store)
  academicYears = signal<string[]>(['2023-2024', '2024-2025', '2025-2026', '2026-2027']);

  ngOnInit(): void {
    this.loadSchool();
  }

  private loadSchool(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.goBack();
      return;
    }
    this.store.loadSchool(id);
  }

  // 🟢 NAVIGATION PAR ONGLETS
  setTab(tab: SchoolTab): void {
    this.activeTab.set(tab);
  }

  // 🟢 SELECTION DE L'ANNÉE SCOLAIRE (Impacte la vue globale)
  onAcademicYearChange(year: string): void {
    this.selectedAcademicYear.set(year);
    // Optionnel: Déclencher un rechargement des données liées à l'année dans le store
    // this.store.loadDataByYear(year);
  }



// 🟢 Soumission et mise à jour
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
    this.router.navigate(['/schools']);
  }

  reload(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store.loadSchool(id);
    }
  }



// 🟢 Modal Actions
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

// 🟢 Sélection du fichier logo avec Prévisualisation
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedLogoFile = file;

      // Génération de l'URL de prévisualisation
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreviewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }
}
