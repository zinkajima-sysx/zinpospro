const crypto = require('crypto');

function base64url(input) {
    return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function signToken(payload, secret, expSeconds = 60 * 60 * 12) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const body = { ...payload, iat: now, exp: now + expSeconds };
    const encodedHeader = base64url(JSON.stringify(header));
    const encodedBody = base64url(JSON.stringify(body));
    const data = `${encodedHeader}.${encodedBody}`;
    const sig = crypto.createHmac('sha256', secret).update(data).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    return `${data}.${sig}`;
}

function verifyToken(token, secret) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [h, p, s] = parts;
    const data = `${h}.${p}`;
    const expected = crypto.createHmac('sha256', secret).update(data).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const a = Buffer.from(expected);
    const b = Buffer.from(s);
    if (a.length !== b.length) return null;
    if (!crypto.timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    if (!payload || typeof payload !== 'object') return null;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) return null;
    return payload;
}

function getBearer(req) {
    const auth = req.headers && (req.headers.authorization || req.headers.Authorization);
    if (!auth) return null;
    const m = String(auth).match(/^Bearer\s+(.+)$/i);
    return m ? m[1] : null;
}

function json(res, statusCode, body) {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(body));
}

module.exports = {
    signToken,
    verifyToken,
    getBearer,
    json
};
