import { Component, computed, inject, Input, input, OnInit, output, signal } from '@angular/core';
import { SCHOOL_IMPORTS } from '../../services/school-imports';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { RbacStore } from '../../../../core/services/RbacStore';
import { UserStore } from '../../../Users/services/UserStore';
import { SchoolStore } from '../../services/school.store';
import { AuthStoreService } from '../../../../core/services/auth-store-service';
import { CreateUserDto, User } from '../../../../core/models/User';
import { RoleStore } from '../../../Users/services/role.store';
export type AdminRole = 'ROLE_ADMIN' | 'ROLE_USER';


// Validation personnalisée : entre 1 et 2 campus autorisés
function campusLimitValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!Array.isArray(value) || value.length === 0) {
    return { required: true };
  }
  if (value.length > 2) {
    return { maxCampusExceeded: true };
  }
  return null;
}


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
    readonly roleStore = inject(RoleStore);


  @Input() user: User[] = [];

  isUserModalOpen = signal<boolean>(false);
  isAssignModalOpen = signal<boolean>(false);
  selectedUserForAssign = signal<any>(null);

  userForm: FormGroup = this.fb.group({
    roleType: [null, [Validators.required]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    schoolId: ['', [Validators.required]],
    campusIds: [[], [Validators.required, campusLimitValidator]],
  });

  assignForm: FormGroup = this.fb.group({
    userId: ['', [Validators.required]],
    roleIds: [[]],
    permissionIds: [[]]
  });

  selectedRole = signal<AdminRole | null>(null);
  campusLimitExceeded = signal<boolean>(false);

  ngOnInit(): void {
    this.rbacStore.loadRbacCache().subscribe();
    this.userStore.loadUsers();
   this.roleStore.loadAllRoles();
    this.schoolStore.loadSchools().subscribe();
    this.initSchoolListener();
  }


  private initSchoolListener(): void {
    this.userForm.get('schoolId')?.valueChanges.subscribe(() => {
      this.userForm.get('campusIds')?.reset([]);
      this.campusLimitExceeded.set(false);
    });
  }

  get schoolCampuses() {
    const selectedSchoolId = this.userForm.get('schoolId')?.value || this.currentSchoolId;
    const schools = this.schoolStore.schools() || [];
    const school = schools.find((s: any) => s.id === selectedSchoolId);
    return school?.campuses || school?.campuses || [];
  }

  // 🟢 Résout l'erreur 1 : Disponible pour le template si 'availableRoles' est appelé
  get availableRoles() {
    return this.availableAdminRoles;
  }

  get availableAdminRoles() {
    const allRoles = this.rbacStore.roles() || [];
    return allRoles.filter((r: any) => {
      const code = (r.code || r.slug || r.name || '').toUpperCase();
      return code === 'ROLE_ADMIN' || code === 'ADM_USER';
    });
  }

  get isSchoolAdmin(): boolean {
    const currentUser = this.authStore.user();
    return !!(currentUser?.school?.id || currentUser?.user?.schoolId);
  }

  get currentSchoolId(): string {
    const currentUser = this.authStore.user();
    return currentUser?.school?.id || currentUser?.user?.schoolId || '';
  }

  get users() {
    const allUsers = this.userStore.users() || [];
    if (!this.isSchoolAdmin) return allUsers;

    const schoolId = this.currentSchoolId;
    return allUsers.filter((u: any) =>
      u.schoolId === schoolId || u.school_id === schoolId || u.school?.id === schoolId
    );
  }

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

  get activeUsersCount(): number {
    return this.users.filter((u: any) => u.status === 'ACTIVE').length;
  }

  get rolesCount(): number {
    return this.availableRoles.length;
  }

  get searchQuery() {
    return this.userStore.searchQuery;
  }

  openUserModal(): void {
    const defaultSchoolId = this.currentSchoolId;

    this.userForm.reset({
      roleType: null,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      schoolId: defaultSchoolId,
      campusIds: []
    });

    this.selectedRole.set(null);
    this.campusLimitExceeded.set(false);

    if (this.isSchoolAdmin) {
      this.userForm.get('schoolId')?.disable();
    } else {
      this.userForm.get('schoolId')?.enable();
    }

    this.isUserModalOpen.set(true);
  }

  // onRoleChange(role: AdminRole): void {
  //   this.selectedRole.set(role);
  //   this.userForm.patchValue({ roleType: role });
  // }

  checkCampusLimit(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selectedOptions = Array.from(select.selectedOptions);
    this.campusLimitExceeded.set(selectedOptions.length > 2);
  }

  closeUserModal(): void {
    this.isUserModalOpen.set(false);
    this.selectedRole.set(null);
    this.campusLimitExceeded.set(false);
  }




  // Signal pour stocker l'UUID du rôle sélectionné
  readonly selectedRoleId = signal<string | null>(null);

  onRoleChange(role: any): void {
    // 1. Mise à jour de l'affichage local
    this.selectedRole.set(role);
    this.userForm.patchValue({ roleType: role });

    // 2. Recherche du rôle dans la liste du RoleStore par slug ou par nom
    const rolesList = this.roleStore.roles();

    // On cherche par slug ou par name selon le type contenu dans 'role'
    const foundRole = rolesList.find(
      r => r.slug === role || r.name === role || r.id === role
    );

    if (foundRole) {
      this.selectedRoleId.set(foundRole.id);
    } else {
      console.warn(`Rôle "${role}" introuvable dans le RoleStore.`);
      this.selectedRoleId.set(null);
    }
  }



  // 🟢 Résout l'erreur 2 : Alignement du payload avec la structure de CreateUserDto (roleSlugs)
  submitUser(): void {
    if (this.userForm.invalid || this.campusLimitExceeded()) {
      this.userForm.markAllAsTouched();
      return;
    }

    const rawValue = this.userForm.getRawValue();
    const roleId = this.selectedRoleId();

    if (!roleId) {
      alert('Veuillez sélectionner un rôle valide.');
      return;
    }



    const payload: CreateUserDto = {
      firstName: rawValue.firstName,
      lastName: rawValue.lastName,
      email: rawValue.email,
      phone: rawValue.phone || undefined,
      schoolId: rawValue.schoolId || undefined,
      campusId: rawValue.campusIds?.[0] || undefined, // Premier campus par défaut
      roleSlugs: [rawValue.roleType], // Mappage sur roleSlugs exigé par CreateUserDto
      roleIds: [roleId] // 👈 Envoie de l'UUID trouvé
    };
console.log('Payload prêt à être envoyé :', payload);
    this.rbacStore.createUser(payload, () => {
      this.userStore.loadUsers();
      this.closeUserModal();
    });
  }

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
