const crypto = require('crypto');
const https = require('https');
const http = require('http');
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
    const proofBase64Raw = typeof payload.proof_base64 === 'string' ? payload.proof_base64.trim() : '';
    const proofMimeRaw = typeof payload.proof_mime === 'string' ? payload.proof_mime.trim() : '';

    if (!id_toko) {
        json(res, 400, { error: 'id_toko wajib diisi' });
        return;
    }
    if (!['monthly', 'yearly'].includes(plan)) {
        json(res, 400, { error: 'Plan tidak valid' });
        return;
    }
    if (!transfer_name) {
        json(res, 400, { error: 'Nama pengirim wajib diisi' });
        return;
    }
    if (!transfer_date) {
        json(res, 400, { error: 'Tanggal transfer wajib diisi' });
        return;
    }
    if (!proofBase64Raw) {
        json(res, 400, { error: 'Bukti transfer wajib diunggah' });
        return;
    }

    const amount = plan === 'monthly' ? 65000 : 500000;
    const unique_code = Math.floor(Math.random() * 999) + 1;
    const total_amount = amount + unique_code;

    const billingBankName = process.env.BILLING_BANK_NAME || '';
    const billingBankAccount = process.env.BILLING_BANK_ACCOUNT || '';
    const billingBankHolder = process.env.BILLING_BANK_HOLDER || '';
    const billingEmail = process.env.BILLING_EMAIL || '';
    const bank_target = [billingBankName, billingBankAccount, billingBankHolder].filter(Boolean).join(' | ');

    const base = supabaseUrl.replace(/\/$/, '');
    const bucket = 'payment-proofs';

    const parseDataUrl = (raw) => {
        const m = raw.match(/^data:([^;]+);base64,(.+)$/);
        if (!m) return { mime: '', base64: raw };
        return { mime: m[1], base64: m[2] };
    };

    const uploadBinary = ({ method, url, headers, body }) => new Promise((resolve) => {
        try {
            const u = new URL(url);
            const lib = u.protocol === 'http:' ? http : https;
            const req2 = lib.request({
                method,
                hostname: u.hostname,
                port: u.port || (u.protocol === 'http:' ? 80 : 443),
                path: u.pathname + (u.search || ''),
                headers
            }, (r) => {
                let data = '';
                r.on('data', (chunk) => { data += chunk; });
                r.on('end', () => {
                    resolve({ status: r.statusCode || 0, ok: (r.statusCode || 0) >= 200 && (r.statusCode || 0) < 300, raw: data });
                });
            });
            req2.on('error', (e) => resolve({ status: 0, ok: false, raw: String(e && e.message ? e.message : e) }));
            req2.write(body);
            req2.end();
        } catch (e) {
            resolve({ status: 0, ok: false, raw: String(e && e.message ? e.message : e) });
        }
    });

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

    const parsedProof = parseDataUrl(proofBase64Raw);
    const proofMime = proofMimeRaw || parsedProof.mime || 'application/octet-stream';
    let proofBytes = null;
    try {
        proofBytes = Buffer.from(parsedProof.base64, 'base64');
    } catch (_) {
        proofBytes = null;
    }
    if (!proofBytes || !proofBytes.length) {
        json(res, 400, { error: 'Bukti transfer tidak valid' });
        return;
    }
    if (proofBytes.length > 2_500_000) {
        json(res, 400, { error: 'Ukuran bukti transfer terlalu besar (maks 2.5MB)' });
        return;
    }

    const ext = (() => {
        const m = proofMime.toLowerCase();
        if (m.includes('png')) return 'png';
        if (m.includes('jpeg') || m.includes('jpg')) return 'jpg';
        if (m.includes('webp')) return 'webp';
        if (m.includes('pdf')) return 'pdf';
        return 'bin';
    })();

    const filename = `REQ-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
    const objectUrl = `${base}/storage/v1/object/${bucket}/${encodeURIComponent(id_toko)}/${encodeURIComponent(filename)}`;
    const uploadRes = await uploadBinary({
        method: 'POST',
        url: objectUrl,
        headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': proofMime,
            'x-upsert': 'true'
        },
        body: proofBytes
    });
    if (!uploadRes.ok) {
        json(res, 500, { error: 'Gagal upload bukti transfer', detail: uploadRes.raw });
        return;
    }

    const proof_url = `${base}/storage/v1/object/public/${bucket}/${encodeURIComponent(id_toko)}/${encodeURIComponent(filename)}`;

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
            transfer_name,
            transfer_date,
            proof_url,
            proof_mime: proofMime,
            proof_uploaded_at: new Date().toISOString()
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
