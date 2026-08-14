import { Routes } from '@angular/router';

export const SCHOOLS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dasboard-school/dasboard-school').then(m => m.DasboardSchool)
  }
];
