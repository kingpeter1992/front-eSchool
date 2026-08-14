import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStoreService } from '../../../services/auth-store-service';

@Component({
  selector: 'app-unauthorized',
  imports: [],
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.css',
})
export class Unauthorized implements OnInit {
  ngOnInit(): void {
 
  }

  private readonly router = inject(Router);
  readonly auth = inject(AuthStoreService);

  goHome(): void {

    const roles = this.auth.roles();

    if (roles.includes('SUPER_ADMIN')) {
      this.router.navigate(['/']);
    }

    else {
      this.router.navigate(['/attente-validation']);
    }
  }
}
