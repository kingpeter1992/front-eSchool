import { Routes } from '@angular/router';

export const SCHOOLS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dasboard-school/dasboard-school').then((m) => m.DasboardSchool),
  },

    {
    path: 'admin', // ➔ Ne pas remettre 'schools/:id' ici car il hérite déjà du parent 'schools'
    loadComponent: () =>
      import('./admin-school/details-school/details-school').then((m) => m.DetailsSchool),
  },

{
    path: 'campuses/:id', // URL accessible via : /schools/campuses/:id
    loadComponent: () =>
      import('../Schools/pages/dashboard-campus/dashboard-campus').then((m) => m.DashboardCampus),
  },
  {
    path: ':id', // À garder en dernier pour ne pas intercepter 'campuses'
    loadComponent: () =>
      import('./admin-school/details-school/details-school').then((m) => m.DetailsSchool),
  },
];
