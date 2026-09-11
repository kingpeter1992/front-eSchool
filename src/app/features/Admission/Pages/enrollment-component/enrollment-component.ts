import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SCHOOL_IMPORTS } from '../../../Schools/services/school-imports';
import { ActivatedRoute, Router } from '@angular/router';
import { EnrollmentStatus } from '../../Models/enrollment.model';
import { EnrollmentStore } from '../../Services/enrollment.store';
import { AcademicStore } from '../../../Schools/services/academic-structure/academic.store';

@Component({
  selector: 'app-enrollment-component',
  standalone: true,
   imports: [SCHOOL_IMPORTS],
  templateUrl: './enrollment-component.html',
  styleUrl: './enrollment-component.scss',
})
export class EnrollmentComponent  implements OnInit {


  // ============================================================
  // DEPENDENCIES
  // ============================================================

  readonly store = inject(EnrollmentStore);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);


  // ============================================================
  // ID DE L'INSCRIPTION
  // ============================================================

  private readonly enrollmentId = computed(() =>
    this.route.snapshot.paramMap.get('id')
  );


  // ============================================================
  // DONNÉES
  // ============================================================

  readonly enrollment = computed(() =>
    this.store.selectedEnrollment()
  );

// ============================================================
  // STATE UI
  // ============================================================

  readonly isLoading = computed(() =>
    this.store.loadingDetails()
  );

  readonly error = computed(() =>
    this.store.error()
  );


  // ============================================================
  // STATUT
  // ============================================================

  readonly statusLabel = computed(() => {

    const status = this.enrollment()?.status;

    switch (status) {

      case 'PENDING':
        return 'En attente';

      case 'REVIEWING':
        return 'En cours d’examen';

      case 'ACCEPTED':
        return 'Admis';

      case 'REJECTED':
        return 'Rejeté';

      case 'ENROLLED':
        return 'Inscrit';

      default:
        return 'Inconnu';
    }
  });


  readonly statusClass = computed(() => {

    const status = this.enrollment()?.status;

    switch (status) {

      case 'PENDING':
        return 'status-pending';

      case 'REVIEWING':
        return 'status-reviewing';

      case 'ACCEPTED':
        return 'status-accepted';

      case 'REJECTED':
        return 'status-rejected';

      case 'ENROLLED':
        return 'status-enrolled';

      default:
        return 'status-default';
    }
  });


  readonly statusIcon = computed(() => {

    const status = this.enrollment()?.status;

    switch (status) {

      case 'PENDING':
        return 'bi bi-clock';

      case 'REVIEWING':
        return 'bi bi-search';

      case 'ACCEPTED':
        return 'bi bi-check-circle';

      case 'REJECTED':
        return 'bi bi-x-circle';

      case 'ENROLLED':
        return 'bi bi-patch-check';

      default:
        return 'bi bi-question-circle';
    }
  });


  // ============================================================
  // IDENTITÉ ÉLÈVE
  // ============================================================

  readonly studentFullName = computed(() => {

    const enrollment: any = this.enrollment();

    if (!enrollment) {
      return 'Élève';
    }

    if (enrollment.studentName) {
      return enrollment.studentName;
    }

    if (enrollment.student) {

      const firstName =
        enrollment.student.firstName ?? '';

      const lastName =
        enrollment.student.lastName ?? '';

      return `${firstName} ${lastName}`.trim() || 'Élève';
    }

    return 'Élève';
  });


  readonly studentInitials = computed(() => {

    const name = this.studentFullName()
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (name.length === 0) {
      return 'EL';
    }

    if (name.length === 1) {
      return name[0].substring(0, 2).toUpperCase();
    }

    return (
      name[0].charAt(0) +
      name[name.length - 1].charAt(0)
    ).toUpperCase();
  });


  // ============================================================
  // INFORMATIONS DE DOSSIER
  // ============================================================

  readonly registrationNumber = computed(() => {

    const enrollment: any = this.enrollment();

    return (
      enrollment?.registrationNo ||
      enrollment?.registration_no ||
      null
    );
  });


  readonly admissionDate = computed(() => {

    const enrollment: any = this.enrollment();

    return enrollment?.admissionDate ||
      enrollment?.admission_date ||
      null;
  });


  readonly createdDate = computed(() => {

    const enrollment: any = this.enrollment();

    return enrollment?.createdAt ||
      enrollment?.created_at ||
      null;
  });


  // ============================================================
  // ÉCOLE
  // ============================================================

  readonly schoolName = computed(() => {

    const enrollment: any = this.enrollment();

    return (
      enrollment?.schoolName ||
      enrollment?.school?.name ||
      enrollment?.school?.code ||
      'Établissement non renseigné'
    );
  });


  readonly campusName = computed(() => {

    const enrollment: any = this.enrollment();

    return (
      enrollment?.campusName ||
      enrollment?.campus?.name ||
      'Campus non affecté'
    );
  });


  readonly academicYearName = computed(() => {

    const enrollment: any = this.enrollment();

    return (
      enrollment?.academicYearName ||
      enrollment?.academicYear?.name ||
      enrollment?.academicYear?.label ||
      'Année scolaire'
    );
  });


  // ============================================================
  // CLASSE
  // ============================================================

  readonly className = computed(() => {

    const enrollment: any = this.enrollment();

    return (
      enrollment?.className ||
      enrollment?.schoolClass?.name ||
      enrollment?.class?.name ||
      'Non affecté'
    );
  });


  // ============================================================
  // PARENT / TUTEUR
  // ============================================================

  readonly parentName = computed(() => {

    const enrollment: any = this.enrollment();

    return (
      enrollment?.parentName ||
      enrollment?.parent?.fullName ||
      enrollment?.parent?.name ||
      'Non renseigné'
    );
  });


  readonly parentEmail = computed(() => {

    const enrollment: any = this.enrollment();

    return (
      enrollment?.parentEmail ||
      enrollment?.parent?.email ||
      'Non renseigné'
    );
  });


  readonly parentPhone = computed(() => {

    const enrollment: any = this.enrollment();

    return (
      enrollment?.parentPhone ||
      enrollment?.parent?.phone ||
      'Non renseigné'
    );
  });


  // ============================================================
  // DOCUMENTS
  // ============================================================

  readonly documents = computed(() => {

    const enrollment: any = this.enrollment();

    return enrollment?.documents ?? [];
  });


  // ============================================================
  // INIT
  // ============================================================

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.back();
      return;
    }

    this.store.loadEnrollment(id);
  }


  // ============================================================
  // NAVIGATION
  // ============================================================

  back(): void {
    this.router.navigate(['/admin/enrollments']);
  }


  // ============================================================
  // ACTIONS
  // ============================================================

  editEnrollment(): void {

    const id = this.enrollmentId();

    if (!id) {
      return;
    }

    this.router.navigate([
      '/admin/enrollments',
      id,
      'edit'
    ]);
  }


  reviewEnrollment(): void {

    const id = this.enrollmentId();

    if (!id) {
      return;
    }

    console.log('Examiner le dossier :', id);

    // À connecter à ton endpoint de changement de statut
    // this.store.updateStatus(id, 'REVIEWING');
  }


  acceptEnrollment(): void {

    const id = this.enrollmentId();

    if (!id) {
      return;
    }

    console.log('Accepter le dossier :', id);

    // À connecter à ton Store
    // this.store.updateStatus(id, 'ACCEPTED');
  }


  rejectEnrollment(): void {

    const id = this.enrollmentId();

    if (!id) {
      return;
    }

    console.log('Rejeter le dossier :', id);

    // À connecter à ton Store
    // this.store.updateStatus(id, 'REJECTED');
  }


  enrollStudent(): void {

    const id = this.enrollmentId();

    if (!id) {
      return;
    }

    console.log('Inscription définitive :', id);

    // À connecter au workflow ENROLLED
    // this.store.enrollStudent(id);
  }


  assignClass(): void {

    const id = this.enrollmentId();

    if (!id) {
      return;
    }

    this.router.navigate([
      '/admin/enrollments',
      id,
      'assign-class'
    ]);
  }


  // ============================================================
  // UTILITAIRES
  // ============================================================

  formatDate(value: string | null | undefined): string {

    if (!value) {
      return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat(
      'fr-FR',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }
    ).format(date);
  }


  formatShortDate(value: string | null | undefined): string {

    if (!value) {
      return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat(
      'fr-FR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    ).format(date);
  }


  getDocumentIcon(type: string | undefined): string {

    const value = (type ?? '').toLowerCase();

    if (value.includes('pdf')) {
      return 'bi bi-file-earmark-pdf';
    }

    if (
      value.includes('jpg') ||
      value.includes('jpeg') ||
      value.includes('png')
    ) {
      return 'bi bi-file-earmark-image';
    }

    if (
      value.includes('bulletin') ||
      value.includes('school')
    ) {
      return 'bi bi-file-earmark-text';
    }

    return 'bi bi-file-earmark';
  }
}
