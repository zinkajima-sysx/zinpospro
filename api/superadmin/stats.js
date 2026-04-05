const { verifyToken, getBearer, requestJson, json } = require('./_util');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        json(res, 405, { error: 'Method not allowed' });
        return;
    }

    const token = getBearer(req);
    const secret = process.env.SUPERADMIN_JWT_SECRET;
    const claims = verifyToken(token, secret);
    if (!claims || claims.role !== 'superadmin') {
        json(res, 401, { error: 'Unauthorized' });
        return;
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
        json(res, 500, { error: 'Supabase server env not configured' });
        return;
    }

    const base = supabaseUrl.replace(/\/$/, '');
    const headers = {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
    };

    const now = Date.now();
    const isPaidActive = (store) => {
        const ss = String(store.subscription_status || '').toLowerCase();
        if (ss !== 'active') return false;
        if (!store.paid_until) return true;
        const t = new Date(store.paid_until).getTime();
        if (Number.isNaN(t)) return false;
        return t > now;
    };

    const safeGet = async (url, fallbackUrl = null) => {
        const r = await requestJson({ method: 'GET', url, headers });
        if (r.ok) return r.json;
        const detail = r.json || r.raw || '';
        const msg = typeof detail === 'string' ? detail : JSON.stringify(detail);
        if (fallbackUrl && msg.toLowerCase().includes('column')) {
            const r2 = await requestJson({ method: 'GET', url: fallbackUrl, headers });
            if (r2.ok) return r2.json;
        }
        return [];
    };

    const stores = await safeGet(
        `${base}/rest/v1/settings?select=id_toko,created_at,deleted_at,status,subscription_status,paid_until,plan`,
        `${base}/rest/v1/settings?select=id_toko,created_at,status`
    );
    const storeRows = Array.isArray(stores) ? stores : [];
    const activeStores = storeRows.filter(s => !s.deleted_at);

    const payments = await safeGet(
        `${base}/rest/v1/subscription_requests?select=id,id_toko,plan,status,total_amount,proof_url,created_at`,
        `${base}/rest/v1/subscription_requests?select=id,id_toko,plan,status,total_amount,created_at`
    );
    const payRows = Array.isArray(payments) ? payments : [];

    const storeRegistered = activeStores.length;
    const storeApproved = activeStores.filter(isPaidActive).length;
    const storePendingPayment = activeStores.filter(s => String(s.subscription_status || '').toLowerCase() === 'pending_payment').length;

    const paySubmitted = payRows.filter(p => String(p.status || '').toLowerCase() === 'submitted').length;
    const payWithProof = payRows.filter(p => !!p.proof_url).length;
    const revenue = payRows
        .filter(p => String(p.status || '').toLowerCase() === 'approved')
        .reduce((sum, p) => sum + (parseInt(p.total_amount || 0, 10) || 0), 0);

    const activeMonthly = activeStores.filter(s => isPaidActive(s) && String(s.plan || '').toLowerCase() === 'monthly').length;
    const activeYearly = activeStores.filter(s => isPaidActive(s) && String(s.plan || '').toLowerCase() === 'yearly').length;

    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    start.setMonth(start.getMonth() - 5);

    const approvedForChart = payRows
        .filter(p => String(p.status || '').toLowerCase() === 'approved')
        .filter(p => {
            const t = new Date(p.created_at).getTime();
            return !Number.isNaN(t) && t >= start.getTime();
        });

    const monthKey = (d) => {
        const dt = new Date(d);
        if (Number.isNaN(dt.getTime())) return null;
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}`;
    };

    const labels = [];
    const monthCursor = new Date(start.getTime());
    for (let i = 0; i < 6; i++) {
        labels.push(monthKey(monthCursor));
        monthCursor.setMonth(monthCursor.getMonth() + 1);
    }

    const series = {
        monthly: labels.map(() => 0),
        yearly: labels.map(() => 0)
    };

    for (const p of approvedForChart) {
        const k = monthKey(p.created_at);
        const idx = labels.indexOf(k);
        if (idx < 0) continue;
        const plan = String(p.plan || '').toLowerCase();
        if (plan === 'monthly') series.monthly[idx] += 1;
        if (plan === 'yearly') series.yearly[idx] += 1;
    }

    json(res, 200, {
        data: {
            cards: {
                store_registered: storeRegistered,
                store_approved: storeApproved,
                store_pending_payment: storePendingPayment,
                pay_submitted: paySubmitted,
                pay_with_proof: payWithProof,
                active_monthly: activeMonthly,
                active_yearly: activeYearly,
                revenue_total: revenue
            },
            chart: {
                labels,
                monthly: series.monthly,
                yearly: series.yearly
            }
        }
    });
};

