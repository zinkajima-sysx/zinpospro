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
    const q = String(u.searchParams.get('q') || '').trim().toLowerCase();
    const status = String(u.searchParams.get('status') || 'all').trim().toLowerCase();
    const includeDeleted = String(u.searchParams.get('includeDeleted') || '') === '1';

    const select = 'id_toko,nama_toko,alamat,no_tlp,email,owner,status,created_at,deleted_at,suspend_reason,suspended_at';
    const params = new URLSearchParams();
    params.set('select', select);
    params.set('order', 'created_at.desc');
    if (!includeDeleted) params.set('deleted_at', 'is.null');
    if (status && status !== 'all') params.set('status', `eq.${status}`);

    const url = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/settings?${params.toString()}`;
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
        json(res, 500, { error: 'Failed to fetch stores', detail: r.json || r.raw });
        return;
    }

    let rows = Array.isArray(r.json) ? r.json : [];
    if (q) {
        rows = rows.filter(x => {
            const a = String(x.nama_toko || '').toLowerCase();
            const b = String(x.owner || '').toLowerCase();
            const c = String(x.email || '').toLowerCase();
            const d = String(x.id_toko || '').toLowerCase();
            return a.includes(q) || b.includes(q) || c.includes(q) || d.includes(q);
        });
    }

    json(res, 200, { data: rows });
};
