import { Component, computed, inject, Input, input, OnInit, output, signal } from '@angular/core';
import { SCHOOL_IMPORTS } from '../../services/school-imports';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RbacStore } from '../../../../core/services/RbacStore';
import { UserStore } from '../../../Users/services/UserStore';
import { SchoolStore } from '../../services/school.store';
import { AuthStoreService } from '../../../../core/services/auth-store-service';
import { User } from '../../../../core/models/User';


@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [SCHOOL_IMPORTS],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList implements OnInit {
  readonly rbacStore = inject(RbacStore);
  readonly schoolStore = inject(SchoolStore);
  readonly userStore = inject(UserStore);
  readonly authStore = inject(AuthStoreService);
  private readonly fb = inject(FormBuilder);

  @Input() user: User[] = [];

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
    this.rbacStore.loadRbacCache().subscribe();
    this.userStore.loadUsers();
    this.schoolStore.loadSchools().subscribe();
  }

  // 🟢 Détecter si l'utilisateur connecté est un Admin École
  get isSchoolAdmin(): boolean {
    const currentUser = this.authStore.user();
    return !!(currentUser?.school?.id || currentUser?.user?.schoolId);
  }

  // 🟢 Récupérer le schoolId de l'utilisateur connecté
  get currentSchoolId(): string {
    const currentUser = this.authStore.user();
    return currentUser?.school?.id || currentUser?.user?.schoolId || '';
  }

  // 🟢 Utilisateurs de l'école (ou tous si Super Admin)
  get users() {
    const allUsers = this.userStore.users() || [];
    if (!this.isSchoolAdmin) return allUsers;

    const schoolId = this.currentSchoolId;
    return allUsers.filter((u: any) =>
      u.schoolId === schoolId || u.school_id === schoolId || u.school?.id === schoolId
    );
  }

  // 🟢 Filtrage recherche dynamique sur la liste filtrée
  get filteredUsers() {
    const schoolUsers = this.users;
    const query = (this.userStore.searchQuery() || '').toLowerCase().trim();

    if (!query) return schoolUsers;

    return schoolUsers.filter((u: any) =>
      u.firstName?.toLowerCase().includes(query) ||
      u.lastName?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query)
    );
  }

  // 🟢 Rôles autorisés dans le modal (Exclusion des rôles sensibles si Admin École)
  get availableRoles() {
    const allRoles = this.rbacStore.roles() || [];
    if (!this.isSchoolAdmin) return allRoles;

    // Filtre pour ne garder que Enseignant, Élève, Parent (par nom ou slug)
    const allowedRoles = ['ENSEIGNANT', 'ELEVE', 'PARENT', 'TEACHER', 'STUDENT'];
    return allRoles.filter((r: any) => {
      const roleName = (r.name || r.slug || r.code || '').toUpperCase();
      return allowedRoles.some(allowed => roleName.includes(allowed));
    });
  }

  // 🟢 KPIs adaptés à la portée de l'utilisateur connecté
  get activeUsersCount(): number {
    return this.users.filter((u: any) => u.status === 'ACTIVE').length;
  }

  get rolesCount(): number {
    return this.availableRoles.length;
  }

  get searchQuery() {
    return this.userStore.searchQuery;
  }

  // --- ACTIONS : CRÉATION D'UTILISATEUR ---
  openUserModal(): void {
    const defaultSchoolId = this.currentSchoolId;

    this.userForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      schoolId: defaultSchoolId,
      roleIds: []
    });

    // Figement du champ école pour l'Admin École
    if (this.isSchoolAdmin) {
      this.userForm.get('schoolId')?.disable();
    } else {
      this.userForm.get('schoolId')?.enable();
    }

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

    // Récupérer la valeur brute en incluant le champ désactivé (schoolId)
    const payload = this.userForm.getRawValue();

    this.rbacStore.createUser(payload, () => {
      this.userStore.loadUsers();
      this.closeUserModal();
    });
  }

  // --- ACTIONS : AFFECTATION DES RÔLES ET PERMISSIONS ---
  openAssignModal(user: any): void {
    this.selectedUserForAssign.set(user);

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
      this.userStore.loadUsers();
      this.closeAssignModal();
    });
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.userStore.setSearchQuery(input.value);
  }

  hasPermission(rolePermissions: any[], permId: string): boolean {
    return rolePermissions?.some(p => p.id === permId) ?? false;
  }
}
