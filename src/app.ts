import express from 'express';
import { errorHandler } from './middlewares/errorHandler';
import claimsRoutes from './routes/claims.routes';
import paymentsRoutes from './routes/payments.routes';

const app = express();

app.use(express.json());

// Routes
app.use("/claims", claimsRoutes);
app.use("/payments", paymentsRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found." });
});

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;