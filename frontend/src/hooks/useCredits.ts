import { useQuery } from '@tanstack/react-query';
import {
  getMyCreditBalance,
  getMyCreditLedger,
  getUserCredits,
  type CreditBalance,
  type CreditLedgerResponse,
  type PublicUserCredits,
} from '../api/credits';

/**
 * Fetch authenticated user's credit balance
 */
export const useMyCreditBalance = () => {
  return useQuery<CreditBalance, Error>({
    queryKey: ['credits', 'my-balance'],
    queryFn: getMyCreditBalance,
  });
};

/**
 * Fetch authenticated user's credit ledger (transaction history)
 */
export const useMyCreditLedger = (params?: Record<string, any>) => {
  return useQuery<CreditLedgerResponse, Error>({
    queryKey: ['credits', 'my-ledger', params],
    queryFn: () => getMyCreditLedger(params),
  });
};

/**
 * Fetch public credit balance for any user
 */
export const useUserCredits = (userId?: string) => {
  return useQuery<PublicUserCredits, Error>({
    queryKey: ['credits', 'user', userId],
    queryFn: () => getUserCredits(userId!),
    enabled: !!userId,
  });
};

