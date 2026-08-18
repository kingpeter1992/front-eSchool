import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SCHOOL_IMPORTS } from '../../../features/Schools/services/school-imports';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RbacStore } from '../../../core/services/RbacStore';
import { SchoolStore } from '../../../features/Schools/services/school.store';
import { UserStore } from '../../../features/Users/services/UserStore';

@Component({
  selector: 'app-admin-user',
  standalone : true,
  imports: [SCHOOL_IMPORTS],
  templateUrl: './admin-user.html',
  styleUrl: './admin-user.scss',
})
export class AdminUser implements OnInit {
readonly rbacStore = inject(RbacStore);
  readonly schoolStore = inject(SchoolStore);
  readonly userStore = inject(UserStore);
  private readonly fb = inject(FormBuilder);

  // Modals & États
  isUserModalOpen = signal<boolean>(false);
  isAssignModalOpen = signal<boolean>(false);
  selectedUserForAssign = signal<any>(null);

  // Formulaires
  userForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    schoolId: ['', [Validators.required]],
    roleIds: [[], [Validators.required]]
  });

  assignForm: FormGroup = this.fb.group({
    userId: ['', [Validators.required]],
    roleIds: [[]],
    permissionIds: [[]]
  });

  ngOnInit(): void {
    // Chargement du cache RBAC et de la liste des utilisateurs
    this.rbacStore.loadRbacCache().subscribe();
    this.userStore.loadUsers();
// 🟢 Ajout du .subscribe() obligatoire pour exécuter la requête HTTP
  this.schoolStore.loadSchools().subscribe();  }

  // --- ACTIONS : CRÉATION D'UTILISATEUR ---
  openUserModal(): void {
    this.userForm.reset();
    this.isUserModalOpen.set(true);
  }

  closeUserModal(): void {
    this.isUserModalOpen.set(false);
  }

  submitUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.rbacStore.createUser(this.userForm.value, () => {
      this.userStore.loadUsers(); // Recharche la liste des utilisateurs
      this.closeUserModal();
    });
  }

  // --- ACTIONS : AFFECTATION DES RÔLES ET PERMISSIONS ---
  openAssignModal(user: any): void {
    this.selectedUserForAssign.set(user);

    // Extraction des identifiants/slugs
    const currentRoles = user.roles?.map((r: any) => typeof r === 'string' ? r : r.id || r.slug) || [];
    const currentPerms = user.permissions?.map((p: any) => typeof p === 'string' ? p : p.id) || [];

    this.assignForm.patchValue({
      userId: user.id,
      roleIds: currentRoles,
      permissionIds: currentPerms
    });

    this.isAssignModalOpen.set(true);
  }

  closeAssignModal(): void {
    this.isAssignModalOpen.set(false);
    this.selectedUserForAssign.set(null);
  }

  submitAssignments(): void {
    if (this.assignForm.invalid) return;

    const payload = this.assignForm.value;

    this.rbacStore.assignUserRolesAndPermissions(payload, () => {
      this.userStore.loadUsers(); // Recharge la liste locale via le store
      this.closeAssignModal();
    });
  }

  // --- RECHERCHE ET REQUÊTES DYNAMIQUES ---
  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.userStore.setSearchQuery(input.value);
  }

  // Helper pour vérifier la présence d'une permission dans la Matrice RBAC
  hasPermission(rolePermissions: any[], permId: string): boolean {
    return rolePermissions?.some(p => p.id === permId) ?? false;
  }

}
