import { Injectable, inject, signal, computed } from '@angular/core';
import { UserService } from '../services/user.service'; // Adaptez le chemin d'accès
import { Toast } from '../../../shared/toaste/Toast';
import { User } from '../../../core/models/User';

@Injectable({
  providedIn: 'root',
})
export class UserStore {
  private readonly userService = inject(UserService);
  private readonly toast = inject(Toast);

  // --- États locaux (Signals Privés) ---
  private readonly _users = signal<User[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _searchQuery = signal<string>('');

  // --- Selectors Publics (Readonly) ---
  readonly users = this._users.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();

  // --- Propriété Calculée : Filtrage dynamique des utilisateurs ---
  readonly filteredUsers = computed(() => {
    const query = this._searchQuery().toLowerCase().trim();
    const currentUsers = this._users();

    if (!query) return currentUsers;

    return currentUsers.filter(
      (u) =>
        u.firstName?.toLowerCase().includes(query) ||
        u.lastName?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query)
    );
  });

  /**
   * Charge la liste des utilisateurs depuis le UserService
   */
  loadUsers(): void {
    this._loading.set(true);

    this.userService.loadUsers(); // Déclenche le chargement HTTP de votre service

    // Écoute les données du BehaviorSubject du UserService
    this.userService.users$.subscribe({
      next: (data) => {
        this._users.set(data);
        this._loading.set(false);
      },
      error: (err) => {
        this._loading.set(false);
        this.toast.error(err?.error?.message ?? 'Échec du chargement des utilisateurs.');
      },
    });
  }

  /**
   * Met à jour le terme de recherche
   */
  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  /**
   * Affecte des rôles à un utilisateur
   */
  assignRoles(userId: string, roleSlugs: string[], onSuccess?: () => void): void {
    this._loading.set(true);

    this.userService.assignRoles(userId, roleSlugs).subscribe({
      next: () => {
        this._loading.set(false);
        this.toast.success('Rôles affectés avec succès !');
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        this._loading.set(false);
        this.toast.error(err?.error?.message ?? 'Erreur lors de l’affectation des rôles.');
      },
    });
  }

  /**
   * Met à jour les informations d'un utilisateur
   */
  updateUser(id: string, dto: Partial<User>, onSuccess?: () => void): void {
    this._loading.set(true);

    this.userService.updateUser(id, dto).subscribe({
      next: () => {
        this._loading.set(false);
        this.toast.success('Utilisateur mis à jour avec succès !');
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        this._loading.set(false);
        this.toast.error(err?.error?.message ?? 'Erreur lors de la mise à jour.');
      },
    });
  }

  /**
   * Supprime un utilisateur
   */
  deleteUser(id: string): void {
    this._loading.set(true);

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this._loading.set(false);
        this.toast.success('Utilisateur supprimé avec succès.');
      },
      error: (err) => {
        this._loading.set(false);
        this.toast.error(err?.error?.message ?? 'Erreur lors de la suppression.');
      },
    });
  }
}
