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

    if (req.method !== 'PATCH' && req.method !== 'DELETE') {
        json(res, 405, { error: 'Method not allowed' });
        return;
    }

    let body = '';
    await new Promise((resolve) => {
        req.on('data', chunk => { body += chunk; });
        req.on('end', resolve);
    });
    let payload = {};
    try { payload = JSON.parse(body || '{}'); } catch (_) { payload = {}; }

    const id_toko = String(payload.id_toko || '').trim();
    if (!id_toko) {
        json(res, 400, { error: 'id_toko wajib diisi' });
        return;
    }

    const base = supabaseUrl.replace(/\/$/, '');
    const settingsUrl = `${base}/rest/v1/settings?id_toko=eq.${encodeURIComponent(id_toko)}`;

    const beforeRes = await requestJson({
        method: 'GET',
        url: `${settingsUrl}&select=id_toko,status`,
        headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json'
        }
    });
    const beforeRow = Array.isArray(beforeRes.json) ? beforeRes.json[0] : null;
    const fromStatus = beforeRow && beforeRow.status ? String(beforeRow.status) : null;

    let patch = {};
    let toStatus = null;
    let reason = null;
    if (req.method === 'PATCH') {
        const status = String(payload.status || '').trim().toLowerCase();
        if (!['active', 'suspended', 'deleted'].includes(status)) {
            json(res, 400, { error: 'Status tidak valid' });
            return;
        }
        toStatus = status;
        patch.status = status;
        patch.suspended_at = status === 'suspended' ? new Date().toISOString() : null;
        patch.deleted_at = status === 'deleted' ? new Date().toISOString() : null;
        if (status === 'active') {
            patch.suspended_at = null;
            patch.deleted_at = null;
        }
        reason = typeof payload.reason === 'string' ? payload.reason.trim() : '';
        patch.suspend_reason = status === 'suspended' ? (reason || null) : null;
    } else {
        toStatus = 'deleted';
        reason = typeof payload.reason === 'string' ? payload.reason.trim() : '';
        patch = { status: 'deleted', deleted_at: new Date().toISOString(), suspend_reason: null };
    }

    const r = await requestJson({
        method: 'PATCH',
        url: settingsUrl,
        headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
        },
        body: JSON.stringify(patch)
    });

    if (!r.ok) {
        json(res, 500, { error: 'Failed to update store', detail: r.json || r.raw });
        return;
    }

    const data = r.json;
    const row = Array.isArray(data) ? data[0] : data;

    try {
        const logUrl = `${base}/rest/v1/admin_audit_logs`;
        await requestJson({
            method: 'POST',
            url: logUrl,
            headers: {
                apikey: serviceKey,
                Authorization: `Bearer ${serviceKey}`,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal'
            },
            body: JSON.stringify({
                id_toko,
                action: req.method === 'DELETE' ? 'delete' : 'status_change',
                from_status: fromStatus,
                to_status: toStatus,
                reason: reason || null,
                performed_by: claims.username || null
            })
        });
    } catch (_) {}

    json(res, 200, { data: row });
};
