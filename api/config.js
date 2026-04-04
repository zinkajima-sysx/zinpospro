module.exports = (req, res) => {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const defaultToko = process.env.DEFAULT_TOKO;

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
        DEFAULT_TOKO: defaultToko || "00000000-0000-0000-0000-000000000001"
    }));
};
