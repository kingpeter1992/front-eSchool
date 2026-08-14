import { Component, inject } from '@angular/core';
import { AuthStoreService } from '../../../services/auth-store-service';

@Component({
  selector: 'app-attennte-component',
  imports: [],
    standalone: true,

  templateUrl: './attennte-component.html',
  styleUrl: './attennte-component.css',
})
export class AttennteComponent {
  readonly auth = inject(AuthStoreService);

  logout(): void {
    this.auth.logout();
  }
}
