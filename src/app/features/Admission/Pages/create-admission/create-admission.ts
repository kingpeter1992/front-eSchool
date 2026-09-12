import { Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AcademicApiStore } from '../../../Schools/services/academic-structure/AcademicApiStore';
import { StorageService } from '../../../../core/storage-service/storage-service';
import { ClassStore } from '../../../Schools/services/calsse-service/class.store';
import { SCHOOL_IMPORTS } from '../../../Schools/services/school-imports';
import { EnrollmentStore } from '../../Services/enrollment.store';
import { AcademicStore } from '../../../Schools/services/academic-structure/academic.store';
import { Toast } from '../../../../shared/toaste/Toast';

@Component({
  selector: 'app-create-admission',
  standalone: true,
  imports: [SCHOOL_IMPORTS],
  templateUrl: './create-admission.html',
  styleUrl: './create-admission.scss',
})
export class CreateAdmission implements OnInit {
  // ============================================================
  // DEPENDENCIES
  // ============================================================
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(StorageService);

  readonly store = inject(EnrollmentStore);
  readonly academicStore = inject(AcademicStore);
  readonly academicYear = inject(AcademicApiStore);
  readonly toast = inject(Toast)

  // ============================================================
  // INPUTS DE L'ARBORESCENCE ACADÉMIQUE
  // ============================================================
  // ============================================================
  // SOURCES DE DONNÉES (STORE) - Remplace les input()
  // ============================================================
    // Récupération des données depuis AcademicStore
    tree = computed(() => this.academicStore.tree());
    cycles = computed(() => this.academicStore.cycles());
    levels = computed(() => this.academicStore.levels());
    sections = computed(() => this.academicStore.sections());
    options = computed(() => this.academicStore.options());

  // ============================================================
  // SIGNALS STATE & SÉLECTION
  // ============================================================
  readonly selectedPhotoFile = signal<File | null>(null);
  readonly photoPreviewUrl = signal<string | null>(null);
  readonly documentFiles = signal<Map<number, File>>(new Map());

  readonly isPaymentModalOpen = signal(false);
  readonly isProcessing = signal(false);

  readonly currentStep = signal(1);

  // Signals de sélection en cascade
  readonly selectedCycleId = signal<string | null>(null);
  readonly selectedLevelId = signal<string | null>(null);
  readonly selectedSectionId = signal<string | null>(null);

  // ============================================================
  // STEPS & PROGRESSION
  // ============================================================
  readonly steps = [
    { id: 1, title: 'Élève', description: 'Informations personnelles' },
    { id: 2, title: 'Parent', description: 'Responsable légal' },
    { id: 3, title: 'Scolarité', description: 'Affectation scolaire' },
    { id: 4, title: 'Documents', description: 'Pièces justificatives' },
    { id: 5, title: 'Confirmation', description: 'Vérification du dossier' },
  ];

  readonly progress = computed(() => {
    const current = this.currentStep();
    return ((current - 1) / (this.steps.length - 1)) * 100;
  });

  // ============================================================
  // CALCULS COMPUTED (ARBORESCENCE ACADÉMIQUE)
  // ============================================================
  selectedCycleNode = computed(() => {
    const id = this.selectedCycleId();
    if (!id) return null;

    const source = this.tree()?.length > 0 ? this.tree() : this.cycles();
    return source?.find((c) => String(c.id) === String(id)) || null;
  });

  filteredLevels = computed(() => {
    const node = this.selectedCycleNode();
    if (node && node.levels) {
      return node.levels;
    }
    const cycleId = this.selectedCycleId();
    if (!cycleId) return [];
    return this.levels().filter((l) => l.cycleId?.toString() === cycleId.toString());
  });

  filteredSections = computed(() => {
    const node = this.selectedCycleNode();
    if (node && node.sections) {
      return node.sections;
    }
    const levelId = this.selectedLevelId();
    if (!levelId) return [];
    return this.sections().filter((s) => s.levelId?.toString() === levelId.toString());
  });

  filteredOptions = computed(() => {
    const sectionId = this.selectedSectionId();
    if (!sectionId) return [];

    const sectionNode = this.filteredSections().find(
      (s: any) => s.id?.toString() === sectionId.toString(),
    );
    if (sectionNode && sectionNode.options) {
      return sectionNode.options;
    }

    return this.options().filter((o) => o.sectionId?.toString() === sectionId.toString());
  });

  // ============================================================
  // FORMULAIRES REACTIFS
  // ============================================================
  readonly createForm: FormGroup = this.fb.group({
    // CONTEXTE
    schoolId: ['', Validators.required],
    campusId: ['', Validators.required],
    academicYearId: ['', Validators.required],

    // ÉLÈVE
    candidateLastName: ['', Validators.required],
    candidatePostName: [''],
    candidateFirstName: ['', Validators.required],
    gender: ['M', Validators.required],
    candidateDateOfBirth: ['', Validators.required],
    placeOfBirth: [''],
    candidatePhone: ['', Validators.required],
    candidateEmail: ['', [Validators.required, Validators.email]],
    address: [''],
    city: [''],
    maritalStatus: ['Célibataire'],
    nationality: ['Congolaise'],
    originVillage: [''],
    district: [''],
    territory: [''],

    // SCOLARITÉ / ORIENTATION
    vacation: ['JOUR', Validators.required],
    cycleId: [null, Validators.required],
    levelId: [{ value: null, disabled: true }, Validators.required],
    sectionId: [{ value: null, disabled: true }],
    optionId: [{ value: null, disabled: true }],
    targetClass: [''],
    previousSchool: [''],
    previousPercentage: [null],

    // PARENT
    parentFullName: [''],
    parentPhone: [''],
    parentAddress: [''],

    // DOCUMENTS
    documents: this.fb.array([]),
  });

  readonly paymentForm: FormGroup = this.fb.group({
    paymentMethod: ['MOBILE_MONEY', Validators.required],
    paymentAccount: ['', Validators.required],
  });

  get documentsArray(): FormArray {
    return this.createForm.get('documents') as FormArray;
  }

  // ============================================================
  // CONSTRUCTOR & LIFECYCLE
  // ============================================================
  constructor() {
    effect(() => {
    const active = this.academicYear.activeYear();
    if (active?.id) {
      this.createForm.patchValue({ academicYearId: active.id });
    }
  });
  }

ngOnInit(): void {
  const currentUser = this.authService.getUser();
  const userSchoolId = currentUser?.school?.id;

  if (userSchoolId) {
    // 1. Charger la liste et l'année active
    this.academicYear.loadYears(userSchoolId);

    // 2. Charger les cycles et l'arborescence
    this.academicStore.loadCycles(userSchoolId);
    this.academicStore.loadStructureTree(userSchoolId);
  }

  this.store.loadEnrollments();
  this.initializeFormValues();
  this.addDocumentRow();
}


  // ============================================================
  // INITIALISATION DU FORMULAIRE
  // ============================================================
  private initializeFormValues(): void {
    const currentUser = this.authService.getUser();
    const userSchoolId = currentUser?.school?.id || currentUser?.school || '';
    const userCampusId = currentUser?.campus?.id || currentUser?.campus || '';
    const userSchoolPhone = currentUser?.school?.phone || '0814455824';
    const activeYearId = this.academicYear.activeYear()?.id || '';

    this.createForm.patchValue({
      schoolId: userSchoolId,
      campusId: userCampusId,
      academicYearId: activeYearId,
    });

    this.paymentForm.patchValue({
      paymentAccount: userSchoolPhone,
    });
  }

  // ============================================================
  // GESTION DU SÉLECTEUR EN CASCADE
  // ============================================================
  // Dans create-admission.ts
  onCycleChange(event: Event | string | null): void {
    // Récupération de la valeur si c'est un événement de select HTML standard
    const value =
      typeof event === 'object' && event !== null && 'target' in event
        ? (event.target as HTMLSelectElement).value
        : event;

    const normalizedId = value ? String(value) : null;

    this.selectedCycleId.set(normalizedId);
    this.selectedLevelId.set(null);
    this.selectedSectionId.set(null);

    // Synchronisation avec le ReactiveForm
    this.createForm.patchValue({
      cycleId: normalizedId,
      levelId: null,
      sectionId: null,
      optionId: null,
    });

    const levelControl = this.createForm.get('levelId');
    const sectionControl = this.createForm.get('sectionId');
    const optionControl = this.createForm.get('optionId');

    if (normalizedId) {
      levelControl?.enable();
      sectionControl?.enable();
    } else {
      levelControl?.disable();
      sectionControl?.disable();
    }
    optionControl?.disable();
  }

  onLevelChange(): void {
    const levelId = this.createForm.get('levelId')?.value;
    const normalizedId = levelId ? levelId.toString() : null;

    this.selectedLevelId.set(normalizedId);
    this.selectedSectionId.set(null);

    const sectionControl = this.createForm.get('sectionId');
    const optionControl = this.createForm.get('optionId');

    optionControl?.disable();
    optionControl?.setValue(null);

    if (normalizedId && this.filteredSections().length > 0) {
      sectionControl?.enable();
    } else {
      sectionControl?.disable();
    }
    sectionControl?.setValue(null);
  }

  onSectionChange(sectionId: string | null): void {
    const normalizedId = sectionId ? sectionId.toString() : null;
    this.selectedSectionId.set(normalizedId);
    this.createForm.patchValue({ optionId: null });

    const optionControl = this.createForm.get('optionId');

    if (normalizedId && this.filteredOptions().length > 0) {
      optionControl?.enable();
    } else {
      optionControl?.disable();
    }
  }

  setVacation(vacation: string): void {
    this.createForm.patchValue({ vacation });
  }

  // ============================================================
  // PHOTO MANAGEMENT
  // ============================================================
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.selectedPhotoFile.set(file);

    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreviewUrl.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  // ============================================================
  // DOCUMENTS MANAGEMENT
  // ============================================================
  addDocumentRow(): void {
    const docGroup = this.fb.group({
      documentType: ['', Validators.required],
      fileName: [''],
    });
    this.documentsArray.push(docGroup);
  }

  removeDocumentRow(index: number): void {
    this.documentsArray.removeAt(index);
    const updatedMap = new Map(this.documentFiles());
    updatedMap.delete(index);
    this.documentFiles.set(updatedMap);
  }

  onDocumentFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.documentsArray.at(index).patchValue({
      fileName: file.name,
    });

    const updatedMap = new Map(this.documentFiles());
    updatedMap.set(index, file);
    this.documentFiles.set(updatedMap);
  }

  // ============================================================
  // PAYMENT MODAL
  // ============================================================
  openPaymentModal(): void {
    const currentUser = this.authService.getUser();

    if (!this.createForm.get('schoolId')?.value) {
      const fallbackSchoolId = currentUser?.school?.id || currentUser?.school || '';
      this.createForm.patchValue({ schoolId: fallbackSchoolId });
    }

    if (!this.createForm.get('campusId')?.value) {
      const fallbackCampusId = currentUser?.campus?.id || currentUser?.campus || '';
      this.createForm.patchValue({ campusId: fallbackCampusId });
    }

    if (!this.createForm.get('academicYearId')?.value) {
      const fallbackAcademicId = this.academicYear.activeYear()?.id || '';
      this.createForm.patchValue({ academicYearId: fallbackAcademicId });
    }

    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      console.warn(
        '❌ Formulaire inscription invalide :',
        this.getFormValidationErrors(this.createForm),
      );
      return;
    }

    this.paymentForm.markAsUntouched();
    this.isPaymentModalOpen.set(true);
  }

  closePaymentModal(): void {
    if (this.isProcessing()) return;
    this.isPaymentModalOpen.set(false);
  }

  onPaymentOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closePaymentModal();
    }
  }

  setPaymentMethod(method: string): void {
    this.paymentForm.patchValue({ paymentMethod: method });
  }

// ============================================================
// SUBMISSION
// ============================================================
submitCreateEnrollmentAndPayment(): void {
  if (this.createForm.invalid) {
    this.createForm.markAllAsTouched();
    return;
  }

  if (this.paymentForm.invalid) {
    this.paymentForm.markAllAsTouched();
    return;
  }

  if (this.isProcessing()) return;

  this.isProcessing.set(true);

  const enrollmentData = this.createForm.getRawValue();
  const paymentFormData = this.paymentForm.getRawValue();
  const paymentReference = 'PAY-' + Date.now();

  const paymentInfo = {
    amountPaid: 5.0,
    paymentMethod: paymentFormData.paymentMethod,
    paymentPhoneOrCard: paymentFormData.paymentAccount,
    paymentReference,
    paymentReason: "Frais de dossier d'admission",
    paymentDate: new Date().toISOString(),
    schoolId: enrollmentData.schoolId,
    campusId: enrollmentData.campusId,
  };

  const payload = {
    ...enrollmentData,
    paymentInfo,
    amountPaid: paymentInfo.amountPaid,
    paymentReference: paymentInfo.paymentReference,
    paymentMethod: paymentInfo.paymentMethod,
  };

  const attachedFiles = Array.from(this.documentFiles().values());

  this.store.create(
    payload,
    this.selectedPhotoFile(),
    attachedFiles,
    // Callback Succès
    () => {
      this.isProcessing.set(false);
      this.isPaymentModalOpen.set(false);
      this.toast.showSuccess('Admission soumise avec succès !');
      this.router.navigate(['/enrollments']);
    },
    // Callback Échec
    () => {
      this.isProcessing.set(false);
      this.toast.showError("Échec de la soumission du dossier.");
    }
  );
}

  // ============================================================
  // NAVIGATION & STEPS
  // ============================================================
  nextStep(): void {
    if (!this.canGoNext()) {
      this.markCurrentStepAsTouched();
      return;
    }
    if (this.currentStep() < this.steps.length) {
      this.currentStep.update((step) => step + 1);
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update((step) => step - 1);
    }
  }

  goToStep(step: number): void {
    if (step < this.currentStep()) {
      this.currentStep.set(step);
    }
  }

  canGoNext(): boolean {
    switch (this.currentStep()) {
      case 1:
        return !!(
          this.createForm.get('candidateLastName')?.valid &&
          this.createForm.get('candidateFirstName')?.valid &&
          this.createForm.get('candidatePhone')?.valid &&
          this.createForm.get('candidateEmail')?.valid &&
          this.createForm.get('candidateDateOfBirth')?.valid
        );
      case 2:
        return true;
      case 3:
        return !!(
          this.createForm.get('vacation')?.valid &&
          this.createForm.get('cycleId')?.valid &&
          this.createForm.get('levelId')?.valid
        );
      case 4:
        return this.documentsArray.length > 0;
      default:
        return true;
    }
  }

  private markCurrentStepAsTouched(): void {
    switch (this.currentStep()) {
      case 1:
        [
          'candidateLastName',
          'candidateFirstName',
          'candidatePhone',
          'candidateEmail',
          'candidateDateOfBirth',
        ].forEach((field) => this.createForm.get(field)?.markAsTouched());
        break;
      case 3:
        ['vacation', 'cycleId', 'levelId'].forEach((field) =>
          this.createForm.get(field)?.markAsTouched(),
        );
        break;
      case 4:
        this.documentsArray.markAllAsTouched();
        break;
    }
  }

  back(): void {
    this.router.navigate(['/enrollments']);
  }

  private getFormValidationErrors(form: FormGroup | FormArray): Record<string, any> {
    const errors: Record<string, any> = {};
    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      if (control?.errors) {
        errors[key] = control.errors;
      }
      if (control instanceof FormArray) {
        control.controls.forEach((childControl, index) => {
          if (childControl.errors) {
            errors[`${key}[${index}]`] = childControl.errors;
          }
        });
      }
    });
    return errors;
  }


  // ============================================================
// LIBELLÉS RÉSUMÉ (COMPUTED)
// ============================================================
selectedCycleName = computed(() => {
  const node = this.selectedCycleNode();
  return node ? node.name : 'N/A';
});

selectedLevelName = computed(() => {
  const levelId = this.selectedLevelId();
  if (!levelId) return 'Non spécifié';
  const level = this.filteredLevels().find((l: any) => String(l.id) === String(levelId));
  return level ? level.name : 'Non spécifié';
});

selectedSectionName = computed(() => {
  const sectionId = this.selectedSectionId();
  if (!sectionId) return 'N/A';
  const section = this.filteredSections().find((s: any) => String(s.id) === String(sectionId));
  return section ? section.name : 'N/A';
});

selectedOptionName = computed(() => {
  const optionId = this.createForm.get('optionId')?.value;
  if (!optionId) return 'N/A';
  const option = this.filteredOptions().find((o: any) => String(o.id) === String(optionId));
  return option ? option.name : 'N/A';
});
}
