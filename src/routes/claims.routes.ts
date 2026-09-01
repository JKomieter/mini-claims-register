import { Router } from "express";
import { getClaims } from "../controllers/claims.controller";

const router = Router();

// List all claims with filtering (`startDate`, `endDate`, `status`, `currency`) & totals footer summary
router.get("/", getClaims)

// Fetch a single claim, its full payment history, and calculated status/balance
router.get("/:id");

// Register a new claim (`policyNumber`, `insuredName`, `lossDate`, `dateNotified`, `lossNature`, `currency`, `estimatedLossAmount`)
router.post("/")

// Set or update the `approved_amount` for a claim (moves status out of "Reserved")
router.patch(":id/approve")

// Get all payments recorded for a specific claim |
router.get("/:id/payments")

export default router;