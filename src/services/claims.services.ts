import supabase from "../config/supabase";
import { Claim } from "../models/claim";
import { Payment } from "../models/payment";
import { Total } from "../types";


/**
 * Fetches claims based on the provided filters and aggregate totals grouped by currency.
 * @param filters 
 * @returns An object containing the list of claims and the aggregate totals.
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
        console.error(`Error fetching claims: `, claimsError)
        throw new Error(`Error fetching claims: ${claimsError.message}`);
    }
    
    const { data: totals, error: totalsError } = await supabase.rpc("get_claim_totals_by_currency", {
        p_start_date: filters.startDate || null,
        p_end_date: filters.endDate || null,
        p_status: filters.status || null,
        p_currency: filters.currency || null
    });
    
    if (totalsError) {
        console.error("Error fetching claim totals: ", totalsError)
        throw new Error(`Error fetching claim totals: ${totalsError.message}`);
    }

    return { claims: claims as Claim[], totals: totals as Total[] };
}

/**
 * Fetches a single claim by its ID along with its payment history.
 * @param claimId 
 * @returns An object containing the claim details and its associated payments.
 */
export async function fetchClaimById(claimId: string) {
    const { data: claim, error: claimError } = await supabase
        .from("claims")
        .select("*")
        .eq("id", claimId)
        .single();

    if (claimError) {
        throw new Error(`Error fetching claim by ID: ${claimError.message}`);
    }

    const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .eq("claim_id", claimId);

    if (paymentsError) {
        throw new Error(`Error fetching payments for claim ID ${claimId}: ${paymentsError.message}`);
    }

    return { claim: claim as Claim, payments: payments as Payment[] };
}