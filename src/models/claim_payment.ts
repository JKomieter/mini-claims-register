import { Currency } from "./claim";


export interface ClaimPayment {
    id: string;
    claim_id: string;
    payment_date: string;
    payment_currency: Currency;
    payment_amount: number;
    exchange_rate: number;
    reference_note: string | null;
    amount_in_claim_currency: number;
    created_at: string;
    updated_at: string;
}