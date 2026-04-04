module.exports = (req, res) => {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const defaultToko = process.env.DEFAULT_TOKO;
    const billingEmail = process.env.BILLING_EMAIL;
    const billingBankName = process.env.BILLING_BANK_NAME;
    const billingBankAccount = process.env.BILLING_BANK_ACCOUNT;
    const billingBankHolder = process.env.BILLING_BANK_HOLDER;

    if (!url || !anonKey) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.end(JSON.stringify({ error: 'Missing SUPABASE_URL or SUPABASE_ANON_KEY' }));
        return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify({
        SUPABASE_URL: url,
        SUPABASE_ANON_KEY: anonKey,
        DEFAULT_TOKO: defaultToko || "00000000-0000-0000-0000-000000000001",
        BILLING_EMAIL: billingEmail || '',
        BILLING_BANK_NAME: billingBankName || '',
        BILLING_BANK_ACCOUNT: billingBankAccount || '',
        BILLING_BANK_HOLDER: billingBankHolder || ''
    }));
};
