const { requestJson, json } = require('../superadmin/_util');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        json(res, 405, { error: 'Method not allowed' });
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

    const base = supabaseUrl.replace(/\/$/, '');

    const tokoRes = await requestJson({
        method: 'GET',
        url: `${base}/rest/v1/settings?select=id_toko,nama_toko,subscription_status,paid_until,plan,status&id_toko=eq.${encodeURIComponent(id_toko)}`,
        headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json'
        }
    });
    if (!tokoRes.ok) {
        json(res, 500, { error: 'Failed to fetch store', detail: tokoRes.json || tokoRes.raw });
        return;
    }
    const toko = Array.isArray(tokoRes.json) ? tokoRes.json[0] : null;
    if (!toko) {
        json(res, 404, { error: 'Toko tidak ditemukan' });
        return;
    }

    const reqRes = await requestJson({
        method: 'GET',
        url: `${base}/rest/v1/subscription_requests?select=id,plan,amount,unique_code,total_amount,status,transfer_name,transfer_date,proof_url,admin_note,created_at,updated_at&id_toko=eq.${encodeURIComponent(id_toko)}&order=created_at.desc&limit=1`,
        headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json'
        }
    });
    const lastReq = Array.isArray(reqRes.json) ? reqRes.json[0] : null;

    json(res, 200, { data: { toko, last_request: lastReq || null } });
};
