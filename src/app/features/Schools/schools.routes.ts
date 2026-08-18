import { Routes } from '@angular/router';

export const SCHOOLS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dasboard-school/dasboard-school').then((m) => m.DasboardSchool),
  },
  {
    path: ':id', // ➔ Ne pas remettre 'schools/:id' ici car il hérite déjà du parent 'schools'
    loadComponent: () =>
      import('./pages/details-school/details-school').then((m) => m.DetailsSchool),
  },

  


];
