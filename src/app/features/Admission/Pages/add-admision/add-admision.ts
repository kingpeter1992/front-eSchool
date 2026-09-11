import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EnrollmentStore } from '../../Services/enrollment.store';
import { SCHOOL_IMPORTS } from '../../../Schools/services/school-imports';
import { ClassStore } from '../../../Schools/services/calsse-service/class.store';
import { StorageService } from '../../../../core/storage-service/storage-service';
import { AcademicStore } from '../../../Schools/services/academic-structure/academic.store';



@Component({
  selector: 'app-add-admision',
   standalone: true,
    imports: [SCHOOL_IMPORTS],
  templateUrl: './add-admision.html',
  styleUrl: './add-admision.scss',
})
export class Admision implements OnInit {

 private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  // Injection des Stores et Services
  readonly store = inject(EnrollmentStore);
  readonly classStore = inject(ClassStore);
  private readonly authService = inject(StorageService);
  readonly academicYear = inject(AcademicStore);

  // Signaux d'état d'interface (Déclarés explicitement en public/readonly)
  readonly isCreateModalOpen = signal<boolean>(false);
  readonly selectedPhotoFile = signal<File | null>(null);
  readonly photoPreviewUrl = signal<string | null>(null);

  // Formulaire de Création
  readonly createForm: FormGroup = this.fb.group({
    schoolId: ['', Validators.required],
    campusId: ['', Validators.required],
    academicYearId: ['', Validators.required],
    candidateFirstName: ['', Validators.required],
    candidateLastName: ['', Validators.required],
    candidateDateOfBirth: [''],
    candidateEmail: ['', [Validators.required, Validators.email]],
    candidatePhone: [''],
    paymentMethod: ['MOBILE_MONEY', Validators.required],
    paymentPhoneOrCard: ['', Validators.required]
  });

  ngOnInit(): void {
    this.store.loadEnrollments();
  }

  // Ouverture de la modale
  openCreateModal(): void {
    const academic = this.academicYear.activeYearId();
    const currentUser = this.authService.getUser();

    const userSchoolId = currentUser?.school?.id || '';
    const userCampusId = currentUser?.campus || '';
    const useNumberSchool = currentUser?.school?.phone || '0814455824';
    const academicYearActive = academic || '';

    this.createForm.reset({
      schoolId: userSchoolId,
      campusId: userCampusId,
      academicYearId: academicYearActive,
      paymentMethod: 'MOBILE_MONEY',
      paymentPhoneOrCard: useNumberSchool
    });

    this.selectedPhotoFile.set(null);
    this.photoPreviewUrl.set(null);
    this.isCreateModalOpen.set(true);
  }

  // Fermeture de la modale
  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  // Prévisualisation locale de la photo
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.selectedPhotoFile.set(file);

    const reader = new FileReader();
    reader.onload = () => this.photoPreviewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  // Soumission vers le Store
  submitCreateEnrollment(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.createForm.value,
      paymentReference: 'PAY-' + Math.floor(100000 + Math.random() * 900000),
      amountPaid: 50.0
    };


  }

  back(): void {
    this.router.navigate(['/enrollments']);
  }
}

