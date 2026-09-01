import { Router } from "express";
import { approveClaim, createClaim, getClaimById, getClaimPayments, getClaims, getClaimsMetrics } from "../controllers/claims.controller";

const router = Router();

// Metrics summary: count + totals, without full claim rows
router.get("/metrics", getClaimsMetrics)

// List all claims with filtering (`startDate`, `endDate`, `status`, `currency`) & totals footer summary
router.get("/", getClaims)

// Fetch a single claim, its full payment history, and calculated status/balance
router.get("/:id", getClaimById);

// Register a new claim (`policyNumber`, `insuredName`, `lossDate`, `dateNotified`, `lossNature`, `currency`, `estimatedLossAmount`)
router.post("/", createClaim)

// Set or update the `approved_amount` for a claim (moves status out of "Reserved")
router.patch("/:id/approve", approveClaim)

// Get all payments recorded for a specific claim |
router.get("/:id/payments", getClaimPayments)

export default router;