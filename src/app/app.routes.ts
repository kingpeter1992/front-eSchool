import { Routes } from '@angular/router';
import { AuthGuard } from './core/AuthGuard/auth-guard-guard';
import { MainLayout } from './main-layout/main-layout';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./core/intros/pages/login-component/login-component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./core/intros/pages/register-component/register-component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'forgarpaaword',
    loadComponent: () =>
      import('./core/intros/pages/passwordforgot/passwordforgot.component').then(
        (m) => m.PasswordforgotComponent,
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./core/intros/pages/renitialisationpassword/renitialisationpassword.component').then(
        (m) => m.RenitialisationpasswordComponent,
      ),
  },
  {
    path: 'attente-validation',
    loadComponent: () =>
      import('./core/intros/component/attennte-component/attennte-component').then(
        (m) => m.AttennteComponent,
      ),
  },

  {
    path: 'verify-status',
    loadComponent: () => import('./features/Admission/Pages/verify-status-component/verify-status-component')
      .then(m => m.VerifyStatusComponent)
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./core/intros/component/unauthorized/unauthorized').then((m) => m.Unauthorized),
  },
  {
    path: 'activate',
    loadComponent: () =>
      import('./core/intros/pages/activate-component/activate-component').then(
        (m) => m.ActivateComponent,
      ),
  },

  /**
   * ROUTES SECURISEES AVEC LAYOUT
   */

  {
    path: '',
    component: MainLayout,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_SUPER_ADMIN', 'SUPER_ADMIN'] },
        loadComponent: () =>
          import('./Admin/pages/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
      },
      // ➔ Chargement des routes d'administration ici sous le préfixe 'admin'
      {
        path: 'admin',
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_SUPER_ADMIN', 'SUPER_ADMIN'] },
        loadChildren: () => import('./Admin/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
      {
        path: 'admin_ecole',
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ADMIN_ECOLE', 'ADMIN_ECOLE', 'ROLE_ADMIN'] },
        loadComponent: () =>
          import('./features/Schools/admin-school/details-school/details-school').then(
            (m) => m.DetailsSchool,
          ),
      },

        {
  path: 'enrollments',
  loadChildren: () =>
    import('./features/Admission/Enrrole.route')
      .then(m => m.ENROLLMENTS_ROUTES)
},

      {
        path: 'classesmanagement',
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ADMIN_ECOLE', 'ADMIN_ECOLE'] },
        loadComponent: () =>
          import('./features/Schools/pages/classes-management/classes-management').then(
            (m) => m.ClassesManagement,
          ),
      },

      // ➔ Ajoutez cette route :
      {
        path: 'schools/campuses/:id',
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ADMIN_ECOLE', 'ADMIN_ECOLE','ROLE_SUPER_ADMIN', 'SUPER_ADMIN','ROLE_ADMIN', 'ADMIN'] }, // Ou autres rôles autorisés
        loadComponent: () =>
          import('./features/Schools/pages/dashboard-campus/dashboard-campus').then(
            (m) => m.DashboardCampus,
          ), // Ajustez le chemin vers votre composant
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
