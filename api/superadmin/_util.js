const crypto = require('crypto');
const https = require('https');
const http = require('http');

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
    if (!secret) return null;
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

function requestJson({ method, url, headers = {}, body = null, timeoutMs = 15000 }) {
    return new Promise((resolve) => {
        const u = new URL(url);
        const lib = u.protocol === 'http:' ? http : https;

        const opts = {
            method,
            hostname: u.hostname,
            port: u.port || (u.protocol === 'http:' ? 80 : 443),
            path: u.pathname + (u.search || ''),
            headers
        };

        const req = lib.request(opts, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                let json = null;
                try { json = data ? JSON.parse(data) : null; } catch (_) { json = null; }
                const status = res.statusCode || 0;
                resolve({ status, ok: status >= 200 && status < 300, json, raw: data });
            });
        });

        req.on('error', (e) => {
            resolve({ status: 0, ok: false, json: null, raw: String(e && e.message ? e.message : e) });
        });

        req.setTimeout(timeoutMs, () => {
            req.destroy(new Error('timeout'));
        });

        if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
        req.end();
    });
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
    requestJson,
    json
};
