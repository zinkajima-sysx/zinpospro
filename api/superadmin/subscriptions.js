const { verifyToken, getBearer, requestJson, json } = require('./_util');

module.exports = async (req, res) => {
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

    if (req.method === 'GET') {
        const u = new URL(req.url, 'http://localhost');
        const status = String(u.searchParams.get('status') || 'submitted').trim().toLowerCase();
        const limit = Math.min(200, Math.max(1, parseInt(u.searchParams.get('limit') || '50', 10)));
        const params = new URLSearchParams();
        params.set('select', 'id,id_toko,toko_name,owner,email,plan,amount,unique_code,total_amount,bank_target,status,transfer_name,transfer_date,proof_url,proof_mime,admin_note,created_at,updated_at');
        params.set('order', 'created_at.desc');
        params.set('limit', String(limit));
        if (status && status !== 'all') params.set('status', `eq.${status}`);

        const r = await requestJson({
            method: 'GET',
            url: `${base}/rest/v1/subscription_requests?${params.toString()}`,
            headers: {
                apikey: serviceKey,
                Authorization: `Bearer ${serviceKey}`,
                'Content-Type': 'application/json'
            }
        });
        if (!r.ok) {
            json(res, 500, { error: 'Failed to fetch subscription requests', detail: r.json || r.raw });
            return;
        }
        json(res, 200, { data: Array.isArray(r.json) ? r.json : [] });
        return;
    }

    if (req.method === 'PATCH') {
        let body = '';
        await new Promise((resolve) => {
            req.on('data', chunk => { body += chunk; });
            req.on('end', resolve);
        });
        let payload = {};
        try { payload = JSON.parse(body || '{}'); } catch (_) { payload = {}; }

        const id = String(payload.id || '').trim();
        const action = String(payload.action || '').trim().toLowerCase();
        const admin_note = typeof payload.admin_note === 'string' ? payload.admin_note.trim() : '';

        if (!id) {
            json(res, 400, { error: 'id wajib diisi' });
            return;
        }
        if (!['approve', 'reject'].includes(action)) {
            json(res, 400, { error: 'action tidak valid' });
            return;
        }

        const getRes = await requestJson({
            method: 'GET',
            url: `${base}/rest/v1/subscription_requests?select=*&id=eq.${encodeURIComponent(id)}&limit=1`,
            headers: {
                apikey: serviceKey,
                Authorization: `Bearer ${serviceKey}`,
                'Content-Type': 'application/json'
            }
        });
        const reqRow = Array.isArray(getRes.json) ? getRes.json[0] : null;
        if (!reqRow) {
            json(res, 404, { error: 'Request tidak ditemukan' });
            return;
        }

        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        const patchRes = await requestJson({
            method: 'PATCH',
            url: `${base}/rest/v1/subscription_requests?id=eq.${encodeURIComponent(id)}`,
            headers: {
                apikey: serviceKey,
                Authorization: `Bearer ${serviceKey}`,
                'Content-Type': 'application/json',
                Prefer: 'return=representation'
            },
            body: JSON.stringify({
                status: newStatus,
                admin_note: admin_note || null,
                updated_at: new Date().toISOString()
            })
        });
        if (!patchRes.ok) {
            json(res, 500, { error: 'Failed to update request', detail: patchRes.json || patchRes.raw });
            return;
        }

        if (action === 'approve') {
            const now = new Date();
            const paidUntil = new Date(now.getTime() + (reqRow.plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString();
            await requestJson({
                method: 'PATCH',
                url: `${base}/rest/v1/settings?id_toko=eq.${encodeURIComponent(reqRow.id_toko)}`,
                headers: {
                    apikey: serviceKey,
                    Authorization: `Bearer ${serviceKey}`,
                    'Content-Type': 'application/json',
                    Prefer: 'return=minimal'
                },
                body: JSON.stringify({
                    subscription_status: 'active',
                    paid_until: paidUntil,
                    plan: reqRow.plan
                })
            });
        }

        await requestJson({
            method: 'POST',
            url: `${base}/rest/v1/admin_audit_logs`,
            headers: {
                apikey: serviceKey,
                Authorization: `Bearer ${serviceKey}`,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal'
            },
            body: JSON.stringify({
                id_toko: reqRow.id_toko,
                action: action === 'approve' ? 'subscription_approve' : 'subscription_reject',
                from_status: reqRow.status,
                to_status: newStatus,
                reason: admin_note || null,
                performed_by: claims.username || null
            })
        });

        const updated = Array.isArray(patchRes.json) ? patchRes.json[0] : patchRes.json;
        json(res, 200, { data: updated });
        return;
    }

    json(res, 405, { error: 'Method not allowed' });
};
