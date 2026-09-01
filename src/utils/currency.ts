export const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
};