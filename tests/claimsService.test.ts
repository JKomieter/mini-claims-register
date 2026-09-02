import { Request, Response } from 'express';
import {
    getClaimsMetrics,
    getClaims,
    getClaimById,
    createClaim,
    approveClaim,
    getClaimPayments,
    updateClaim,
} from '../src/controllers/claims.controller';
import * as claimsServices from '../src/services/claims.services';
import supabase from '../src/config/supabase';

jest.mock('../src/services/claims.services');
jest.mock('../src/config/supabase', () => ({
    from: jest.fn(),
}));

describe('Claims Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return metrics when getClaimsMetrics succeeds', async () => {
        const req = {} as Request;
        const res = {
            json: jest.fn(),
        } as unknown as Response;
        const mockMetrics = [{ id: 'claims', label: 'Total Claims', value: '5 Registered' }];
        (claimsServices.fetchClaimsMetrics as jest.Mock).mockResolvedValue(mockMetrics);

        await getClaimsMetrics(req, res, jest.fn());

        expect(res.json).toHaveBeenCalledWith(mockMetrics);
    });

    it('should pass error to next when getClaimsMetrics fails', async () => {
        const req = {} as Request;
        const res = {} as Response;
        const next = jest.fn();
        const error = new Error('Database connection failed');
        (claimsServices.fetchClaimsMetrics as jest.Mock).mockRejectedValue(error);

        await getClaimsMetrics(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    it('should parse query parameters and return claims with totals', async () => {
        const req = {
            query: { startDate: '2026-01-01', status: 'open' },
        } as unknown as Request;
        const res = {
            json: jest.fn(),
        } as unknown as Response;
        const mockData = { claims: [], totals: [] };
        (claimsServices.fetchClaims as jest.Mock).mockResolvedValue(mockData);

        await getClaims(req, res, jest.fn());

        expect(claimsServices.fetchClaims).toHaveBeenCalledWith({
            startDate: '2026-01-01',
            endDate: undefined,
            status: 'open',
            currency: undefined,
        });
        expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should fetch single claim by ID in getClaimById', async () => {
        const req = {
            params: { id: 'claim-123' },
        } as unknown as Request;
        const res = {
            json: jest.fn(),
        } as unknown as Response;
        const mockResult = { claim: { id: 'claim-123' }, payments: [] };
        (claimsServices.fetchClaimById as jest.Mock).mockResolvedValue(mockResult);

        await getClaimById(req, res, jest.fn());

        expect(claimsServices.fetchClaimById).toHaveBeenCalledWith('claim-123');
        expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 when creating a claim with missing fields', async () => {
        const req = {
            body: { insuredName: 'Acme Corp' },
        } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;

        await createClaim(req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Missing required claim details.' });
    });

    it('should create claim and return 201 when all required fields are provided', async () => {
        const req = {
            body: {
                insuredName: 'John Doe',
                lossDate: '2026-08-01',
                dateNotified: '2026-08-02',
                lossNature: 'Fire',
                currency: 'USD',
                estimatedLossAmount: 10000,
            },
        } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;

        const mockInsert = jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({ data: [{ id: 'new-claim-123' }], error: null }),
        });
        (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

        await createClaim(req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Claim created successfully.',
            claimId: 'new-claim-123',
        });
    });

    it('should return 400 in approveClaim if approvedAmount is missing', async () => {
        const req = {
            params: { id: 'claim-123' },
            body: {},
        } as unknown as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;

        await approveClaim(req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Missing approved amount.' });
    });

    it('should update approved amount and return claimId on success', async () => {
        const req = {
            params: { id: 'claim-123' },
            body: { approvedAmount: 5000 },
        } as unknown as Request;
        const res = {
            json: jest.fn(),
        } as unknown as Response;

        const mockUpdate = jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue({ data: [{ id: 'claim-123' }], error: null }),
            }),
        });
        (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

        await approveClaim(req, res, jest.fn());

        expect(res.json).toHaveBeenCalledWith({
            message: 'Claim approved successfully.',
            claimId: 'claim-123',
        });
    });

    it('should fetch payments for a claim ID in getClaimPayments', async () => {
        const req = {
            params: { id: 'claim-123' },
        } as unknown as Request;
        const res = {
            json: jest.fn(),
        } as unknown as Response;
        const mockPayments = [{ id: 'pay-1', claim_id: 'claim-123', payment_amount: 100 }];

        const mockSelect = jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: mockPayments, error: null }),
        });
        (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

        await getClaimPayments(req, res, jest.fn());

        expect(res.json).toHaveBeenCalledWith({ payments: mockPayments });
    });

    it('should update claim details and return updated claimId', async () => {
        const req = {
            params: { id: 'claim-123' },
            body: { insuredName: 'Updated Corp', lossNature: 'Water Damage' },
        } as unknown as Request;
        const res = {
            json: jest.fn(),
        } as unknown as Response;

        const mockUpdate = jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue({ data: [{ id: 'claim-123' }], error: null }),
            }),
        });
        (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

        await updateClaim(req, res, jest.fn());

        expect(res.json).toHaveBeenCalledWith({
            message: 'Claim updated successfully.',
            claimId: 'claim-123',
        });
    });
});