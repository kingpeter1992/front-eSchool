import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SCHOOL_IMPORTS } from '../../../Schools/services/school-imports';
import { EnrollmentStore } from '../../Services/enrollment.store';
import { EnrollmentResponse } from '../../Models/enrollment.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClassStore } from '../../../Schools/services/calsse-service/class.store';

@Component({
  selector: 'app-enrollment-list-component',
  standalone: true,
   imports: [SCHOOL_IMPORTS],
  templateUrl: './enrollment-list-component.html',
  styleUrl: './enrollment-list-component.scss',
})
export class EnrollmentListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly store = inject(EnrollmentStore);
  readonly classStore = inject(ClassStore);

  // Signals pour recherche et filtres
  readonly searchTerm = signal<string>('');
  readonly selectedCampusFilter = signal<string>('ALL');
  readonly selectedLevelFilter = signal<string>('ALL');
  readonly selectedClassFilter = signal<string>('ALL'); // 'ALL', 'UNASSIGNED', 'ASSIGNED'

  // Modal State
  readonly isModalOpen = signal<boolean>(false);
  readonly selectedStudent = signal<any | null>(null);
  readonly isSubmitting = signal<boolean>(false);
  readonly assignmentError = signal<string | null>(null);

  // Formulaire d'affectation
  readonly assignmentForm: FormGroup = this.fb.group({
    campusId: ['', Validators.required],
    levelId: ['', Validators.required],
    classId: ['', Validators.required],
    overrideCapacity: [false],
    overrideReason: ['']
  });

  // Conversion dynamique des données du ClassStore vers le format attendu
  readonly classesList = computed(() => {
    return (this.classStore.classes() || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      levelName: c.levelName || '',
      maxCapacity: c.maxCapacity || 0,
      currentStudents: c.currentEnrollment || 0,
      availableSeats: Math.max(0, (c.maxCapacity || 0) - (c.currentEnrollment || 0)),
      isFull: (c.currentEnrollment || 0) >= (c.maxCapacity || 0)
    }));
  });

  // Données des étudiants inscrits (ENROLLED)
  readonly enrolledStudents = computed(() => {
    const list = this.store.enrollments?.() || [];
    return list.filter((e: any) => e.status === 'ENROLLED');
  });

  // KPIs
  readonly totalEnrolled = computed(() => this.enrolledStudents().length);
  readonly totalUnassigned = computed(() => this.enrolledStudents().filter((e: any) => !e.schoolClass && !e.className).length);
  readonly totalAvailableClasses = computed(() => this.classesList().filter(c => !c.isFull).length);
  readonly totalAvailableSeats = computed(() => this.classesList().reduce((acc, c) => acc + c.availableSeats, 0));

  // Inscrits filtrés pour le tableau
  readonly filteredStudents = computed(() => {
    let result = this.enrolledStudents();
    const search = this.searchTerm().toLowerCase().trim();
    const campus = this.selectedCampusFilter();
    const level = this.selectedLevelFilter();
    const classState = this.selectedClassFilter();

    if (search) {
      result = result.filter((e: any) =>
        (e.studentName || `${e.student?.firstName} ${e.student?.lastName}`).toLowerCase().includes(search) ||
        (e.registrationNo || e.registration_no || '').toLowerCase().includes(search)
      );
    }

    if (campus !== 'ALL') {
      result = result.filter((e: any) => (e.campusName || e.campus?.name) === campus);
    }

    if (level !== 'ALL') {
      result = result.filter((e: any) => (e.levelName || e.level?.name) === level);
    }

    if (classState === 'UNASSIGNED') {
      result = result.filter((e: any) => !e.className && !e.schoolClass);
    } else if (classState === 'ASSIGNED') {
      result = result.filter((e: any) => e.className || e.schoolClass);
    }

    return result;
  });

  // Classe actuellement sélectionnée dans la modal
  readonly selectedTargetClass = computed(() => {
    const classId = this.assignmentForm.get('classId')?.value;
    return this.classesList().find(c => c.id === classId) || null;
  });

  ngOnInit(): void {
    // Chargement initial des inscriptions et des classes
    this.store.loadEnrollments();
    this.loadClassesByCampus();
  }

  // Chargement des classes (avec gestion de méthode disponible dans ClassStore)
loadClassesByCampus(campusId?: string): void {
  if (campusId) {
    this.classStore.loadClassesByCampus(campusId);
  
  }
}

  openAssignmentModal(student: EnrollmentResponse): void {
    this.selectedStudent.set(student);

    // Charger les classes spécifiques au campus de l'élève
    if (student.campusId) {
      this.loadClassesByCampus(student.campusId);
    }

    this.assignmentForm.reset({
      campusId: student.campusId || '',
      levelId: '',
      classId: student.classId || '',
      overrideCapacity: false,
      overrideReason: ''
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedStudent.set(null);
  }

  submitAssignment(): void {
    if (this.assignmentForm.invalid) {
      this.assignmentForm.markAllAsTouched();
      return;
    }

    const selectedClass = this.selectedTargetClass();
    const isOverride = this.assignmentForm.get('overrideCapacity')?.value;

    if (selectedClass?.isFull && !isOverride) {
      this.assignmentError.set('Cette classe est saturée. Activer la dérogation pour forcer l’affectation.');
      return;
    }

    this.isSubmitting.set(true);
    this.assignmentError.set(null);

    const payload = {
      enrollmentId: this.selectedStudent().id,
      classId: this.assignmentForm.value.classId,
      overrideCapacity: this.assignmentForm.value.overrideCapacity,
      overrideReason: this.assignmentForm.value.overrideReason
    };

    // Appel vers votre store d'affectation si disponible
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.closeModal();
      if (this.store.loadEnrollments) {
        this.store.loadEnrollments();
      }
    }, 600);
  }

  getStudentFullName(student: any): string {
    if (!student) return 'Élève';
    return student.studentName || `${student.student?.firstName ?? ''} ${student.student?.lastName ?? ''}`.trim() || 'Élève';
  }

  getStudentInitials(student: any): string {
    const name = this.getStudentFullName(student).trim().split(/\s+/);
    if (!name || name.length === 0) return 'EL';
    if (name.length === 1) return name[0].substring(0, 2).toUpperCase();
    return (name[0].charAt(0) + name[name.length - 1].charAt(0)).toUpperCase();
  }

  back(): void {
    this.router.navigate(['/enrollments']);
  }
}
