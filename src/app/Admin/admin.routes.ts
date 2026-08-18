import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'schools',
    loadChildren: () => import('../features/Schools/schools.routes').then((m) => m.SCHOOLS_ROUTES),
  },
  {
    path: 'subscription', // ➔ Ne pas remettre 'schools/:id' ici car il hérite déjà du parent 'schools'
    loadComponent: () =>
      import('../Admin/pages/dasboard-subcription/dasboard-subcription').then(
        (m) => m.DasboardSubcription,
      ),
  },

  {
    path: 'subscriptions/school/:schoolId',
    loadComponent: () =>
      import('../Admin/pages/detail-souscription/detail-souscription').then(
        (m) => m.DetailSouscription,
      ),
  },

// 🟢 Route finale accessible via /admin/subscriptions/school/:schoolId
  {
    path: 'subscriptions/school/:schoolId',
    loadComponent: () =>
      import('../Admin/pages/detail-souscription/detail-souscription').then(
        (m) => m.DetailSouscription,
      ),
  },

  {
    path: 'users',
    loadComponent: () => import('./pages/admin-user/admin-user').then((m) => m.AdminUser),
  },
];
