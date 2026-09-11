import { inject, Injectable, signal, computed } from '@angular/core';
import { RoleService } from './RoleService';
import { RoleResponse } from '../../../core/models/User';

@Injectable({
  providedIn: 'root'
})
export class RoleStore {
  private readonly roleService = inject(RoleService);

  // State Signals
  readonly roles = signal<RoleResponse[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Load Method
  loadAllRoles(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.roleService.getRoles().subscribe({
      next: (data) => {
        this.roles.set(data);
        this.isLoading.set(false);
        console.log('role liste', data)
      },
      error: (err) => {
        console.error('Erreur lors du chargement des rôles :', err);
        this.error.set('Impossible de charger la liste des rôles.');
        this.isLoading.set(false);
      }
    });
  }
}
