import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Toast } from '../../../../shared/toaste/Toast';
import { LoaderService } from '../../../../shared/loader/loader-service';
import { AuthService } from '../../../services/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



@Component({
  selector: 'app-passwordforgot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatProgressSpinnerModule, // <-- Ajout de cette ligne
  ],
  templateUrl: './passwordforgot.component.html',
  styleUrl: './passwordforgot.component.css',
})
export class PasswordforgotComponent {
  loading$: Observable<boolean> | undefined;

  constructor(
    private toastrService: Toast,
    private _dao: AuthService,
    private loadingService: LoaderService,

    private route: Router,
  ) {
    this.loading$ = this.loadingService.loading$;
  }

  email = '';

  onSubmit(): void {
    if (!this.email || !this.email.trim()) {
      this.toastrService.info('Veuillez saisir votre adresse e-mail.');
      return;
    }

    this._dao.forgotPassword(this.email.trim()).subscribe({
      next: () => {
        this.toastrService.success(
          'Si cette adresse existe, un lien de réinitialisation a été envoyé.',
        );

        this.email = '';
      },

      error: (error) => {
        console.error('Erreur réinitialisation mot de passe :', error);

        this.toastrService.error('Une erreur est survenue. Veuillez réessayer.');
      },
    });
  }
}
