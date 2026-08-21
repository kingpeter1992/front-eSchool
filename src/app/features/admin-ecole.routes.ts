import { Routes } from '@angular/router';

export const ADMIN_SCHOOLS_ROUTES: Routes = [
  // {
  //   path: '',
  //   loadComponent: () =>
  //     import('./Schools/admin-school/admin-dashboard-school/admin-dashboard-school').then((m) => m.AdminDashboardSchool),
  // },

  {
    path: '', // ➔ Ne pas remettre 'schools/:id' ici car il hérite déjà du parent 'schools'
    loadComponent: () =>
      import('./Schools/admin-school/details-school/details-school').then((m) => m.DetailsSchool),
  },



];
