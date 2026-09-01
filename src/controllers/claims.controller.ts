import { Request, Response, NextFunction } from 'express';
import { fetchClaims } from '../services/claims.services';

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