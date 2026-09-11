import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { Role } from '../core/models/User';
import { AuthStoreService } from '../core/services/auth-store-service';

export interface MenuChild {
  label: string;
  icon: string;
  route: string;
  roles: (Role | string)[];
}

export interface MenuItemCustom {
  label: string;
  icon: string;
  route?: string;
  roles: (Role | string)[];
  expanded?: boolean;
  children?: MenuItemCustom[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MenubarModule
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit {
  items1: any[] | undefined;
  sidebarOpen = true;

  readonly auth = inject(AuthStoreService);
  readonly router = inject(Router);

  // 1. Extraction sécurisée des rôles de l'utilisateur (prend en compte la racine ou l'objet user)
  private userRolesList = computed<string[]>(() => {
    const userObj = this.auth.user();
    if (!userObj) return [];

    // Support des deux structures : userObj.roles OU userObj.user.roles
    const rawRoles: (Role | string)[] = userObj.roles || userObj.user?.roles || [];

    return rawRoles.map((r) => {
      if (typeof r === 'string') return r;
      return r.slug || r.name || r.id || '';
    });
  });

  // 2. Détermine si l'utilisateur est un Super Admin
  isSuperAdmin = computed(() => {
    const roles = this.userRolesList();
    return roles.includes('SUPER_ADMIN') || roles.includes('ROLE_SUPER_ADMIN');
  });

  // Nom et logo affichés dynamiquement
  displaySchoolName = computed(() => {
    const userObj = this.auth.user();
    if (this.isSuperAdmin() && !userObj?.school?.name) {
      return 'Administration Centrale';
    }
    return userObj?.school?.name || 'E-School Management';
  });

  displayLogoUrl = computed(() => {
    const userObj = this.auth.user();
    return userObj?.school?.logoUrl || null;
  });

  // Configuration du menu
  menuItems: MenuItemCustom[] = [

    {
      label: 'Tableau de bord',
      icon: 'pi pi-chart-pie',
      route: '/admin_ecole',
      roles: ['ROLE_ADMIN_ECOLE','ROLE_ADMIN']
    },
    {
      label: 'Administration eSchool',
      icon: 'pi pi-cog',
      roles: ['ROLE_SUPER_ADMIN'],
      children: [
        {
          label: 'Utilisateurs',
          icon: 'pi pi-users',
          route: 'admin/users',
          roles: ['ROLE_SUPER_ADMIN']
        },
        // {
        //   label: 'Rôles & Permissions',
        //   icon: 'pi pi-shield',
        //   route: 'admin/roles',
        //   roles: ['ROLE_SUPER_ADMIN']
        // },
        {
          label: 'Établissements',
          icon: 'pi pi-building',
          route: 'admin/schools',
          roles: ['ROLE_SUPER_ADMIN']
        },
        {
          label: 'Subscription',
          icon: 'pi pi-shield',
          route: 'admin/subscription',
          roles: ['ROLE_SUPER_ADMIN']
        },
        // {
        //   label: 'Paramètres système',
        //   icon: 'pi pi-sliders-h',
        //   route: 'admin/settings',
        //   roles: ['ROLE_SUPER_ADMIN']
        // }
      ]
    },
    {
      label: 'Inscription',
      icon: 'pi pi-user',
      roles: ['ROLE_ADMIN_ECOLE', 'ROLE_ENSEIGNANT','ROLE_ADMIN'],
      children: [
        {
          label: 'Dasboar inscrit',
          icon: 'pi pi-th-large',
          route: '/enrollments',
          roles: [ 'ROLE_ADMIN_ECOLE','ROLE_ADMIN']
        },
        {
          label: 'Inscription',
          icon: 'pi pi-bookmark',
          route: '/enrollments/affecationenrolled',
          roles: [ 'ROLE_ADMIN_ECOLE','ROLE_ADMIN']
        },
        {
          label: 'Emploi du temps',
          icon: 'pi pi-calendar',
          route: '/pedagogy/schedule',
          roles: [ 'ROLE_ADMIN_ECOLE', 'ROLE_ENSEIGNANT', 'ROLE_ELEVE','ROLE_ADMIN']
        }
      ]
    },

     {
      label: 'Pédagogie',
      icon: 'pi pi-book',
      roles: ['ROLE_ADMIN_ECOLE', 'ROLE_ENSEIGNANT','ROLE_ADMIN'],
      children: [
        {
          label: 'Classes',
          icon: 'pi pi-th-large',
          route: 'classesmanagement',
          roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN_ECOLE','ROLE_ADMIN']
        },
        {
          label: 'Matières',
          icon: 'pi pi-bookmark',
          route: '/pedagogy/subjects',
          roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN_ECOLE','ROLE_ADMIN']
        },
        {
          label: 'Emploi du temps',
          icon: 'pi pi-calendar',
          route: '/pedagogy/schedule',
          roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN_ECOLE', 'ROLE_ENSEIGNANT', 'ROLE_ELEVE','ROLE_ADMIN']
        }
      ]
    },
    {
      label: 'Finances',
      icon: 'pi pi-wallet',
      route: '/finances',
      roles: [ 'ROLE_ADMIN_ECOLE']
    },
    {
      label: 'Communication',
      icon: 'pi pi-comments',
      route: '/communications',
      roles: ['ROLE_ADMIN_ECOLE', 'ROLE_ENSEIGNANT', 'ROLE_PARENT']
    },
    {
      label: 'Gestion users',
      icon: 'pi pi-cog',
      roles: ['ROLE_ADMIN_ECOLE'],
      children: [
        {
          label: 'Utilisateurs',
          icon: 'pi pi-users',
          route: 'admin/users',
          roles: ['ROLE_ADMIN_ECOLE']
        },
        {
          label: 'Mon école',
          icon: 'pi pi-building',
          route: 'admin/schools',
          roles: ['ROLE_ADMIN_ECOLE']
        },
        {
          label: 'Mon abonnement',
          icon: 'pi pi-shield',
          route: 'admin/subscription',
          roles: ['ROLE_ADMIN_ECOLE']
        }
      ]
    }
  ];

  // Menu filtré dynamiquement selon les rôles
  filteredMenuItems = computed(() => {
    return this.menuItems
      .filter((item) => this.hasRole(item.roles))
      .map((item) => ({
        ...item,
        children: item.children ? item.children.filter((child) => this.hasRole(child.roles)) : []
      }));
  });

  ngOnInit(): void {
    const userObj = this.auth.user();

    // Les informations personnelles sont portées par l'utilisateur authentifié.
    const firstName = userObj?.user?.firstName || '';
    const lastName = userObj?.user?.lastName || '';

    const initials = (firstName || lastName) ? `${firstName.charAt(0)}${lastName.charAt(0)}` : 'U';
    const fullName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : 'Utilisateur';

    const roles = this.userRolesList();
    const roleDisplay = roles[0] || 'UTILISATEUR';

    this.items1 = [
      {
        label: fullName,
        data: { initials, role: `Rôle : ${roleDisplay}` },
        items: [
          { label: 'Profil', icon: 'pi pi-id-card', routerLink: '/profile' },
          { label: 'Déconnexion', icon: 'pi pi-sign-out', command: () => this.logout() }
        ]
      }
    ];
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleMenu(item: MenuItemCustom): void {
    item.expanded = !item.expanded;
  }

  // Vérification sécurisée des rôles
  hasRole(allowedRoles?: (Role | string)[]): boolean {
    if (!allowedRoles || allowedRoles.length === 0) return true;

    const userRoles = this.userRolesList();
    const allowedRoleSlugs = allowedRoles.map((r) => {
      if (typeof r === 'string') return r;
      return r.slug || r.name || r.id || '';
    });

    return userRoles.some((userRole) => allowedRoleSlugs.includes(userRole));
  }

  logout(): void {
    this.auth.logout();
  }
}
