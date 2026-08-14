import { Component, computed, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { AuthStoreService } from '../core/services/auth-store-service';

export interface MenuChild {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

// Utilisation de l'interface typée
export interface MenuItemCustom {
  label: string;
  icon: string;
  route?: string;
  roles: string[];
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

  // Détermine si l'utilisateur est un Super Admin pur
  isSuperAdmin = computed(() => {
    const user = this.auth.user();
    if (!user || !user.user?.roles) return false;
    const userRoles = user.user.roles.map(r => typeof r === 'string' ? r : r);
    return userRoles.includes('SUPER_ADMIN');
  });

  // Nom et logo affichés dynamiquement selon le profil (Super Admin vs École)
  displaySchoolName = computed(() => {
    const user = this.auth.user();
    if (this.isSuperAdmin() && !user?.school?.name) {
      return 'Administration Centrale';
    }
    return user?.school?.name || 'E-School Management';
  });

  displayLogoUrl = computed(() => {
    const user = this.auth.user();
    // Si l'utilisateur a un logo d'école, on l'affiche, sinon on peut mettre une image par défaut ou null
    return user?.school?.logoUrl || null;
  });

 // Typage strict du tableau avec l'interface MenuItemCustom
menuItems: MenuItemCustom[] = [
    {
      label: 'Tableau de bord',
      icon: 'pi pi-chart-pie', // Icône moderne pour le dashboard
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
          icon: 'pi pi-users', // Icône pour la gestion des utilisateurs
          route: 'admin/users',
          roles: ['ROLE_SUPER_ADMIN']
        },
        {
          label: 'Rôles & Permissions',
          icon: 'pi pi-shield', // Icône de sécurité / bouclier pour les rôles
          route: 'admin/roles',
          roles: ['ROLE_SUPER_ADMIN']
        },
        {
          label: 'Établissements',
          icon: 'pi pi-building', // Icône de bâtiment pour les écoles
          route: 'admin/schools',
          roles: ['ROLE_SUPER_ADMIN']
        },
        {
          label: 'Paramètres système',
          icon: 'pi pi-sliders-h', // Icône de réglages avancés
          route: 'admin/settings',
          roles: ['ROLE_SUPER_ADMIN']
        }
      ]
    },
    {
      label: 'Pédagogie',
      icon: 'pi pi-book', // Icône de livre pour l'école
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
          icon: 'pi pi-calendar', // Icône calendrier
          route: '/pedagogy/schedule',
          roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN_ECOLE', 'ROLE_ENSEIGNANT', 'ROLE_ELEVE']
        }
      ]
    },
    {
      label: 'Finances',
      icon: 'pi pi-wallet', // Icône portefeuille pour la comptabilité/frais scolaires
      route: '/finances',
      roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN_ECOLE']
    },
    {
      label: 'Communication',
      icon: 'pi pi-comments', // Icône de message
      route: '/communications',
      roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN_ECOLE', 'ROLE_ENSEIGNANT', 'ROLE_PARENT']
    }
  ];

filteredMenuItems = computed(() => {
    return this.menuItems
      .filter(item => this.hasRole(item.roles))
      .map(item => ({
        ...item,
        children: item.children ? item.children.filter(child => this.hasRole(child.roles)) : []
      }));
  });

ngOnInit() {
    const user = this.auth.user();
    const initials = user ? `${user.user.firstName?.charAt(0) || ''}${user.user.lastName?.charAt(0) || ''}` : 'U';
    const fullName = user ? `${user.user.firstName || ''} ${user.user.lastName || ''}` : 'Administrateur';
    const role = user?.user?.roles?.[0] || user?.user?.roles?.[0] || 'ADMIN';

    this.items1 = [
      {
        label: fullName,
        data: { initials, role: `Rôle : ${role}` },
        items: [
          { label: 'Profil', icon: 'pi pi-id-card', routerLink: '/profile' },
          { label: 'Déconnexion', icon: 'pi pi-sign-out', command: () => this.logout() }
        ]
      }
    ];
  }
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // Le paramètre prend directement l'interface typée
  toggleMenu(item: MenuItemCustom) {
    item.expanded = !item.expanded;
  }

  hasRole(allowedRoles: string[]): boolean {
    const user = this.auth.user();
    if (!user || !user.user?.roles) return false;
    const userRoles = user.user.roles.map(r => typeof r === 'string' ? r : r);
    return userRoles.some(role => allowedRoles.includes(role));
  }

  logout(): void {
    this.auth.logout();
  }
}
