import supabase from "../config/supabase";
import { DEFAULT_RATES } from "../constants/currency";
import { Claim } from "../models/claim";
import { Payment } from "../models/payment";
import { Metric, Total } from "../types";
import { formatCurrency } from "../utils/currency";


const PRIMARY_CURRENCY = "USD"

/**
 * Fetches only the summary data needed for metric cards.
 * Returns the total claim count plus the aggregate totals grouped by currency.
 */
export async function fetchClaimsMetrics() {
    const { data: totals, error: totalError } = await supabase.rpc("get_claim_totals_by_currency");
    const { data: claims, error: claimsError } = await supabase.rpc("get_filtered_claims")
    if (totalError || claimsError) {
        console.error("Error fetching claim totals for metrics: ", totalError);
        throw new Error(`Error fetching claim totals: ${totalError?.message || claimsError?.message}`);
    }

    let total_estimated_loss = 0;
    let total_paid = 0;
    let outstanding_balance = 0

    for (const total of totals || []) {
        if (total.currency === "USD") {
            total_estimated_loss += parseFloat(total.total_estimated);
            total_paid += parseFloat(total.total_paid);
            outstanding_balance += parseFloat(total.total_outstanding);
        } else {
            // Convert to USD using the DEFAULT_RATES
            total_estimated_loss += parseFloat(total.total_estimated) * (DEFAULT_RATES[total.currency]?.USD || 1);
            total_paid += parseFloat(total.total_paid) * (DEFAULT_RATES[total.currency]?.USD || 1);
            outstanding_balance += parseFloat(total.total_outstanding) * (DEFAULT_RATES[total.currency]?.USD || 1);
        }
    }

    const metrics: Metric[] = [
        {
            id: "claims",
            label: "Total Claims",
            value: `${claims?.length || 0} Registered`,
            sub: "All statuses",
        },
        {
            id: "estimated",
            label: "Total Estimated Loss",
            value: formatCurrency(total_estimated_loss, PRIMARY_CURRENCY),
            sub: `Primary: ${PRIMARY_CURRENCY}`,
        },
        {
            id: "paid",
            label: "Total Paid",
            value: formatCurrency(total_paid, PRIMARY_CURRENCY),
            tone: "positive",
            sub: "Settled claims",
        },
        {
            id: "outstanding",
            label: "Outstanding Balance",
            value: formatCurrency(outstanding_balance, PRIMARY_CURRENCY),
            tone: "negative",
            sub: "Unsettled claims",
        },
    ];

    return metrics;
}

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
    const { data: claims, error: claimsError } = await supabase.rpc("get_filtered_claims", {
        p_start_date: filters.startDate || null,
        p_end_date: filters.endDate || null,
        p_currency: filters.currency || null,
        p_status: filters.status || null,
    })
    
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
        .from("claim_payments")
        .select("*")
        .eq("claim_id", claimId);

    if (paymentsError) {
        throw new Error(`Error fetching payments for claim ID ${claimId}: ${paymentsError.message}`);
    }

    return { claim: claim as Claim, payments: payments as Payment[] };
}