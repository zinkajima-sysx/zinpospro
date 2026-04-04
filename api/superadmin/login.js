const crypto = require('crypto');
const { signToken, json } = require('./_util');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        json(res, 405, { error: 'Method not allowed' });
        return;
    }

    const secret = process.env.SUPERADMIN_JWT_SECRET;
    const adminUser = process.env.SUPERADMIN_USERNAME;
    const adminPassHash = process.env.SUPERADMIN_PASSWORD_HASH;
    if (!secret || !adminUser || !adminPassHash) {
        json(res, 500, { error: 'Superadmin env not configured' });
        return;
    }

    let body = '';
    await new Promise((resolve) => {
        req.on('data', chunk => { body += chunk; });
        req.on('end', resolve);
    });

    let payload = {};
    try { payload = JSON.parse(body || '{}'); } catch (_) { payload = {}; }
    const username = String(payload.username || '').trim();
    const password = String(payload.password || '');
    const hash = crypto.createHash('sha256').update(password).digest('hex');

    const ok = username === adminUser && hash === adminPassHash;
    if (!ok) {
        json(res, 401, { error: 'Username atau password salah' });
        return;
    }

    const token = signToken({ role: 'superadmin', username }, secret, 60 * 60 * 12);
    json(res, 200, { token });
};
