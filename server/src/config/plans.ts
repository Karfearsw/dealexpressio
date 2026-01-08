
export const PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic Plan',
    monthlyPrice: 50,
    yearlyPrice: 500, // ~2 months free
    maxLeads: 500,
    maxProperties: 50,
    maxUsers: 1,
    features: [
      'Lead Management & Auto-Enrich',
      'Deal Calculator & Offer Letters',
      '1 User Seat',
      'Email Support',
      'Up to 500 leads',
      'Up to 50 properties'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro Plan',
    monthlyPrice: 100,
    yearlyPrice: 1000,
    maxLeads: 1000,
    maxProperties: 200,
    maxUsers: 3,
    features: [
      'Everything in Basic',
      'Advanced Property Analysis',
      'Automated Follow-ups',
      'Up to 3 User Seats',
      'Priority Support',
      'Up to 1,000 leads',
      'Up to 200 properties',
      'SMS Messaging'
    ],
    popular: true
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Plan',
    monthlyPrice: 1000,
    yearlyPrice: 10000,
    maxLeads: -1, // unlimited
    maxProperties: -1,
    maxUsers: -1,
    features: [
      'Everything in Pro',
      'Unlimited Leads & Properties',
      'Unlimited User Seats',
      'Custom Integrations',
      'Dedicated Account Manager',
      'Phone Support',
      'White-label Options',
      'API Access'
    ]
  }
} as const;

export type PlanId = keyof typeof PLANS;
