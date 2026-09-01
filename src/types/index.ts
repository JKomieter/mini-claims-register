import { Currency } from "../models/claim";

export interface Total {
    currency: Currency;
    total_estimated: string;    
    total_approved: string;
    total_paid: string;
    total_outstanding: string;
}