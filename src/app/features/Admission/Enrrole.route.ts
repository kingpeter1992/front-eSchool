import { Routes } from '@angular/router';


export const ENROLLMENTS_ROUTES: Routes = [

  {
    path: '',
    loadComponent: () =>
      import('./Pages/dashboard-enrollment/dashboard-enrollment')
        .then(m => m.DashboardEnrollment)
  },

    // ============================================================
  // NOUVELLE INSCRIPTION
  // /admin/enrollments/new
  // ============================================================
  {
    path: 'new',
    loadComponent: () =>
      import('./Pages/create-admission/create-admission')
        .then(m => m.CreateAdmission)
  },

   {
    path: 'affecationenrolled',
    loadComponent: () =>
      import('./Pages/enrollment-list-component/enrollment-list-component')
        .then(m => m.EnrollmentListComponent)
  },

  {
    path: ':id',
    loadComponent: () =>
      import('./Pages/enrollment-component/enrollment-component')
        .then(m => m.EnrollmentComponent)
  }

];
