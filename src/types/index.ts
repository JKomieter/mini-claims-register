import { Currency } from "../models/claim";

export interface Total {
    currency: Currency;
    total_estimated: string;    // Postgres NUMERIC types are returned as strings in node-postgres to preserve precision
    total_approved: string;
    total_paid: string;
    total_outstanding: string;
}