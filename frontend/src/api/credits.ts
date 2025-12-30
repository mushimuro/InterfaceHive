import apiClient from './client';

export interface CreditBalance {
  user_id: string;
  total_credits: number;
  awards: number;
  reversals: number;
  adjustments: number;
}

export interface CreditLedgerEntry {
  id: string;
  to_user: string;
  from_user: string | null;
  from_user_name: string | null;
  project: string;
  project_title: string;
  contribution: string | null;
  contribution_id: string | null;
  amount: number;
  entry_type: 'AWARD' | 'REVERSAL' | 'ADJUSTMENT';
  created_at: string;
}

export interface CreditLedgerResponse {
  status_code: number;
  message: string;
  data: CreditLedgerEntry[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface PublicUserCredits {
  user_id: string;
  display_name: string;
  total_credits: number;
}

/**
 * Get authenticated user's credit balance
 */
export const getMyCreditBalance = async (): Promise<CreditBalance> => {
  const response = await apiClient.get('/credits/me/balance/');
  return response.data.data;
};

/**
 * Get authenticated user's credit ledger (transaction history)
 */
export const getMyCreditLedger = async (params?: Record<string, any>): Promise<CreditLedgerResponse> => {
  const response = await apiClient.get('/credits/me/ledger/', { params });
  return response.data;
};

/**
 * Get public credit balance for any user
 */
export const getUserCredits = async (userId: string): Promise<PublicUserCredits> => {
  const response = await apiClient.get(`/credits/users/${userId}/`);
  return response.data.data;
};

