import { ClaimStatus } from "../types";

export type Currency = 'USD' | 'EUR' | 'GBP' | 'GHS'

export interface Claim {
    id: string;
    policy_number: string;
    insured_name: string;
    loss_date: string;
    date_notified: string;
    loss_nature: string;
    currency: Currency;
    estimated_loss_amount: number;
    approved_amount: number | null;
    total_paid: number | null;
    outstanding_balance: number | null;
    claim_status: ClaimStatus;
    created_at: string;
    updated_at: string;
}