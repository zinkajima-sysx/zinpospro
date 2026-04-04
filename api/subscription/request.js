const { requestJson, json } = require('../superadmin/_util');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        json(res, 405, { error: 'Method not allowed' });
        return;
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
        json(res, 500, { error: 'Supabase server env not configured' });
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
    const plan = String(payload.plan || '').trim().toLowerCase();
    const transfer_name = typeof payload.transfer_name === 'string' ? payload.transfer_name.trim() : '';
    const transfer_date = typeof payload.transfer_date === 'string' ? payload.transfer_date.trim() : '';

    if (!id_toko) {
        json(res, 400, { error: 'id_toko wajib diisi' });
        return;
    }
    if (!['monthly', 'yearly'].includes(plan)) {
        json(res, 400, { error: 'Plan tidak valid' });
        return;
    }

    const amount = plan === 'monthly' ? 100000 : 700000;
    const unique_code = Math.floor(Math.random() * 999) + 1;
    const total_amount = amount + unique_code;

    const billingBankName = process.env.BILLING_BANK_NAME || '';
    const billingBankAccount = process.env.BILLING_BANK_ACCOUNT || '';
    const billingBankHolder = process.env.BILLING_BANK_HOLDER || '';
    const billingEmail = process.env.BILLING_EMAIL || '';
    const bank_target = [billingBankName, billingBankAccount, billingBankHolder].filter(Boolean).join(' | ');

    const base = supabaseUrl.replace(/\/$/, '');

    const tokoRes = await requestJson({
        method: 'GET',
        url: `${base}/rest/v1/settings?select=id_toko,nama_toko,owner,email&id_toko=eq.${encodeURIComponent(id_toko)}`,
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

    const insertRes = await requestJson({
        method: 'POST',
        url: `${base}/rest/v1/subscription_requests`,
        headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
        },
        body: JSON.stringify({
            id_toko,
            toko_name: toko.nama_toko || null,
            owner: toko.owner || null,
            email: toko.email || null,
            plan,
            amount,
            unique_code,
            total_amount,
            bank_target: bank_target || null,
            status: 'submitted',
            transfer_name: transfer_name || null,
            transfer_date: transfer_date || null
        })
    });
    if (!insertRes.ok) {
        json(res, 500, { error: 'Failed to create request', detail: insertRes.json || insertRes.raw });
        return;
    }
    const requestRow = Array.isArray(insertRes.json) ? insertRes.json[0] : insertRes.json;

    await requestJson({
        method: 'PATCH',
        url: `${base}/rest/v1/settings?id_toko=eq.${encodeURIComponent(id_toko)}`,
        headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal'
        },
        body: JSON.stringify({ subscription_status: 'pending_payment', plan })
    });

    const subject = `ZINPOS | PAYMENT | ${id_toko} | ${plan.toUpperCase()} | REQ-${requestRow.id}`;
    const bodyText = [
        `Halo Admin ZinPOS,`,
        ``,
        `Saya sudah melakukan transfer untuk aktivasi langganan.`,
        ``,
        `Request ID: REQ-${requestRow.id}`,
        `ID Toko: ${id_toko}`,
        `Nama Toko: ${toko.nama_toko || '-'}`,
        `Paket: ${plan === 'monthly' ? '1 Bulan' : '1 Tahun'}`,
        `Nominal: Rp ${total_amount.toLocaleString('id-ID')}`,
        `Nama Pengirim: ${transfer_name || '-'}`,
        `Tanggal Transfer: ${transfer_date || '-'}`,
        ``,
        `Bukti transfer terlampir.`,
        ``,
        `Terima kasih`
    ].join('\n');

    const mailto = billingEmail
        ? `mailto:${encodeURIComponent(billingEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`
        : '';

    json(res, 200, {
        data: {
            ...requestRow,
            total_amount,
            mailto,
            billing: {
                email: billingEmail,
                bank_name: billingBankName,
                bank_account: billingBankAccount,
                bank_holder: billingBankHolder
            }
        }
    });
};
