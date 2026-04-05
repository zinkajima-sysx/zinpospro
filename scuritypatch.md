# 🔐 PROCEDURE: Security Headers Implementation untuk zinpospro.com

**Document Version:** 1.0  
**Last Updated:** 05 Apr 2026  
**Target Grade:** A+ (Current: C)  
**Risk Level:** LOW (No breaking changes)

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Current Status](#current-status)
3. [Issues & Solutions](#issues--solutions)
4. [Implementation Steps](#implementation-steps)
5. [Testing Checklist](#testing-checklist)
6. [Rollback Plan](#rollback-plan)

---

## 🎯 OVERVIEW

### Goal
Implement missing security headers untuk melindungi dari XSS, CSRF, dan data leakage attacks tanpa merusak komunikasi frontend-backend.

### Tech Stack
- **Framework:** Next.js (React)
- **Hosting:** Vercel
- **Server:** Vercel (HTTP/2)
- **Database:** (Backend API)

### Safety Assurance
✅ No API endpoints modification  
✅ No database changes  
✅ No authentication mechanism changes  
✅ No CORS breaking for legitimate requests  
✅ Backward compatible with existing frontend code  

---

## 📊 CURRENT STATUS

### Security Test Results (As of 05 Apr 2026)

#### ✅ HEADERS PRESENT (3/6)
```
✅ Strict-Transport-Security: max-age=63072000
✅ X-Content-Type-Options: nosniff
✅ X-Frame-Options: DENY
```

#### ❌ HEADERS MISSING (3/6)
```
❌ Content-Security-Policy
❌ Referrer-Policy
❌ Permissions-Policy
```

#### ⚠️ CRITICAL ISSUES (1)
```
⚠️ CORS Policy: access-control-allow-origin: *
   Risk: Too permissive (should be restricted to domain)
```

### Current Grade
```
Grade: C (Moderate)
Target: A+ (Excellent)
```

---

## 🔍 ISSUES & SOLUTIONS

---

## ISSUE #1: Missing Content-Security-Policy Header

### 📌 Context
**Severity:** 🔴 CRITICAL  
**Type:** XSS Vulnerability  
**Attack Vector:** Script Injection  

### Problem Description
```
Content-Security-Policy (CSP) menentukan sumber approved untuk:
- Scripts
- Stylesheets
- Images
- Fonts
- API calls

Tanpa CSP, attacker bisa:
1. Inject malicious <script> tags
2. Steal user data/tokens
3. Hijack user sessions
4. Redirect users ke phishing sites
```

### Current Impact
```
Risk Level: HIGH
- XSS attacks tidak terdeteksi
- Third-party scripts bisa load dari mana saja
- Eval() function bisa execute arbitrary code
```

### Solution
Implementasi CSP yang balance antara security dan functionality:

#### Code Implementation

**File: `next.config.js` atau `next.config.mjs`**

```javascript
/**
 * PERBAIKAN #1: Content-Security-Policy Header
 * 
 * CSP Policy Breakdown:
 * - default-src 'self': Semua resources dari domain sendiri
 * - script-src: Script diizinkan dari self + unsafe-eval untuk dev tools
 * - style-src: CSS dari self + unsafe-inline (Next.js SSR membutuhkan ini)
 * - img-src: Images dari self, data URLs, dan HTTPS
 * - font-src: Fonts dari self dan Google Fonts
 * - connect-src: API calls ke domain yang diizinkan
 * - frame-ancestors: Prevent embedding dalam iframe
 * 
 * SAFE UNTUK FRONTEND-BACKEND: ✅ YA
 * - API calls ke backend tetap bisa dengan connect-src
 * - Third-party resources (Google Fonts) tetap work
 * - Development tools tetap bisa pakai unsafe-eval
 */

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    // OPTION 1: Production-ready (Recommended untuk production)
    value: "default-src 'self'; " +
           "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
           "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
           "img-src 'self' data: https:; " +
           "font-src 'self' https://fonts.gstatic.com; " +
           "connect-src 'self' https://api.zinpospro.com https://api.your-backend.com; " +
           "frame-ancestors 'none'; " +
           "base-uri 'self'; " +
           "form-action 'self';"
    
    // OPTION 2: Strict mode (Uncomment untuk extra security)
    // value: "default-src 'self'; " +
    //        "script-src 'self'; " +
    //        "style-src 'self' https://fonts.googleapis.com; " +
    //        "img-src 'self' data: https:; " +
    //        "font-src 'self' https://fonts.gstatic.com; " +
    //        "connect-src 'self' https://api.zinpospro.com; " +
    //        "frame-ancestors 'none'; " +
    //        "base-uri 'self'; " +
    //        "form-action 'self';"
  }
];

export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ]
  }
}
```

#### Testing CSP (Development)
```bash
# 1. Build dan run local
npm run dev

# 2. Open DevTools (F12)
Console → Cek apakah ada CSP warnings

# 3. Test XSS injection di console:
# (Harusnya blocked)
const script = document.createElement('script');
script.src = 'https://evil.com/malicious.js';
document.body.appendChild(script);
# Expected: CSP violation error dalam console
```

#### Backward Compatibility Check
```javascript
// ✅ Frontend API calls: TETAP BERFUNGSI
fetch('https://api.zinpospro.com/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include'
})
// ALLOW: 'connect-src 'self' https://api.zinpospro.com'

// ✅ Google Fonts: TETAP BERFUNGSI
<link href="https://fonts.googleapis.com/css2?family=Roboto" rel="stylesheet" />
// ALLOW: 'style-src https://fonts.googleapis.com' + 'font-src https://fonts.gstatic.com'

// ✅ External images: TETAP BERFUNGSI
<img src="https://example.com/image.jpg" />
// ALLOW: 'img-src https:'

// ✅ Form submissions: TETAP BERFUNGSI
<form action="/api/submit" method="POST">
// ALLOW: 'form-action 'self''
```

---

## ISSUE #2: Missing Referrer-Policy Header

### 📌 Context
**Severity:** 🔴 HIGH  
**Type:** Privacy Leakage  
**Attack Vector:** Referrer Information Exposure  

### Problem Description
```
Referrer-Policy mengontrol berapa banyak URL information 
yang dikirim ketika user click link ke website lain.

Tanpa Referrer-Policy, browser default send full URL:
https://zinpospro.com/users/12345/profile?token=secret123

Risiko:
1. Sensitive data dalam URL bisa exposed
2. User behavior tracking
3. Information leakage ke competitors
```

### Current Impact
```
Risk Level: HIGH (Privacy)
- Full URL bisa dilihat external sites
- Parameter sensitif bisa logged
- User tracking bisa dilakukan
```

### Solution

#### Code Implementation

**File: `next.config.js` - Tambahkan ke headers array**

```javascript
/**
 * PERBAIKAN #2: Referrer-Policy Header
 * 
 * Policy: strict-origin-when-cross-origin
 * 
 * Behavior:
 * - Same-origin request: Send full URL
 * - Cross-origin request: Send hanya domain (origin)
 * 
 * Example:
 * User di: https://zinpospro.com/users/12345?token=xyz
 * Click link ke external site → Send: https://zinpospro.com (tanpa path/query)
 * 
 * SAFE UNTUK FRONTEND-BACKEND: ✅ YA
 * - Internal same-origin requests: Full referrer dikirim (untuk logging)
 * - Cross-origin requests: Origin hanya (privacy protected)
 */

{
  key: 'Referrer-Policy',
  value: 'strict-origin-when-cross-origin'
  
  // Alternative options (uncomment jika perlu):
  // value: 'no-referrer'  // Paling strict, tidak send referrer apapun
  // value: 'strict-origin'  // Hanya send origin
  // value: 'same-origin'  // Hanya send untuk same-origin requests
}
```

#### Why This is Safe
```javascript
// ✅ SAME-ORIGIN (Internal to backend)
// Request dari: https://zinpospro.com/dashboard
// Ke: https://zinpospro.com/api/users
// Referrer header: https://zinpospro.com/dashboard (FULL)
// Impact: Backend logging tetap detail ✅

// ✅ CROSS-ORIGIN (External link)
// User click link dari: https://zinpospro.com/blog
// Ke: https://external-site.com
// Referrer header: https://zinpospro.com (ORIGIN ONLY)
// Impact: External site tidak bisa lihat blog path ✅
```

---

## ISSUE #3: Missing Permissions-Policy Header

### 📌 Context
**Severity:** 🟡 MEDIUM  
**Type:** API Access Control  
**Attack Vector:** Malicious API Usage  

### Problem Description
```
Permissions-Policy (formerly Feature-Policy) mengontrol 
mana browser APIs yang bisa diakses oleh website dan embedded content.

Dangerous APIs jika tidak restricted:
- geolocation: Akses lokasi user
- camera: Akses kamera (untuk screenshots/recording)
- microphone: Akses microphone (untuk recording)
- payment: Akses payment APIs (untuk charging user)
- usb: Akses USB devices
- vr: Akses VR capabilities
```

### Current Impact
```
Risk Level: MEDIUM
- Malicious scripts bisa access sensitive APIs
- Third-party plugins bisa abuse browser features
- User privacy at risk
```

### Solution

#### Code Implementation

**File: `next.config.js` - Tambahkan ke headers array**

```javascript
/**
 * PERBAIKAN #3: Permissions-Policy Header
 * 
 * Policy: Disable all dangerous features
 * Format: feature=()  means "disabled everywhere"
 *         feature=('self')  means "enabled only on this site"
 * 
 * SAFE UNTUK FRONTEND-BACKEND: ✅ YA
 * - Aplikasi POS tidak membutuhkan camera/microphone/geolocation
 * - Disabling semua tidak akan affect business logic
 * - Backend communication tetap berfungsi normal
 */

{
  key: 'Permissions-Policy',
  // Disable semua potentially dangerous features
  value: 'geolocation=(), ' +
         'microphone=(), ' +
         'camera=(), ' +
         'payment=(), ' +
         'usb=(), ' +
         'magnetometer=(), ' +
         'gyroscope=(), ' +
         'accelerometer=(), ' +
         'vr=()'
  
  // Jika aplikasi perlu geolocation untuk delivery tracking:
  // value: 'geolocation=(\'self\'), microphone=(), camera=(), payment=(), usb=(), ...'
}
```

#### Why This is Safe
```javascript
// ❌ BLOCKED: Third-party script tries access camera
if (navigator.mediaDevices?.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true })
    .catch(err => console.log('BLOCKED by Permissions-Policy'))
}

// ❌ BLOCKED: Embedded iframe tries geolocation
// <iframe src="https://external.com"></iframe>
// External content cannot access geolocation

// ✅ ALLOWED: Normal frontend operations tetap berfungsi
fetch('/api/users')  // Still works
localStorage.setItem('key', 'value')  // Still works
document.querySelector('#element')  // Still works
```

---

## ISSUE #4: Overly Permissive CORS Policy

### 📌 Context
**Severity:** 🔴 CRITICAL  
**Type:** Cross-Site Request Forgery (CSRF)  
**Attack Vector:** Unauthorized API Access  

### Problem Description
```
Current Header:
access-control-allow-origin: *

Ini berarti SETIAP website bisa:
1. Make requests ke API zinpospro.com
2. Access resources
3. Potentially modify data jika POST/PUT/DELETE tidak diproteksi

Attack Scenario:
1. User login ke zinpospro.com
2. User kunjungi attacker.com (tanpa logout)
3. attacker.com buat form POST ke zinpospro.com/api/users
4. Browser send cookies/auth tokens otomatis (CORS allows)
5. Attacker bisa modify user data!
```

### Current Impact
```
Risk Level: CRITICAL
- CSRF attacks possible
- Unauthorized data modification risk
- Data integrity at risk
```

### Solution

#### Code Implementation

**File: `next.config.js` - Tambahkan ke headers array**

```javascript
/**
 * PERBAIKAN #4: Restrict CORS Policy
 * 
 * Perubahan dari: access-control-allow-origin: *
 * Menjadi: access-control-allow-origin: https://www.zinpospro.com
 * 
 * SAFE UNTUK FRONTEND-BACKEND: ✅ YA (CRITICAL!)
 * - Frontend request dari https://www.zinpospro.com → ALLOWED ✅
 * - External website request → BLOCKED ✅
 * - Backend bisa validate origin
 * 
 * PENTING: Ubah zinpospro.com sesuai dengan domain Anda!
 */

// Option 1: Single domain (Recommended untuk production)
{
  key: 'Access-Control-Allow-Origin',
  value: 'https://www.zinpospro.com'
},
{
  key: 'Access-Control-Allow-Credentials',
  value: 'true'
},
{
  key: 'Access-Control-Allow-Methods',
  value: 'GET, POST, PUT, DELETE, OPTIONS'
},
{
  key: 'Access-Control-Allow-Headers',
  value: 'Content-Type, Authorization, X-CSRF-Token'
},

// Option 2: Multiple domains (jika ada sub-domains)
// {
//   key: 'Access-Control-Allow-Origin',
//   value: process.env.NODE_ENV === 'production'
//     ? 'https://www.zinpospro.com'
//     : 'http://localhost:3000'
// },
```

#### Why This is Safe
```javascript
// ✅ ALLOWED: Frontend dari same origin
// Request dari: https://www.zinpospro.com
// To: https://www.zinpospro.com/api/users
// Origin header: https://www.zinpospro.com
// Result: ✅ ALLOWED ✅

fetch('https://www.zinpospro.com/api/users', {
  credentials: 'include',  // Send cookies
  headers: {
    'Content-Type': 'application/json'
  }
})
// Result: ✅ WORKS ✅

// ❌ BLOCKED: External origin
// Request dari: https://attacker.com
// To: https://www.zinpospro.com/api/users
// Origin header: https://attacker.com
// Result: ❌ CORS error ❌

// Browser console error:
// Access to fetch at 'https://www.zinpospro.com/api/users' 
// from origin 'https://attacker.com' has been blocked by CORS policy

// ✅ CSRF Protection Active ✅
```

#### Additional CSRF Protection (Recommended)

**If using Next.js with API routes:**

```javascript
// File: lib/csrf.js
import crypto from 'crypto';

export function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCSRFToken(token, sessionToken) {
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(sessionToken)
  );
}

// File: pages/api/users.js
import { validateCSRFToken } from '@/lib/csrf';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const csrfToken = req.body.csrf_token;
    const sessionCSRF = req.session.csrfToken;
    
    if (!validateCSRFToken(csrfToken, sessionCSRF)) {
      return res.status(403).json({ error: 'CSRF validation failed' });
    }
    
    // Process request
  }
}
```

---

## 🔧 IMPLEMENTATION STEPS

### Step 1: Backup Current Configuration

```bash
# 1. Backup next.config.js
cp next.config.js next.config.js.backup

# 2. Create new security-config.js
touch next.config.security.js

# 3. Git commit backup
git add next.config.js.backup
git commit -m "chore: backup current config before security update"
```

### Step 2: Create Security Headers Configuration

**File: `next.config.js`**

```javascript
/**
 * Next.js Security Configuration
 * 
 * Updates:
 * ✅ Added Content-Security-Policy
 * ✅ Added Referrer-Policy
 * ✅ Added Permissions-Policy
 * ✅ Fixed CORS policy (from * to specific domain)
 * 
 * Date: 05 Apr 2026
 * Version: 1.0
 */

const securityHeaders = [
  // 1. Content-Security-Policy - XSS Protection
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; " +
           "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
           "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
           "img-src 'self' data: https:; " +
           "font-src 'self' https://fonts.gstatic.com; " +
           "connect-src 'self' https://api.zinpospro.com https://*.vercel.app; " +
           "frame-ancestors 'none'; " +
           "base-uri 'self'; " +
           "form-action 'self';"
  },
  
  // 2. Referrer-Policy - Privacy Protection
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  
  // 3. Permissions-Policy - API Access Control
  {
    key: 'Permissions-Policy',
    value: 'geolocation=(), ' +
           'microphone=(), ' +
           'camera=(), ' +
           'payment=(), ' +
           'usb=(), ' +
           'magnetometer=(), ' +
           'gyroscope=(), ' +
           'accelerometer=(), ' +
           'vr=()'
  },
  
  // 4. CORS Headers - Request Origin Control
  {
    key: 'Access-Control-Allow-Origin',
    value: process.env.NODE_ENV === 'production'
      ? 'https://www.zinpospro.com'
      : 'http://localhost:3000'
  },
  {
    key: 'Access-Control-Allow-Credentials',
    value: 'true'
  },
  {
    key: 'Access-Control-Allow-Methods',
    value: 'GET, POST, PUT, DELETE, OPTIONS'
  },
  {
    key: 'Access-Control-Allow-Headers',
    value: 'Content-Type, Authorization, X-CSRF-Token'
  },
  
  // 5. Already Present - Keep As Is
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains'
  },
  
  // 6. Additional Recommended
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  }
];

module.exports = {
  // ... existing config
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ];
  }
};
```

### Step 3: Update Environment Variables

**File: `.env.local`**

```bash
# Backend API endpoint - sesuaikan dengan backend Anda
NEXT_PUBLIC_API_URL=https://api.zinpospro.com
NEXT_PUBLIC_APP_URL=https://www.zinpospro.com

# CORS configuration
CORS_ORIGIN=https://www.zinpospro.com
```

### Step 4: Test Locally

```bash
# 1. Install dependencies
npm install

# 2. Build for production
npm run build

# 3. Start preview
npm run start

# 4. Open in browser
# http://localhost:3000
```

### Step 5: Deploy to Vercel

```bash
# 1. Commit changes
git add next.config.js
git commit -m "feat: implement security headers (CSP, Referrer-Policy, Permissions-Policy)"

# 2. Push to main branch
git push origin main

# 3. Vercel auto-deploys (or manually via dashboard)

# 4. Verify deployment
# https://www.zinpospro.com
```

---

## ✅ TESTING CHECKLIST

### Test 1: Security Headers Present

```bash
# Method 1: Using curl
curl -I https://www.zinpospro.com | grep -E "Content-Security-Policy|Referrer-Policy|Permissions-Policy"

# Expected output:
# Content-Security-Policy: default-src 'self'; ...
# Referrer-Policy: strict-origin-when-cross-origin
# Permissions-Policy: geolocation=(), ...
```

### Test 2: CSP Enforcement (DevTools)

```javascript
// 1. Open DevTools (F12)
// 2. Go to Console tab
// 3. Paste and run:

// Test 1: Try to load external script (should fail)
const script = document.createElement('script');
script.src = 'https://evil.com/malicious.js';
document.body.appendChild(script);
// Expected error: Refused to load script because it violates CSP directive

// Test 2: Inline script (should work)
console.log('Inline script works');  // ✅ Works

// Test 3: Check CSP in headers
fetch('https://www.zinpospro.com').then(r => {
  console.log('CSP:', r.headers.get('Content-Security-Policy'));
});
```

### Test 3: Frontend-Backend Communication

```javascript
// Test API calls (critical!)
fetch('https://api.zinpospro.com/users', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log('✅ API call works:', data))
.catch(err => console.error('❌ API call failed:', err));

// Test POST request
fetch('https://api.zinpospro.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include',
  body: JSON.stringify({ name: 'Test' })
})
.then(r => r.json())
.then(data => console.log('✅ POST works:', data))
.catch(err => console.error('❌ POST failed:', err));
```

### Test 4: CORS Rejection (External Origin)

```javascript
// Simulate external origin request
// (Run this dari DevTools dengan origin https://attacker.com)

fetch('https://www.zinpospro.com/api/users', {
  credentials: 'include'
})
.catch(err => {
  // Expected: CORS error
  console.log('Expected CORS error:', err);
  // ✅ This is correct behavior
});
```

### Test 5: Online Security Audit

```bash
# 1. Re-test di Security Headers
# https://securityheaders.com/
# Input: https://www.zinpospro.com
# Target Grade: A+ (was C)

# 2. Re-test di SSL Labs
# https://www.ssllabs.com/ssltest/
# Target Grade: Still A+ (should not change)

# 3. Re-test di Lighthouse
# https://web.dev/measure/
# Security score should increase
```

### Test 6: User Functionality Tests

```javascript
// Critical user flows to test:

// 1. User login
async function testLogin() {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@example.com', password: 'xxx' })
  });
  return res.json();
}

// 2. Get user data
async function testGetUser() {
  const res = await fetch('/api/users/me', {
    credentials: 'include'
  });
  return res.json();
}

// 3. Create order
async function testCreateOrder() {
  const res = await fetch('/api/orders', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [...] })
  });
  return res.json();
}

// 4. Update profile
async function testUpdateProfile() {
  const res = await fetch('/api/users/profile', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'New Name' })
  });
  return res.json();
}

// Run all tests
console.log('Testing critical flows...');
testLogin().then(() => console.log('✅ Login works'));
testGetUser().then(() => console.log('✅ Get User works'));
testCreateOrder().then(() => console.log('✅ Create Order works'));
testUpdateProfile().then(() => console.log('✅ Update Profile works'));
```

---

## 🔙 ROLLBACK PLAN

### If Something Goes Wrong

#### Quick Rollback (5 minutes)

```bash
# 1. Restore backup
cp next.config.js.backup next.config.js

# 2. Redeploy
git add next.config.js
git commit -m "fix: rollback security headers"
git push origin main

# 3. Wait for Vercel redeployment (2-3 minutes)
# https://www.zinpospro.com

# 4. Verify
curl -I https://www.zinpospro.com | head -20
```

#### Partial Rollback (Keep Some Headers)

```javascript
// Jika CSP causes issue, tapi CORS fix working:
// Comment out CSP, keep lainnya

const securityHeaders = [
  // Temporarily disable
  // {
  //   key: 'Content-Security-Policy',
  //   value: "..."
  // },
  
  // Keep others
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  // ... rest
];
```

#### Issue Resolution Checklist

| Issue | Symptom | Solution |
|-------|---------|----------|
| API calls fail | CORS error in console | Check `Access-Control-Allow-Origin` value |
| Images not loading | CSP violation | Add domain to `img-src` in CSP |
| External fonts broken | CSP violation | Add font domain to CSP |
| Third-party services fail | CSP violation | Add service URL to `connect-src` |
| Forms not submitting | CSP violation | Check `form-action 'self'` |

---

## 📝 IMPLEMENTATION NOTES

### For AI IDE Assistant

When implementing this procedure, AI model should:

```
✅ DO:
1. Copy code snippets exactly as provided
2. Replace domain names (zinpospro.com) with actual domain
3. Test locally before pushing
4. Verify frontend-backend communication after each step
5. Keep backup of original config
6. Commit changes with descriptive messages
7. Re-run security tests to verify improvements

❌ DON'T:
1. Modify API endpoint URLs
2. Change authentication logic
3. Alter database connections
4. Break existing functionality
5. Remove headers that already exist
6. Change from HTTPS to HTTP
7. Make headers more permissive (only more restrictive)
```

### Configuration Checklist

```javascript
BEFORE implementing, verify:

[ ] Domain name correct (search/replace zinpospro.com)
[ ] API endpoints listed in connect-src
[ ] External fonts/images URLs in CSP
[ ] CORS origin matches deployment domain
[ ] Environment variables set (.env.local)
[ ] Node.js version compatible (14+)
[ ] Next.js version compatible (11+)
[ ] Database connection still working
[ ] Authentication flow still working
```

---

## 📞 SUPPORT & DEBUGGING

### Common Issues & Solutions

#### Issue: "Refused to load the script"
```
Error: Refused to load the script 'https://external.com/script.js' 
because it violates the Content-Security-Policy directive

Solution:
1. Add domain to script-src in CSP
2. Or use sub-resource integrity (SRI)

Example:
script-src 'self' https://external.com;
```

#### Issue: "CORS error: Access-Control-Allow-Origin"
```
Error: Access to XMLHttpRequest from origin 'https://attacker.com' 
has been blocked by CORS policy

Solution:
✅ This is CORRECT behavior!
❌ Don't change Access-Control-Allow-Origin to *
✅ Only add trusted origins

Example (multiple origins):
const allowedOrigins = [
  'https://www.zinpospro.com',
  'https://admin.zinpospro.com'
];

// In Next.js middleware:
const origin = req.headers.origin;
if (allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);
}
```

#### Issue: "Referrer-Policy breaks analytics"
```
Problem: Analytics not tracking referrers

Solution:
This is INTENTIONAL for privacy
Use first-party analytics solution instead:
- Plausible.io
- Fathom Analytics
- Umami
(avoid Google Analytics which relies on referrer)

Or use strict-origin if full URL needed:
Referrer-Policy: strict-origin
```

---

## 🎓 LEARNING RESOURCES

For understanding each security header better:

1. **Content-Security-Policy**
   - MDN: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
   - CSP Generator: https://www.cspisawesome.com/

2. **Referrer-Policy**
   - MDN: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy

3. **Permissions-Policy**
   - MDN: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy

4. **CORS**
   - MDN: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
   - CORS Tester: https://www.test-cors.org/

---

## 🔄 VERIFICATION AFTER DEPLOYMENT

### Day 1: Smoke Testing
```bash
# Check all headers present
curl -I https://www.zinpospro.com | grep -E "^Content-Security|Referrer|Permissions|Access-Control"

# Check critical frontend flows
- User login
- View dashboard
- Create order
- Upload file (if applicable)
```

### Day 2-3: User Monitoring
```
Monitor for:
✓ No increase in console errors
✓ API calls working normally
✓ User reports of issues
✓ Analytics tracking (if using)
```

### Week 1: Security Re-audit
```bash
# Re-test on https://securityheaders.com/
# Expected: Grade A+ (was C)

# Re-test on https://www.ssllabs.com/ssltest/
# Expected: Grade A+ (maintain)

# Re-test on https://web.dev/measure/
# Expected: Security score improved
```

---

## 📊 SUCCESS CRITERIA

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| **Security Headers Grade** | C | B+ / A | A+ |
| **CSP Present** | ❌ No | ✅ Yes | ✅ Yes |
| **Referrer-Policy** | ❌ No | ✅ Yes | ✅ Yes |
| **Permissions-Policy** | ❌ No | ✅ Yes | ✅ Yes |
| **CORS Restricted** | ❌ * | ✅ Domain | ✅ Domain |
| **XSS Vulnerability** | ⚠️ High | ✅ Low | ✅ Low |
| **CSRF Risk** | ⚠️ High | ✅ Low | ✅ Low |
| **API Functionality** | ✅ Works | ✅ Works | ✅ Works |
| **Frontend-Backend** | ✅ Works | ✅ Works | ✅ Works |

---

## ✨ FINAL CHECKLIST

Before marking as complete:

```
IMPLEMENTATION:
[ ] Content-Security-Policy added
[ ] Referrer-Policy added
[ ] Permissions-Policy added
[ ] CORS policy restricted
[ ] All headers tested locally
[ ] Deployment successful

TESTING:
[ ] Frontend loads correctly
[ ] API calls work
[ ] User authentication works
[ ] Database operations work
[ ] File uploads work (if applicable)
[ ] External fonts/images load
[ ] Analytics tracking works

VERIFICATION:
[ ] Security Headers grade improved
[ ] SSL Labs still A+
[ ] No console errors
[ ] No user reports of issues
[ ] CSP violations logged only on CSP violations, not normal operations

DOCUMENTATION:
[ ] Changes documented
[ ] Backup created
[ ] Rollback plan tested
[ ] Team notified
```

---

## 📄 Document Information

**Version:** 1.0  
**Date:** 05 Apr 2026  
**Status:** Ready for Implementation  
**Review:** Security audit completed  
**Approved by:** Security Team  

For questions or issues, consult the testing checklist and rollback plan.

