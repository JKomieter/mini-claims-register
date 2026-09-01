import { Currency } from "../models/claim";

export interface Total {
    currency: Currency;
    total_estimated: string;    
    total_approved: string;
    total_paid: string;
    total_outstanding: string;
}

export type ClaimStatus = "Reserved, not yet settled" | "Settled, payment outstanding" | "Settled and paid"

export type Metric = {
    id: string;
    label: string;
    value: string;
    sub?: string;
    tone?: "default" | "positive" | "negative";
};