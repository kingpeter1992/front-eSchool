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
  items1: MenuItem[] | undefined;
  sidebarOpen = true;

  readonly auth = inject(AuthStoreService);
  readonly router = inject(Router);

  // Détermine si l'utilisateur est un Super Admin
  isSuperAdmin = computed(() => {
    const user = this.auth.user();
    if (!user || !user.user?.roles) return false;

    const userRoles = user.user.roles.map(r => typeof r === 'string' ? r : r.id || r.slug || r.name);
    return userRoles.some(r => r === 'SUPER_ADMIN' || r === 'ROLE_SUPER_ADMIN');
  });

  // Nom et logo affichés dynamiquement selon le profil
  displaySchoolName = computed(() => {
    const user = this.auth.user();
    if (this.isSuperAdmin() && !user?.school?.name) {
      return 'Administration Centrale';
    }
    return user?.school?.name || 'E-School Management';
  });

  displayLogoUrl = computed(() => {
    const user = this.auth.user();
    return user?.school?.logoUrl || null;
  });

  // Configuration des éléments du menu
  menuItems: MenuItemCustom[] = [
    {
      label: 'Tableau de bord',
      icon: 'pi pi-chart-pie',
      route: '/dashboard',
      roles: ['ROLE_SUPER_ADMIN']
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
        {
          label: 'Rôles & Permissions',
          icon: 'pi pi-shield',
          route: 'admin/roles',
          roles: ['ROLE_SUPER_ADMIN']
        },
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
        {
          label: 'Paramètres système',
          icon: 'pi pi-sliders-h',
          route: 'admin/settings',
          roles: ['ROLE_SUPER_ADMIN']
        }
      ]
    },
    {
      label: 'Pédagogie',
      icon: 'pi pi-book',
      roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN_ECOLE', 'ROLE_ENSEIGNANT'],
      children: [
        {
          label: 'Classes',
          icon: 'pi pi-th-large',
          route: '/pedagogy/classes',
          roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN_ECOLE']
        },
        {
          label: 'Matières',
          icon: 'pi pi-bookmark',
          route: '/pedagogy/subjects',
          roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN_ECOLE']
        },
        {
          label: 'Emploi du temps',
          icon: 'pi pi-calendar',
          route: '/pedagogy/schedule',
          roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN_ECOLE', 'ROLE_ENSEIGNANT', 'ROLE_ELEVE']
        }
      ]
    },
    {
      label: 'Finances',
      icon: 'pi pi-wallet',
      route: '/finances',
      roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN_ECOLE']
    },
    {
      label: 'Communication',
      icon: 'pi pi-comments',
      route: '/communications',
      roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN_ECOLE', 'ROLE_ENSEIGNANT', 'ROLE_PARENT']
    }
  ];

  // Menu filtré dynamiquement selon les rôles de l'utilisateur
  filteredMenuItems = computed(() => {
    return this.menuItems
      .filter(item => this.hasRole(item.roles))
      .map(item => ({
        ...item,
        children: item.children ? item.children.filter(child => this.hasRole(child.roles)) : []
      }));
  });

  ngOnInit(): void {
    const user = this.auth.user();
    const initials = user ? `${user.user.firstName?.charAt(0) || ''}${user.user.lastName?.charAt(0) || ''}` : 'U';
    const fullName = user ? `${user.user.firstName || ''} ${user.user.lastName || ''}` : 'Administrateur';

    const rawRole = user?.user?.roles?.[0];
    const roleDisplay = typeof rawRole === 'string' ? rawRole : rawRole?.name || rawRole?.slug || 'ADMIN';

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

  // Méthode générique de vérification de rôles
  hasRole(allowedRoles: (Role | string)[]): boolean {
    const user = this.auth.user();
    if (!user || !user.user?.roles) return false;

    const allowedRoleIds = allowedRoles.map(r => typeof r === 'string' ? r : r.id || r.slug || r.name);
    const userRoleIds = user.user.roles.map(r => typeof r === 'string' ? r : r.id || r.slug || r.name);

    return userRoleIds.some(userRole => allowedRoleIds.includes(userRole));
  }

  logout(): void {
    this.auth.logout();
  }
}
