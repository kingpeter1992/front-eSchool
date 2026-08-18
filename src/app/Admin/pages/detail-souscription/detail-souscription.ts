import { Component, inject, OnInit, signal } from '@angular/core';
import { SCHOOL_IMPORTS } from '../../../features/Schools/services/school-imports';
import { ActivatedRoute, Router } from '@angular/router';
import { Toast } from '../../../shared/toaste/Toast';
import { SubscriptionDashboardService } from '../../Service/suscription/SubscriptionDashboardService';
import { SubscriptionItem } from '../../models/SubscriptionDashboardDto';

@Component({
  selector: 'app-detail-souscription',
  standalone: true,
  imports: [SCHOOL_IMPORTS],
  templateUrl: './detail-souscription.html',
  styleUrl: './detail-souscription.scss',
})
export class DetailSouscription implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dashboardService = inject(SubscriptionDashboardService);
  private toast = inject(Toast);

  readonly schoolId = signal<string | null>(null);
  readonly subscription = signal<SubscriptionItem | null>(null);
  readonly isLoading = signal<boolean>(true);
readonly now = new Date();
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('schoolId');
    if (id) {
      this.schoolId.set(id);
      this.loadSchoolSubscription(id);
    } else {
      this.goBack();
    }
  }

  loadSchoolSubscription(id: string): void {
    this.isLoading.set(true);
    this.dashboardService.getDashboardBySchool(id).subscribe({
      next: (data) => {
        this.subscription.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement détails:', err);
        this.toast.showError('Impossible de charger les détails de cet abonnement.');
        this.isLoading.set(false);
      }
    });
  }

  getElapsedPercentage(startsAt: string | Date, expiresAt: string | Date): number {
    const start = new Date(startsAt).getTime();
    const end = new Date(expiresAt).getTime();
    const now = new Date().getTime();

    if (now <= start) return 0;
    if (now >= end) return 100;

    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  }

  getRemainingDays(expiresAt: string | Date): number {
    const end = new Date(expiresAt).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  goBack(): void {
    this.router.navigate(['/subscriptions/dashboard']);
  }

// 🟢 Implémentation de la méthode d'impression PDF
printSubscription(): void {
  window.print();
}
}
