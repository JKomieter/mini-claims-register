import { Request, Response, NextFunction } from 'express';
import supabase from '../config/supabase';

/**
 * Handles the POST request to record a payment for a specific claim.
 * @param req 
 * @param res 
 * @param next 
 */
export async function recordPayment(req: Request, res: Response, next: NextFunction) {
    try {
        const { claimId, amount, currency, exchangeRate } = req.body;

        if (!claimId || !amount || !currency) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        const numericAmount = parseFloat(amount);

        // Fetch the target claim's base currency
        const { data: claim, error: claimError } = await supabase
            .from("claims")
            .select("currency")
            .eq("id", claimId)
            .single();

        if (claimError || !claim) {
            return res.status(404).json({ error: "Target claim not found." });
        }

        // Determine exchange rate and compute converted amount
        let finalExchangeRate = 1.0;
        let amountInClaimCurrency = numericAmount;

        if (currency !== claim.currency) {
            // Require exchange rate if currencies do not match
            if (!exchangeRate || parseFloat(exchangeRate) <= 0) {
                return res.status(400).json({
                    error: `Payment currency (${currency}) differs from claim currency (${claim.currency}). An exchange rate is required.`
                });
            }
            finalExchangeRate = parseFloat(exchangeRate);
            amountInClaimCurrency = numericAmount * finalExchangeRate;
        }

        // 3. Insert payment record with calculated values
        const { data, error } = await supabase
            .from("claim_payments")
            .insert({
                claim_id: claimId,
                payment_date: req.body.paymentDate || new Date().toISOString().split('T')[0],
                payment_currency: currency,
                payment_amount: numericAmount,
                exchange_rate: finalExchangeRate,
                amount_in_claim_currency: amountInClaimCurrency,
                reference_note: req.body.referenceNote || null,
            })
            .select("id")
            .single();

        if (error) {
            throw new Error(`Error recording payment: ${error.message}`);
        }

        return res.status(201).json({
            message: "Payment recorded successfully.",
            paymentId: data.id
        });
    } catch (error) {
        next(error);
    }
}