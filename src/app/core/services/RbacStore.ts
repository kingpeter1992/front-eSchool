import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, of, catchError, forkJoin } from 'rxjs';
import { Role, Permission, CreateUserDto, AssignUserAccessDto } from '../models/User';
import { Toast } from '../../shared/toaste/Toast';
import { RbacService } from './rbacService';

@Injectable({
  providedIn: 'root',
})
export class RbacStore {

private readonly rbacService = inject(RbacService);
  private readonly toast = inject(Toast);

  private readonly _roles = signal<Role[]>([]);
  private readonly _permissions = signal<Permission[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _isLoaded = signal<boolean>(false);

  readonly roles = this._roles.asReadonly();
  readonly permissions = this._permissions.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isLoaded = this._isLoaded.asReadonly();

  loadRbacCache(forceRefresh = false): Observable<{ roles: Role[]; permissions: Permission[] }> {
    if (this._isLoaded() && !forceRefresh) {
      return of({ roles: this._roles(), permissions: this._permissions() });
    }

    this._loading.set(true);

    return forkJoin({
      roles: this.rbacService.getRoles(),
      permissions: this.rbacService.getPermissions(),
    }).pipe(
      tap(({ roles, permissions }) => {
        this._roles.set(roles);
        this._permissions.set(permissions);
        this._isLoaded.set(true);
        this._loading.set(false);
      }),
      catchError((err) => {
        this._loading.set(false);
        console.error('⚠️ Erreur lors du chargement des Rôles & Permissions:', err);
        this.toast.info('⚠️ Erreur lors du chargement des Rôles & Permissions:')
        return of({ roles: [], permissions: [] });
      })
    );
  }

  togglePermissionInRole(roleId: string, permissionId: string): void {
    const currentRoles = this._roles();
    const updatedRoles = currentRoles.map((role) => {
      if (role.id !== roleId || role.system) return role;

      const hasPerm = role.permissions.some((p) => p.id === permissionId);
      const newPermissions = hasPerm
        ? role.permissions.filter((p) => p.id !== permissionId)
        : [...role.permissions, this._permissions().find((p) => p.id === permissionId)!];

      return { ...role, permissions: newPermissions };
    });

    this._roles.set(updatedRoles);
  }

  saveRolePermissions(roleId: string): void {
    const role = this._roles().find((r) => r.id === roleId);
    if (!role) return;

    const permissionIds = role.permissions.map((p) => p.id);
    this._loading.set(true);

    this.rbacService.updateRolePermissions(roleId, permissionIds).subscribe({
      next: () => {
        this._loading.set(false);
        this.toast.showSuccess('Permissions mises à jour avec succès !');
      },
      error: (err) => {
        this._loading.set(false);
        this.toast.error(err?.error?.message ?? 'Échec de la mise à jour des permissions.');
        this.toast.showError(err?.error?.message ?? 'Échec de la mise à jour des permissions.')
      },
    });
  }

  createUser(payload: CreateUserDto, onSuccess?: () => void): void {

    console.log('user crée', payload)
    this._loading.set(true);

    this.rbacService.createUser(payload).subscribe({
      next: () => {
        this._loading.set(false);
        this.toast.success('Utilisateur créé et rattaché avec succès !');
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        this._loading.set(false);
        this.toast.error(err?.error?.message ?? 'Erreur lors de la création de l’utilisateur.');
      },
    });
  }

  // 🟢 NOUVELLE MÉTHODE : Traitement de l'affectation dans le Store
  assignUserRolesAndPermissions(payload: AssignUserAccessDto, onSuccess?: () => void): void {
    this._loading.set(true);

    this.rbacService.assignUserRolesAndPermissions(payload).subscribe({
      next: () => {
        this._loading.set(false);
        this.toast.success('Rôles et permissions mis à jour pour l’utilisateur !');
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        this._loading.set(false);
        this.toast.error(err?.error?.message ?? 'Erreur lors de l’affectation des accès.');
        this.toast.showError(err?.error?.message ?? 'Erreur lors de l’affectation des accès.')
      },
    });
  }

  clearCache(): void {
    this._roles.set([]);
    this._permissions.set([]);
    this._isLoaded.set(false);
  }
}
