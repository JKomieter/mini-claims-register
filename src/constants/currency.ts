/**
 * Default currency exchange rates for the application.
 * These rates are used to convert between different currencies.
 */
export const DEFAULT_RATES: Record<string, Record<string, number>> = {
    GHS: { USD: 0.065, EUR: 0.060, GBP: 0.051 },
    USD: { GHS: 15.50, EUR: 0.92, GBP: 0.79 },
    EUR: { USD: 1.09, GHS: 16.80, GBP: 0.86 },
    GBP: { USD: 1.27, GHS: 19.50, EUR: 1.16 },
};

