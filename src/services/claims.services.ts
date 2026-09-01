import supabase from "../config/supabase";
import { Claim } from "../models/claim";
import { Total } from "../types";

/**
 * Fetches claims based on the provided filters and aggregate totals grouped by currency.
 * @param filters 
 */
export async function fetchClaims(filters: {
    startDate?: string;
    endDate?: string;
    status?: string;
    currency?: string;
}) {
    const query = supabase.from("claims").select("*");

    if (filters.startDate) {
        query.gte("loss_date", filters.startDate);
    }
    if (filters.endDate) {
        query.lte("loss_date", filters.endDate);
    }
    if (filters.status) {
        query.eq("status", filters.status);
    }
    if (filters.currency) {
        query.eq("currency", filters.currency);
    }

    const { data: claims, error: claimsError } = await query;

    if (claimsError) {
        throw new Error(`Error fetching claims: ${claimsError.message}`);
    }
    
    const { data: totals, error: totalsError } = await supabase.rpc("get_claim_totals_by_currency", {
        p_start_date: filters.startDate || null,
        p_end_date: filters.endDate || null,
        p_status: filters.status || null,
        p_currency: filters.currency || null
    });
    
    if (totalsError) {
        throw new Error(`Error fetching claim totals: ${totalsError.message}`);
    }

    return { claims: claims as Claim[], totals: totals as Total[] };
}