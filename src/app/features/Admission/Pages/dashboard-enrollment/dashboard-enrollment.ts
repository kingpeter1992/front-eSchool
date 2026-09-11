import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SCHOOL_IMPORTS } from '../../../Schools/services/school-imports';
import { EnrollmentResponse, EnrollmentStatus } from '../../Models/enrollment.model';
import { EnrollmentStore } from '../../Services/enrollment.store';
import { AcademicStore } from '../../../Schools/services/academic-structure/academic.store';

@Component({
  selector: 'app-dashboard-enrollment',
   standalone: true,
    imports: [SCHOOL_IMPORTS],
  templateUrl: './dashboard-enrollment.html',
  styleUrl: './dashboard-enrollment.scss',
})
export class DashboardEnrollment implements OnInit {

readonly store = inject(EnrollmentStore);

  private readonly router = inject(Router);


  // ============================================================
  // SEARCH
  // ============================================================

  readonly searchTerm =
    signal('');


  // ============================================================
  // STATUS FILTER
  // ============================================================

  readonly statusFilter =
    signal<'ALL' | EnrollmentStatus>('ALL');


  // ============================================================
  // FILTERED LIST
  // ============================================================

  readonly filteredEnrollments = computed(() => {

    const search =
      this.searchTerm()
        .toLowerCase()
        .trim();

    const status =
      this.statusFilter();

    return this.store.enrollments()
      .filter(enrollment => {

        const matchesSearch =
          !search ||
          enrollment.studentName
            ?.toLowerCase()
            .includes(search) ||
          enrollment.registrationNo
            ?.toLowerCase()
            .includes(search) ||
          enrollment.campusName
            ?.toLowerCase()
            .includes(search) ||
          enrollment.className
            ?.toLowerCase()
            .includes(search);

        const matchesStatus =
          status === 'ALL' ||
          enrollment.status === status;

        return matchesSearch && matchesStatus;
      });
  });


  // ============================================================
  // INIT
  // ============================================================

  ngOnInit(): void {

    this.store.loadAll();
  }


  // ============================================================
  // SEARCH
  // ============================================================

  onSearchChange(
    event: Event
  ): void {

    const value =
      (event.target as HTMLInputElement).value;

    this.searchTerm.set(value);
  }


  // ============================================================
  // STATUS
  // ============================================================

onStatusChange(event: Event): void {
  const select = event.target as HTMLSelectElement;

  const value = select.value as 'ALL' | EnrollmentStatus;

  this.statusFilter.set(value);
}

  // ============================================================
  // DETAILS
  // ============================================================

  viewDetails(
    enrollment: EnrollmentResponse
  ): void {

    this.router.navigate([
      '/admin/enrollments',
      enrollment.id
    ]);
  }


  // ============================================================
  // CREATE
  // ============================================================

  newEnrollment(): void {
    this.router.navigate([
      '/enrollments/new'
    ]);
  }


  // ============================================================
  // STATUS LABEL
  // ============================================================

  getStatusLabel(
    status: EnrollmentStatus
  ): string {

    const labels: Record<
      EnrollmentStatus,
      string
    > = {

      PENDING: 'En attente',

      REVIEWING: 'En examen',

      ACCEPTED: 'Accepté',

      REJECTED: 'Rejeté',

      ENROLLED: 'Inscrit'
    };

    return labels[status];
  }

}
