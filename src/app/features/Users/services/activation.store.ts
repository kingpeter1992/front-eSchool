import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ActivationContext, CompleteActivationPayload } from '../../../core/models/User';
import { Toast } from '../../../shared/toaste/Toast';
import { ActivationService } from './ActivationService';


@Injectable({
  providedIn: 'root'
})
export class ActivationStore {
  private readonly activationService = inject(ActivationService);
  private readonly router = inject(Router);
  private readonly toast = inject(Toast);

  // État privé
  private readonly _context = signal<ActivationContext | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Selectors publics
  readonly context = this._context.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly userRole = computed(() => this._context()?.role ?? '');

  verifyToken(token: string): void {
    this._loading.set(true);
    this._error.set(null);

    this.activationService.verifyToken(token).subscribe({
      next: (ctx) => {
        this._context.set(ctx);
        this._loading.set(false);
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Lien d’activation invalide ou expiré.';
        this._error.set(msg);
        this._loading.set(false);
        this.toast.error(msg);
      }
    });
  }

  submitActivation(payload: CompleteActivationPayload): void {
    this._loading.set(true);

    this.activationService.completeActivation(payload).subscribe({
      next: () => {
        this._loading.set(false);
        this.toast.success('Compte activé avec succès ! Connectez-vous.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this._loading.set(false);
        const msg = err?.error?.message ?? 'Échec de l’activation.';
        this.toast.error(msg);
      }
    });
  }
}
