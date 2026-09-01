import supabase from "../config/supabase";
import { DEFAULT_RATES } from '../constants/currency';

const referenceNotes = [
    "Payment for claim settlement",
    "Partial payment for approved claim",
    "Final payment for approved claim",
    "Advance payment for claim processing",
]

async function seedPayments() {
    const { data: claims, error: claimsError } = await supabase.from("claims").select("*");

    if (claimsError) {
        console.error("Error fetching claims for payment seeding:", claimsError);
        return;
    }

    for (const claim of claims) {
        const makePayment = Math.random() < 0.5; 
        if (makePayment) {
            const paymentCurrency = ["USD", "EUR", "GBP", "GHS"][Math.floor(Math.random() * 4)];
            const paymentAmountRaw = claim.approved_amount ? Math.random() * Number(claim.approved_amount) : null;

            // Determine exchange rate; if currencies are the same use 1, otherwise look up table safely
            let exchangeRate: number | null = null;
            if (paymentAmountRaw != null) {
                if (paymentCurrency === claim.currency) {
                    exchangeRate = 1;
                } else {
                    exchangeRate = DEFAULT_RATES[paymentCurrency]?.[claim.currency] ?? null;
                }
            }

            // Only compute converted amount when we have a valid numeric rate
            const paymentAmount = paymentAmountRaw != null ? Number(paymentAmountRaw.toFixed(2)) : null;
            const amountInClaimCurrency = (paymentAmount != null && exchangeRate != null)
                ? Number((paymentAmount * exchangeRate).toFixed(2))
                : null;
            if (paymentAmount) {
                const { data, error } = await supabase.from("claim_payments").insert({
                    claim_id: claim.id,
                    payment_amount: paymentAmount,
                    payment_date: new Date().toISOString().split('T')[0],
                    payment_currency: paymentCurrency,
                    exchange_rate: exchangeRate,
                    amount_in_claim_currency: amountInClaimCurrency,
                    reference_note: referenceNotes[Math.floor(Math.random() * referenceNotes.length)],
                }).select("id");

                if (error) {
                    console.error(`Error seeding payment for claim ${claim.id}:`, error);
                } else {
                    console.log(`Seeded payment for claim ${claim.id} with payment ID: ${data[0].id}`);
                }
            }
        }
    }
}

seedPayments();