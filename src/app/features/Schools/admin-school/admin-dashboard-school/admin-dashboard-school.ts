import { Component, inject, OnInit } from '@angular/core';
import { RbacStore } from '../../../../core/services/RbacStore';
import { UserStore } from '../../../Users/services/UserStore';
import { SCHOOL_IMPORTS } from '../../services/school-imports';

@Component({
  selector: 'app-admin-dashboard-school',
  standalone: true,
  imports: [SCHOOL_IMPORTS],
  templateUrl: './admin-dashboard-school.html',
  styleUrl: './admin-dashboard-school.scss',
})
export class AdminDashboardSchool implements OnInit {
  readonly userStore = inject(UserStore);
  readonly rbacStore = inject(RbacStore);

  ngOnInit(): void {
    this.userStore.loadUsers();
    this.rbacStore.loadRbacCache().subscribe();
  }

  // Exemple d'action rapide pour inviter un utilisateur
  openCreateUserModal(): void {
    // Logique d'ouverture de modal
  }
}
