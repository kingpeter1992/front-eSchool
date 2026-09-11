import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CampusResponse } from '../../models/school.model';
import { NgClass } from '@angular/common';
import { AuthStoreService } from '../../../../core/services/auth-store-service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { StorageService } from '../../../../core/storage-service/storage-service';

@Component({
  selector: 'app-campus-list',
  standalone: true,
  imports: [NgClass, RouterLink, RouterLinkActive],
  templateUrl: './campus-list.html',
  styleUrl: './campus-list.scss',
})
export class CampusList {
  private readonly authStore = inject(AuthStoreService);
  private readonly router = inject(Router);

  private readonly storageService = inject(StorageService);

  // Signal / Computed pour vérifier les rôles
  readonly canEditSchool = computed(() => {
    const user = this.storageService.getUser();
    if (!user || !user.roles) return false;

    const allowedRoles = ['ROLE_SUPER_ADMIN', 'SUPER_ADMIN', 'ROLE_ADMIN_ECOLE', 'ADMIN_ECOLE'];

    // Extraction propre des rôles qu'ils soient sous forme de chaînes ou d'objets
    const userRoleKeys: string[] = user.roles.map((r: any) => {
      if (typeof r === 'string') return r;
      return r.slug || r.name || r.id || '';
    });

    return userRoleKeys.some((roleKey) => allowedRoles.includes(roleKey));
  });


  // Vérifie si le campus courant est accessible/cliquable pour l'utilisateur
isCampusAccessible(campusId: string): boolean {
  // Les Super Admin / Admin École conservent un accès global
  if (this.canEditSchool()) {
    return true;
  }

  const currentUser = this.storageService.getUser();
  if (!currentUser) return false;

  // 1. Si l'utilisateur possède une liste de campus (cas multi-campus)
  const userCampuses: any[] =
    currentUser.campus ||
    currentUser.user?.campusId ||
    [];

  if (userCampuses.length > 0) {
    return userCampuses.some((c: any) => (typeof c === 'string' ? c : c.id) === campusId);
  }

  // 2. Si l'utilisateur a une liste d'IDs sous forme de tableau
  const userCampusIds: string[] =
    currentUser.campus.id ||
    currentUser.user?.campusId ||
    [];

  if (userCampusIds.length > 0) {
    return userCampusIds.includes(campusId);
  }

  // 3. Fallback mono-campus (structure issue de ton JSON)
  const singleCampusId =
    currentUser.campus ||
    currentUser.campus?.id ||
    currentUser.user?.campusId ||
    currentUser.user?.campusId;

  return singleCampusId === campusId;
}

// Empêche la navigation si le campus n'est pas accessible
onCampusClick(campusId: string): void {
  if (!this.isCampusAccessible(campusId)) {
    return;
  }
  this.router.navigate(['/schools/campuses', campusId]);
}



  campuses = input<CampusResponse[]>([]);
  openCreateModal = output<void>();
  selectCampus = output<string>();

  searchTerm = signal<string>('');
  statusFilter = signal<string>('ALL');

  // Vérification si l'utilisateur est Super Admin
  // Utilisation de la méthode dédiée du service pour vérifier le rôle
  isSuperAdmin = computed(() => this.authStore.hasRole('ROLE_SUPER_ADMIN'));
  filteredCampuses = computed(() => {
    const list = this.campuses() || [];
    const term = this.searchTerm().toLowerCase();
    const status = this.statusFilter();

    return list.filter((campus) => {
      const matchesSearch =
        campus.name?.toLowerCase().includes(term) ||
        campus.id?.toLowerCase().includes(term) ||
        campus.address?.toLowerCase().includes(term) ||
        campus.city?.toLowerCase().includes(term);

      const matchesStatus = status === 'ALL' || campus.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  countByStatus(status: string): number {
    return (this.campuses() || []).filter((c) => c.status === status).length;
  }

  uniqueCitiesCount = computed(() => {
    const cities = (this.campuses() || []).map((c) => c.city).filter(Boolean);
    return new Set(cities).size;
  });

  onSearchChange(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onStatusChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
  }

  onAddCampus(): void {
    // Sécurité supplémentaire si action appelée manuellement
    if (this.isSuperAdmin()) return;
    this.openCreateModal.emit();
  }

}
