export type PaywallPlanId = 'free' | 'pro' | 'enterprise';

export interface PlanOption {
  id: PaywallPlanId;
  title: string;
  priceLine: string;
  lines: string[];
}
