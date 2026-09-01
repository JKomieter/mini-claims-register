import { Request, Response, NextFunction } from 'express';
import { fetchClaimById, fetchClaims } from '../services/claims.services';
import supabase from '../config/supabase';

/**
 * Handles the GET request to fetch claims with optional filters and pagination.
 * @param req 
 * @param res 
 * @param next 
 */
export async function getClaims(req: Request, res: Response, next: NextFunction) {
    try {
        // get the query parameters for pagination
        const page = parseInt(req.query.page as string) || 1;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const status = req.query.status as string | undefined;
        const currency = req.query.currency as string | undefined;

        const { claims, totals } = await fetchClaims({ page, startDate, endDate, status, currency });
        res.json({ claims, totals });
    } catch (error) {
        next(error);
    }
}

/**
 * Handles the GET request to fetch a single claim by its ID along with its payment history.
 * @param req 
 * @param res 
 * @param next 
 */
export async function getClaimById(req: Request, res: Response, next: NextFunction) {
    try {
        const claimId = req.params.id ;
        const claimDetails = await fetchClaimById(claimId as string);
        res.json(claimDetails);
    } catch (error) {
        next(error);
    }
}

export async function createClaim(req: Request, res: Response, next: NextFunction) {
    try {
        // Extract claim details from the request body
        const { policyNumber, insuredName, lossDate, dateNotified, lossNature, currency, estimatedLossAmount } = req.body;

        // Validate required fields
        if (!policyNumber || !insuredName || !lossDate || !dateNotified || !lossNature || !currency || !estimatedLossAmount) {
            return res.status(400).json({ error: "Missing required claim details." });
        }

        // Insert the new claim into the database
        const { data, error } = await supabase.from("claims").insert({
            policy_number: policyNumber,
            insured_name: insuredName,
            loss_date: lossDate,
            date_notified: dateNotified,
            loss_nature: lossNature,
            currency: currency,
            estimated_loss_amount: estimatedLossAmount,
        }).select("id");

        if (error) {
            throw new Error(`Error creating claim: ${error.message}`);
        }

        res.status(201).json({ message: "Claim created successfully.", claimId: data[0].id });
    } catch (error) {
        next(error);
    }
}