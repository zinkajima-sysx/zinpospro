const crypto = require('crypto');
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
    const u = new URL(req.url, 'http://localhost');
    const id_toko = String(u.searchParams.get('id_toko') || '').trim();
    if (!id_toko) {
        json(res, 400, { error: 'id_toko wajib diisi' });
        return;
    }

    const headers = {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
    };

    const getAdminUser = async () => {
        const entRes = await requestJson({
            method: 'GET',
            url: `${base}/rest/v1/entitas?select=id_entitas&id_toko=eq.${encodeURIComponent(id_toko)}&entitas=eq.Admin&limit=1`,
            headers
        });
        const ent = Array.isArray(entRes.json) ? entRes.json[0] : null;
        const entitasId = ent?.id_entitas || null;

        if (entitasId) {
            const userRes = await requestJson({
                method: 'GET',
                url: `${base}/rest/v1/users?select=id_user,username,nama_user,entitas_id&id_toko=eq.${encodeURIComponent(id_toko)}&entitas_id=eq.${encodeURIComponent(entitasId)}&limit=1`,
                headers
            });
            const user = Array.isArray(userRes.json) ? userRes.json[0] : null;
            if (user) return user;
        }

        const fallbackRes = await requestJson({
            method: 'GET',
            url: `${base}/rest/v1/users?select=id_user,username,nama_user,entitas_id&id_toko=eq.${encodeURIComponent(id_toko)}&order=id_user.asc&limit=1`,
            headers
        });
        return Array.isArray(fallbackRes.json) ? fallbackRes.json[0] : null;
    };

    const adminUser = await getAdminUser();
    if (!adminUser) {
        json(res, 404, { error: 'User admin tidak ditemukan' });
        return;
    }

    if (req.method === 'GET') {
        json(res, 200, { data: { id_user: adminUser.id_user, username: adminUser.username, nama_user: adminUser.nama_user } });
        return;
    }

    if (req.method !== 'POST') {
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
    const reason = typeof payload.reason === 'string' ? payload.reason.trim() : '';

    const tempPassword = crypto.randomBytes(8).toString('base64url');
    const passwordHash = crypto.createHash('sha256').update(tempPassword).digest('hex');

    const patchRes = await requestJson({
        method: 'PATCH',
        url: `${base}/rest/v1/users?id_user=eq.${encodeURIComponent(adminUser.id_user)}&id_toko=eq.${encodeURIComponent(id_toko)}`,
        headers: { ...headers, Prefer: 'return=minimal' },
        body: JSON.stringify({ password_hash: passwordHash })
    });
    if (!patchRes.ok) {
        json(res, 500, { error: 'Gagal reset password', detail: patchRes.json || patchRes.raw });
        return;
    }

    try {
        await requestJson({
            method: 'POST',
            url: `${base}/rest/v1/admin_audit_logs`,
            headers: { ...headers, Prefer: 'return=minimal' },
            body: JSON.stringify({
                id_toko,
                action: 'password_reset',
                from_status: null,
                to_status: null,
                reason: reason || null,
                performed_by: claims.username || null
            })
        });
    } catch (_) {}

    json(res, 200, {
        data: {
            id_user: adminUser.id_user,
            username: adminUser.username,
            temp_password: tempPassword
        }
    });
};

