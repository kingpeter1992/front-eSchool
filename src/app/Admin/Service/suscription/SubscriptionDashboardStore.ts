import { Injectable, inject, signal, computed } from '@angular/core';
import { CreateSubscriptionRequestDto, SubscriptionDashboardDto, SubscriptionItem, UpdateSubscriptionRequestDto } from '../../models/SubscriptionDashboardDto';
import { SubscriptionDashboardService } from './SubscriptionDashboardService';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, of, tap } from 'rxjs';

const CACHE_KEY = 'subscription_dashboard_cache';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionDashboardStore {

private readonly apiService = inject(SubscriptionDashboardService);

  private readonly _stats = signal<SubscriptionDashboardDto | null>(this.loadFromCache());
  private readonly _subscriptions = signal<SubscriptionItem[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly stats = computed(() => this._stats());
  readonly subscriptions = computed(() => this._subscriptions());
  readonly isLoading = computed(() => this._isLoading());
  readonly error = computed(() => this._error());

loadSubscriptions(): void {
  this.apiService.getAllSubscriptions().subscribe({
    next: (data) => {
      this._subscriptions.set(
        Array.isArray(data) ? data : []
      );
              console.log('liste souscript', data)

    },
    error: (err) => {
      console.error('❌ Erreur chargement des abonnements', err);
      this._subscriptions.set([]);
    }
  });
}

  fetchStatsObservable(forceRefresh = false): Observable<SubscriptionDashboardDto | null> {
    if (this._stats() && !forceRefresh) return of(this._stats());

    this._isLoading.set(true);
    return this.apiService.getDashboardStats().pipe(
      tap((data) => {
        this.setStatsAndCache(data);
        this._isLoading.set(false);
      }),
      catchError((err) => {
        this._isLoading.set(false);
        throw err;
      })
    );
  }


  clearCache(): void {
    localStorage.removeItem(CACHE_KEY);
    this._stats.set(null);
  }


  // --- CRÉATION (AJOUT) ---
  addSubscription(schoolId: string, request: CreateSubscriptionRequestDto): Observable<SubscriptionItem> {
    this._isLoading.set(true);
    return this.apiService.createSubscription(schoolId, request).pipe(
      tap((newItem) => {
        // 1. Mise à jour de la liste locale des souscriptions
        this._subscriptions.update(items => [newItem, ...items]);

        // 2. Recalcul des métriques du Dashboard (Incrémentation)
        const currentStats = this._stats();
        if (currentStats) {
          const updatedPlans = { ...currentStats.countByPlanType };
          updatedPlans[newItem.planType] = (updatedPlans[newItem.planType] || 0) + 1;

          const updatedMrr = currentStats.monthlyRecurringRevenue + newItem.amount;

          this.setStatsAndCache({
            ...currentStats,
            monthlyRecurringRevenue: updatedMrr,
            annualRecurringRevenue: updatedMrr * 12,
            totalSubscriptions: currentStats.totalSubscriptions + 1,
            activeSubscriptions: currentStats.activeSubscriptions + 1,
            countByPlanType: updatedPlans
          });
        }
        this._isLoading.set(false);
      }),
      catchError((err) => {
        this._isLoading.set(false);
        throw err;
      })
    );
  }

  // --- MISE À JOUR (MODIFICATION) ---
  updateSubscription(subscriptionId: string, request: UpdateSubscriptionRequestDto): Observable<SubscriptionItem> {
    this._isLoading.set(true);
    return this.apiService.updateSubscription(subscriptionId, request).pipe(
      tap((updatedItem) => {
        const oldItem = this._subscriptions().find(s => s.id === subscriptionId);

        // 1. Remplacement dans la liste locale
        this._subscriptions.update(items =>
          items.map(s => s.id === subscriptionId ? updatedItem : s)
        );

        // 2. Ajustement des métriques du Dashboard
        const currentStats = this._stats();
        if (currentStats && oldItem) {
          const updatedPlans = { ...currentStats.countByPlanType };

          // Ajuster le décompte par plan si changement de type de plan
          if (oldItem.planType !== updatedItem.planType) {
            if (updatedPlans[oldItem.planType] > 0) updatedPlans[oldItem.planType] -= 1;
            updatedPlans[updatedItem.planType] = (updatedPlans[updatedItem.planType] || 0) + 1;
          }

          // Ajuster le MRR en fonction du nouveau montant
          const updatedMrr = Math.max(0, currentStats.monthlyRecurringRevenue - oldItem.amount + updatedItem.amount);

          this.setStatsAndCache({
            ...currentStats,
            monthlyRecurringRevenue: updatedMrr,
            annualRecurringRevenue: updatedMrr * 12,
            countByPlanType: updatedPlans
          });
        }
        this._isLoading.set(false);
      }),
      catchError((err) => {
        this._isLoading.set(false);
        throw err;
      })
    );
  }

  // --- CHARGEMENT ---
  fetchStats(forceRefresh = false): void {
    if (this._stats() && !forceRefresh) return;

    this._isLoading.set(true);
    this.apiService.getDashboardStats().subscribe({
      next: (data) => {
        this.setStatsAndCache(data);
        this._isLoading.set(false);
      },
      error: () => this._isLoading.set(false)
    });
  }



  // --- CACHE MANAGEMENT ---
  private setStatsAndCache(data: SubscriptionDashboardDto): void {
    this._stats.set(data);
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  }

  private loadFromCache(): SubscriptionDashboardDto | null {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    try {
      return JSON.parse(cached);
    } catch {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }

/**
   * Envoie un email manuel à un établissement
   */
  sendEmail(schoolId: string, payload: { subject: string; message: string }): Observable<void> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.apiService.sendEmail(schoolId, payload).pipe(
      tap(() => {
        this._isLoading.set(false);
      }),
      catchError((err) => {
        this._error.set("Échec de l'envoi de l'email à l'établissement.");
        this._isLoading.set(false);
        throw err;
      })
    );
  }
}
