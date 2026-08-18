// subscription-dashboard.model.ts

export enum PlanType {
  FREE = 'FREE',
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE'
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
  TRIAL = 'TRIAL',
  SUSPENDED = 'SUSPENDED'
}

// 🟢 DTO des statistiques globales du dashboard (Unifié avec toutes les métriques)
export interface SubscriptionDashboardDto {
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  totalRevenueCollected?: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  expiredSubscriptions: number;
  suspendedSubscriptions: number;
  countByPlanType: Record<string, number>;
  conversionRate?: number;
}

// 🟢 DTO d'un élément de souscription (Utilise directement les enums)
export interface SubscriptionItem {
  id: string;
  schoolId: string;
  schoolName: string;
  schoolEmail: string;
  planType: PlanType;
  startsAt: string;
  expiresAt: string;
  amount: number;
  currency: string;
  status: SubscriptionStatus;
  isExpired: boolean;
}

// 🟢 DTO pour la création d'abonnement
export interface CreateSubscriptionRequestDto {
  planType: PlanType;
  durationInMonths: number;
  amount: number;
  currency?: string;
}

// 🟢 DTO pour la mise à jour d'abonnement
export interface UpdateSubscriptionRequestDto {
  planType?: PlanType;
  durationInMonths?: number;
  amount?: number;
  currency?: string;
  status?: SubscriptionStatus;
}

// 🟢 DTO pour l'envoi d'email
export interface SendEmailRequestDto {
  subject: string;
  message: string;
}


export interface SubscriptionFormModel {
  planType: PlanType;
  durationInMonths: number;
  amount: number;
  currency: string;
}
