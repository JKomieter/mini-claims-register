import { Router } from "express";
import { recordPayment } from "../controllers/payments.controller";

const router = Router();

// Record a payment against a claim (handles original currency + exchange rate conversion into claim base currency)
router.post("/", recordPayment)

export default router;