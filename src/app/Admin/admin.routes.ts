import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'schools',
    loadComponent: () =>
      import('./pages/admin-school/admin-school')
        .then(m => m.AdminSchool)
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./pages/admin-user/admin-user')
        .then(m => m.AdminUser)
  },

];
