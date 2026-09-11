import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EnrollmentStore } from '../../Services/enrollment.store';
import { SCHOOL_IMPORTS } from '../../../Schools/services/school-imports';
import { ClassStore } from '../../../Schools/services/calsse-service/class.store';
import { StorageService } from '../../../../core/storage-service/storage-service';
import { AcademicStore } from '../../../Schools/services/academic-structure/academic.store';

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

  readonly store = inject(EnrollmentStore);

  readonly classStore = inject(ClassStore);

  readonly academicYear = inject(AcademicStore);

  private readonly authService = inject(StorageService);

  // ============================================================
  // STATE
  // ============================================================

  readonly selectedPhotoFile = signal<File | null>(null);

  readonly photoPreviewUrl = signal<string | null>(null);

  readonly documentFiles = signal<Map<number, File>>(new Map());

  /**
   * Modal de paiement
   */
  readonly isPaymentModalOpen = signal(false);

  /**
   * Empêche les doubles clics pendant
   * la création du dossier.
   */
  readonly isProcessing = signal(false);

  // ============================================================
  // STEPS
  // ============================================================

  readonly steps = [
    {
      id: 1,
      title: 'Élève',
      description: 'Informations personnelles',
    },

    {
      id: 2,
      title: 'Parent',
      description: 'Responsable légal',
    },

    {
      id: 3,
      title: 'Scolarité',
      description: 'Affectation scolaire',
    },

    {
      id: 4,
      title: 'Documents',
      description: 'Pièces justificatives',
    },

    {
      id: 5,
      title: 'Confirmation',
      description: 'Vérification du dossier',
    },
  ];

  readonly currentStep = signal(1);

  readonly progress = computed(() => {
    const current = this.currentStep();

    return ((current - 1) / (this.steps.length - 1)) * 100;
  });

  // ============================================================
  // FORMULAIRE INSCRIPTION
  // ============================================================

  readonly createForm: FormGroup = this.fb.group({
    // ----------------------------------------------------------
    // CONTEXTE
    // ----------------------------------------------------------

    schoolId: ['', Validators.required],

    campusId: ['', Validators.required],

    academicYearId: ['', Validators.required],

    // ----------------------------------------------------------
    // ÉLÈVE
    // ----------------------------------------------------------

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

    // ----------------------------------------------------------
    // SCOLARITÉ
    // ----------------------------------------------------------

    vacation: ['SOIR', Validators.required],

    targetClass: ['', Validators.required],

    cycle: [''],

    section: [''],

    option: [''],

    previousSchool: [''],

    previousPercentage: [null],

    // ----------------------------------------------------------
    // PARENT
    // ----------------------------------------------------------

    parentFullName: [''],

    parentPhone: [''],

    parentAddress: [''],

    // ----------------------------------------------------------
    // DOCUMENTS
    // ----------------------------------------------------------

    documents: this.fb.array([]),
  });

  // ============================================================
  // FORMULAIRE PAIEMENT
  // ============================================================

  readonly paymentForm: FormGroup = this.fb.group({
    paymentMethod: ['MOBILE_MONEY', Validators.required],

    paymentAccount: ['', Validators.required],
  });

  // ============================================================
  // DOCUMENT ARRAY
  // ============================================================

  get documentsArray(): FormArray {
    return this.createForm.get('documents') as FormArray;
  }

  // ============================================================
  // INIT
  // ============================================================

  ngOnInit(): void {
    /**
     * Chargement des inscriptions existantes.
     */
    this.store.loadEnrollments();

    /**
     * Initialisation automatique
     * école / campus / année scolaire.
     */
    this.initializeFormValues();

    /**
     * Une première ligne document.
     */
    this.addDocumentRow();
  }

  // ============================================================
  // INITIALISATION SÉCURISÉE
  // ============================================================
  private initializeFormValues(): void {
    const academic = this.academicYear.activeYearId();
    const currentUser = this.authService.getUser();

    // On extrait les IDs avec vérifications poussées selon les différentes structures d'objets possibles
    const userSchoolId =
      currentUser?.school?.id || currentUser?.school?.id || currentUser?.school || '';
    const userCampusId =
      currentUser?.campus?.id || currentUser?.campus.campusId || currentUser?.campus || '';
    const userSchoolPhone =
      currentUser?.school?.phone || currentUser?.school?.phone || '0814455824';

    this.createForm.patchValue({
      schoolId: userSchoolId,
      campusId: userCampusId,
      academicYearId: academic || '',
    });

    this.paymentForm.patchValue({
      paymentAccount: userSchoolPhone,
    });
  }

  // ============================================================
  // PHOTO
  // ============================================================

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    this.selectedPhotoFile.set(file);

    const reader = new FileReader();

    reader.onload = () => {
      this.photoPreviewUrl.set(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  // ============================================================
  // DOCUMENTS
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

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    this.documentsArray.at(index).patchValue({
      fileName: file.name,
    });

    const updatedMap = new Map(this.documentFiles());

    updatedMap.set(index, file);

    this.documentFiles.set(updatedMap);
  }

  // ============================================================
  // PAYMENT
  // ============================================================

  // ============================================================
  // PAYMENT - OUVERTURE DU MODAL AVEC AUTO-FIX
  // ============================================================
  openPaymentModal(): void {
    console.log('➡️ Vérification avant ouverture paiement...');

    // Fallback / Auto-correction : Si des identifiants requis sont manquants,
    // on essaye de les récupérer directement depuis les Stores ou l'utilisateur courant
    const currentUser = this.authService.getUser();

    if (!this.createForm.get('schoolId')?.value) {
      const fallbackSchoolId =
        currentUser?.school?.id || currentUser?.school || currentUser?.school || 'DEFAULT_SCHOOL';
      this.createForm.patchValue({ schoolId: fallbackSchoolId });
    }

    if (!this.createForm.get('campusId')?.value) {
      const fallbackCampusId =
        currentUser?.campus?.id || currentUser?.campus || currentUser?.campus || 'DEFAULT_CAMPUS';
      this.createForm.patchValue({ campusId: fallbackCampusId });
    }

    if (!this.createForm.get('academicYearId')?.value) {
      const fallbackAcademicId = this.academicYear.activeYearId() || 'DEFAULT_ACADEMIC_YEAR';
      this.createForm.patchValue({ academicYearId: fallbackAcademicId });
    }

    // Vérification de la validité après ré-injection
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();

      console.warn('❌ Formulaire inscription encore invalide :');
      console.table(this.getFormValidationErrors(this.createForm));
      return;
    }

    // Si tout est bon, on réinitialise et on ouvre le modal
    this.paymentForm.markAsUntouched();
    this.isPaymentModalOpen.set(true);
  }

  closePaymentModal(): void {
    if (this.isProcessing()) {
      return;
    }

    this.isPaymentModalOpen.set(false);
  }

  onPaymentOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closePaymentModal();
    }
  }

  // ============================================================
  // PAYMENT METHOD
  // ============================================================

  setPaymentMethod(method: string): void {
    this.paymentForm.patchValue({
      paymentMethod: method,
    });
  }

  // ============================================================
  // VACATION
  // ============================================================

  setVacation(vacation: string): void {
    this.createForm.patchValue({
      vacation,
    });
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  submitCreateEnrollmentAndPayment(): void {
    console.group('🚀 CRÉATION INSCRIPTION + PAIEMENT');

    /**
     * 1. Validation formulaire principal
     */
    if (this.createForm.invalid) {
      console.error('❌ Le formulaire d’inscription est invalide');

      this.createForm.markAllAsTouched();

      console.table(this.getFormValidationErrors(this.createForm));

      console.groupEnd();

      return;
    }

    /**
     * 2. Validation paiement
     */
    if (this.paymentForm.invalid) {
      console.error('❌ Le formulaire de paiement est invalide');

      this.paymentForm.markAllAsTouched();

      console.table(this.getFormValidationErrors(this.paymentForm));

      console.groupEnd();

      return;
    }

    /**
     * 3. Empêcher double clic
     */
    if (this.isProcessing()) {
      console.warn('⏳ Une opération est déjà en cours.');

      console.groupEnd();

      return;
    }

    this.isProcessing.set(true);

    /**
     * 4. Récupération des données
     */
    const enrollmentData = this.createForm.getRawValue();

    const paymentFormData = this.paymentForm.getRawValue();

    /**
     * 5. Génération d'une référence
     *
     * Pour le moment ce n'est PAS
     * une transaction Finance.
     *
     * C'est simplement une référence
     * transmise au backend.
     */
    const paymentReference = 'PAY-' + Date.now();

    /**
     * 6. Informations paiement
     *
     * Le backend peut recevoir ces données
     * dès maintenant.
     *
     * Le traitement financier réel
     * sera développé plus tard.
     */
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

    /**
     * 7. Payload final
     */
    const payload = {
      ...enrollmentData,

      paymentInfo,

      amountPaid: paymentInfo.amountPaid,

      paymentReference: paymentInfo.paymentReference,

      paymentMethod: paymentInfo.paymentMethod,
    };

    console.log('📦 PAYLOAD INSCRIPTION :', enrollmentData);

    console.log('💳 INFORMATIONS PAIEMENT :', paymentInfo);

    console.log('📦 PAYLOAD FINAL :', payload);

    /**
     * 8. Fichiers
     */
    const attachedFiles = Array.from(this.documentFiles().values());

    console.log('📎 Documents :', attachedFiles);

    /**
     * 9. Envoi au Store
     */
    this.store.create(
      payload,

      this.selectedPhotoFile(),

      attachedFiles,

      () => {
        console.log('✅ Inscription créée avec succès');

        this.isProcessing.set(false);

        this.isPaymentModalOpen.set(false);

        /**
         * Retour à la liste
         */
        this.router.navigate(['/admin/enrollments']);
      },
    );

    /**
     * On laisse le Store gérer
     * le loading réseau.
     */
    console.groupEnd();
  }

  // ============================================================
  // NAVIGATION
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
    /**
     * Autorise uniquement
     * le retour vers une étape déjà parcourue.
     */
    if (step < this.currentStep()) {
      this.currentStep.set(step);
    }
  }

  // ============================================================
  // VALIDATION PAR ÉTAPE
  // ============================================================

  canGoNext(): boolean {
    switch (this.currentStep()) {
      // --------------------------------------------------------
      // ÉTAPE 1
      // --------------------------------------------------------

      case 1:
        return !!(
          this.createForm.get('candidateLastName')?.valid &&
          this.createForm.get('candidateFirstName')?.valid &&
          this.createForm.get('candidatePhone')?.valid &&
          this.createForm.get('candidateEmail')?.valid &&
          this.createForm.get('candidateDateOfBirth')?.valid
        );

      // --------------------------------------------------------
      // ÉTAPE 2
      // --------------------------------------------------------

      case 2:
        return true;

      // --------------------------------------------------------
      // ÉTAPE 3
      // --------------------------------------------------------

      case 3:
        return !!(
          this.createForm.get('vacation')?.valid && this.createForm.get('targetClass')?.valid
        );

      // --------------------------------------------------------
      // ÉTAPE 4
      // --------------------------------------------------------

      case 4:
        return this.documentsArray.length > 0;

      // --------------------------------------------------------
      // ÉTAPE 5
      // --------------------------------------------------------

      default:
        return true;
    }
  }

  // ============================================================
  // MARK TOUCH
  // ============================================================

  private markCurrentStepAsTouched(): void {
    switch (this.currentStep()) {
      case 1:
        [
          'candidateLastName',
          'candidateFirstName',
          'candidatePhone',
          'candidateEmail',
          'candidateDateOfBirth',
        ].forEach((field) => {
          this.createForm.get(field)?.markAsTouched();
        });

        break;

      case 3:
        ['vacation', 'targetClass'].forEach((field) => {
          this.createForm.get(field)?.markAsTouched();
        });

        break;

      case 4:
        this.documentsArray.markAllAsTouched();

        break;
    }
  }

  // ============================================================
  // BACK
  // ============================================================

  back(): void {
    this.router.navigate(['/admin/enrollments']);
  }

  // ============================================================
  // DEBUG VALIDATION
  // ============================================================

  private getFormValidationErrors(form: FormGroup | FormArray): Record<string, any> {
    const errors: Record<string, any> = {};

    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);

      if (control?.errors) {
        errors[key] = control.errors;
      }

      /**
       * Gestion des FormArray
       */
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
}
