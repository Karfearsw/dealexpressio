
import axios from 'axios';

const POOF_API_URL = 'https://www.poof.io/api/v1';

export interface CreateCheckoutParams {
  amount: string;
  username: string;
  success_url?: string;
  redirect?: string;
  instant_payment_notification?: string;
  metadata?: Record<string, any>;
}

export interface PoofCheckoutResponse {
  checkout_url: string;
  checkout_id: string;
}

export interface PoofTransactionResponse {
  transaction_id: string;
  status: string;
  amount: string;
  currency: string;
  payment_method: string;
  created_at: string;
}

export class PoofClient {
  private apiKey: string;
  private username: string;

  constructor(apiKey: string, username: string) {
    this.apiKey = apiKey;
    this.username = username;
  }

  /**
   * Create a Poof checkout session for payment
   */
  async createCheckout(params: CreateCheckoutParams): Promise<PoofCheckoutResponse> {
    try {
      const response = await axios.post(
        `${POOF_API_URL}/checkout`,
        {
          username: this.username,
          amount: params.amount,
          success_url: params.success_url || process.env.POOF_SUCCESS_URL,
          redirect: params.redirect || process.env.POOF_SUCCESS_URL,
          instant_payment_notification: params.instant_payment_notification || process.env.POOF_WEBHOOK_URL,
          metadata: params.metadata || {},
        },
        {
          headers: {
            'Authorization': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Poof createCheckout error:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Fetch transaction details from Poof
   */
  async fetchTransaction(transactionId: string): Promise<PoofTransactionResponse> {
    try {
      const response = await axios.post(
        `${POOF_API_URL}/fetch/transaction`,
        {
          transaction_id: transactionId,
        },
        {
          headers: {
            'Authorization': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Poof fetchTransaction error:', error);
      throw new Error('Failed to fetch transaction');
    }
  }

  /**
   * Create a payment link (alternative to checkout)
   */
  async createPaymentLink(amount: string, description: string): Promise<{ payment_link: string }> {
    try {
      const response = await axios.post(
        `${POOF_API_URL}/create/payment-link`,
        {
          username: this.username,
          amount: amount,
          description: description,
        },
        {
          headers: {
            'Authorization': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Poof createPaymentLink error:', error);
      throw new Error('Failed to create payment link');
    }
  }
}

// Export singleton instance
export const poofClient = new PoofClient(
  process.env.POOF_API_KEY || '',
  process.env.POOF_USERNAME || ''
);
