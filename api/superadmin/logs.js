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

    const u = new URL(req.url, 'http://localhost');
    const id_toko = String(u.searchParams.get('id_toko') || '').trim();
    if (!id_toko) {
        json(res, 400, { error: 'id_toko wajib diisi' });
        return;
    }
    const limit = Math.min(100, Math.max(1, parseInt(u.searchParams.get('limit') || '30', 10)));

    const base = supabaseUrl.replace(/\/$/, '');
    const params = new URLSearchParams();
    params.set('select', 'id,id_toko,action,from_status,to_status,reason,performed_by,created_at');
    params.set('id_toko', `eq.${id_toko}`);
    params.set('order', 'created_at.desc');
    params.set('limit', String(limit));

    const url = `${base}/rest/v1/admin_audit_logs?${params.toString()}`;
    const r = await requestJson({
        method: 'GET',
        url,
        headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json'
        }
    });

    if (!r.ok) {
        json(res, 500, { error: 'Failed to fetch logs', detail: r.json || r.raw });
        return;
    }

    json(res, 200, { data: Array.isArray(r.json) ? r.json : [] });
};
