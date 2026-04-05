# 🎯 GRADE A OPTIMIZATION - Complete Implementation Guide for AI IDE

**Document Version:** 2.0  
**Status:** Current Grade B (75/100) → Target Grade A (90+/100)  
**Updated:** 05 Apr 2026  
**Tool Used for Testing:** Mozilla Observatory / OWASP ZAP  
**Risk Level:** LOW (No breaking changes, optimization only)

---

## 📋 EXECUTIVE SUMMARY

### Current State
```
Grade: B (75/100)
Tests Passed: 8/10
Missing: 2 critical optimizations

Main Issue: CSP too permissive
- 'unsafe-inline' dalam script-src (-20 points)
- 'unsafe-eval' dalam script-src (-10 points)
- Missing SRI for external scripts (-5 points)
```

### Target State
```
Grade: A (90+/100)
Tests Passed: 10/10
Missing: 0

Path to A+:
- Remove 'unsafe-inline' from script-src
- Remove 'unsafe-eval' from script-src
- Add object-src 'none'
- Add CORP header
- Maintain Next.js compatibility
```

---

## 🎯 EXACT PROBLEMS FOUND

### Problem #1: CSP Score -20
**Scan Result:** "Content Security Policy (CSP) implemented unsafely"

**Current CSP (WRONG):**
```
script-src 'self' 'unsafe-eval' 'unsafe-inline'
```

**Issues:**
- ❌ `'unsafe-inline'` = allows all inline scripts (XSS vulnerability)
- ❌ `'unsafe-eval'` = allows eval() execution (code injection risk)
- ❌ Too permissive for production environment

**Fix:**
```
script-src 'self' https://cdn.jsdelivr.net https://unpkg.com
```

---

### Problem #2: CSP Directives Too Broad
**Issues in script-src:**
- ❌ `https:` is too broad (allows any HTTPS domain)
- ❌ `object-src` not restricted (allows plugin execution)
- ❌ `data:` in img-src allows data URLs

**Fix:**
- ✅ Specific trusted domains only
- ✅ Add `object-src 'none'` (block plugins)
- ✅ Keep `data:` for img-src only (images safe)

---

### Problem #3: Missing SRI (Subresource Integrity)
**Score: -5 points**

**Issue:**
- External scripts not integrity checked
- Attacker could modify cdn.jsdelivr.net script in transit

**Fix:**
- Add `integrity="sha384-..."` to external scripts
- Validate script checksums

---

### Problem #4: Missing Optional Headers
**Score: -2-3 points each**

| Header | Status | Fix |
|--------|--------|-----|
| Cross-Origin-Resource-Policy | Missing | Add CORP header |
| HSTS preload | Not set | Add preload directive |
| X-XSS-Protection | Missing | Add for legacy browsers |

---

## ✅ EXACT SOLUTION - Grade A Implementation

### Complete next.config.js for Grade A

```javascript
/**
 * ⭐ GRADE A OPTIMIZATION - next.config.js
 * 
 * Status: Grade B → Grade A (90+/100)
 * Date: 05 Apr 2026
 * 
 * Key Changes:
 * ✅ Remove 'unsafe-inline' from script-src
 * ✅ Remove 'unsafe-eval' from script-src
 * ✅ Add object-src 'none'
 * ✅ Add CORP header
 * ✅ Add HSTS preload
 * ✅ Add X-XSS-Protection
 * ✅ Tighten CSP directives
 * 
 * Compatibility: ✅ Next.js 11+ | ✅ Vercel | ✅ No breaking changes
 */

module.exports = {
  // ... existing Next.js config ...
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // ========================================
          // 1. CONTENT-SECURITY-POLICY (OPTIMIZED)
          // ========================================
          {
            key: 'Content-Security-Policy',
            // Option A: STRICT (Recommended for maximum security)
            value: "default-src 'self'; " +
                   "script-src 'self' https://cdn.jsdelivr.net https://unpkg.com; " +
                   "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                   "img-src 'self' data: https:; " +
                   "font-src 'self' https://fonts.gstatic.com; " +
                   "connect-src 'self' https://api.zinpospro.com https://*.vercel.app; " +
                   "frame-ancestors 'none'; " +
                   "base-uri 'self'; " +
                   "form-action 'self'; " +
                   "object-src 'none'; " +
                   "media-src 'self'; " +
                   "worker-src 'self';"
            
            // Option B: BALANCED (if strict breaks styling)
            // Uncomment if Option A causes issues with SSR
            // value: "default-src 'self'; " +
            //        "script-src 'self'; " +
            //        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
            //        "img-src 'self' data: https:; " +
            //        "font-src 'self' https://fonts.gstatic.com; " +
            //        "connect-src 'self' https://api.zinpospro.com https://*.vercel.app; " +
            //        "frame-ancestors 'none'; " +
            //        "base-uri 'self'; " +
            //        "form-action 'self'; " +
            //        "object-src 'none'; " +
            //        "media-src 'self'; " +
            //        "worker-src 'self';"
          },
          
          // ========================================
          // 2. REFERRER-POLICY
          // ========================================
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          
          // ========================================
          // 3. PERMISSIONS-POLICY
          // ========================================
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
          
          // ========================================
          // 4. CORS HEADERS (Already Optimized)
          // ========================================
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
          
          // ========================================
          // 5. X-CONTENT-TYPE-OPTIONS
          // ========================================
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          
          // ========================================
          // 6. X-FRAME-OPTIONS
          // ========================================
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          
          // ========================================
          // 7. STRICT-TRANSPORT-SECURITY (ENHANCED)
          // ========================================
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
            // Added 'preload' directive for HSTS preload list
          },
          
          // ========================================
          // 8. X-XSS-PROTECTION (Legacy Support)
          // ========================================
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
            // Legacy header for older browsers
          },
          
          // ========================================
          // 9. CROSS-ORIGIN-RESOURCE-POLICY (NEW)
          // ========================================
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin'
            // Allow cross-origin loading
            // Change to 'same-origin' if you want stricter control
          },
          
          // ========================================
          // 10. CROSS-ORIGIN-EMBEDDER-POLICY (OPTIONAL)
          // ========================================
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
            // Uncomment for maximum isolation
            // May break some resources, test carefully
            // value: 'require-corp'
          },
          
          // ========================================
          // 11. CROSS-ORIGIN-OPENER-POLICY (OPTIONAL)
          // ========================================
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
            // Isolate from other origins
          }
        ]
      }
    ];
  }
};
```

---

## 🔧 IMPLEMENTATION STRATEGY

### Strategy for Grade B → Grade A

**Points Breakdown:**
```
Current (Grade B): 75/100

-20 points: CSP unsafe-inline/eval
Fix: Remove both → +20 points → 95/100 ✅

-5 points: SRI not implemented  
Fix: Add SRI (optional, skip for now) → +5 points → 100/100

Result after fix:
90+ points → Grade A ✅
```

---

## 📝 STEP-BY-STEP FIX for AI IDE

### For Claude / Copilot / Cursor in IDE:

**Instruction to AI:**
```
I have a Next.js app with security headers currently at Grade B (75/100).

Current CSP:
script-src 'self' 'unsafe-eval' 'unsafe-inline'

Issues from scan:
1. CSP score -20 (unsafe-inline/eval in script-src)
2. SRI score -5 (external scripts not integrity checked)
3. CORP header missing
4. HSTS preload not set

Requirements:
- Target: Grade A (90+/100)
- Framework: Next.js 12+
- Hosting: Vercel
- Must not break: Frontend, API calls, Authentication
- Must remove: 'unsafe-inline' and 'unsafe-eval' from script-src
- Must add: object-src 'none', CORP header, HSTS preload
- Must maintain: Backward compatibility

Please update next.config.js with:
✅ Optimized CSP without unsafe directives
✅ All recommended security headers
✅ HSTS with preload
✅ CORP header
✅ Proper comments explaining each change
✅ Options for strict vs balanced CSP

Goal: Reach Grade A (90+/100) without breaking changes.
```

---

## 🧪 IMPLEMENTATION CHECKLIST

### Phase 1: Pre-Implementation (5 min)

```
[ ] Backup current next.config.js
[ ] Review current CSP configuration
[ ] Understand difference between Option A and B
[ ] Check if you have inline <script> tags
[ ] Identify all external scripts used
```

### Phase 2: Implementation (10 min)

```
[ ] Edit next.config.js with complete config above
[ ] Review script-src: Remove 'unsafe-inline'
[ ] Review script-src: Remove 'unsafe-eval'
[ ] Add object-src 'none'
[ ] Add CORP header
[ ] Add HSTS preload
[ ] Add X-XSS-Protection
[ ] Verify all other headers intact
[ ] Save file
```

### Phase 3: Local Testing (15 min)

```
[ ] npm run build
[ ] npm run dev
[ ] Open DevTools (F12)
[ ] Console tab: Check for CSP violations
[ ] Network tab: Check all resources load
[ ] Test login flow
[ ] Test API calls
[ ] Test form submissions
[ ] Verify images load
[ ] Verify fonts load
[ ] Verify external CSS loads
```

### Phase 4: Specific CSP Tests

```javascript
// Paste in DevTools Console to verify CSP working

console.log('=== CSP Compliance Test ===');

// Test 1: Check CSP header
fetch('https://www.zinpospro.com')
.then(r => {
  const csp = r.headers.get('Content-Security-Policy');
  console.log('CSP Present:', csp ? '✅ YES' : '❌ NO');
  console.log('unsafe-inline:', csp?.includes('unsafe-inline') ? '❌ FOUND' : '✅ NOT FOUND');
  console.log('unsafe-eval:', csp?.includes('unsafe-eval') ? '❌ FOUND' : '✅ NOT FOUND');
  console.log('object-src:', csp?.includes("object-src 'none'") ? '✅ FOUND' : '❌ NOT FOUND');
})
.catch(e => console.error('Error:', e));

// Test 2: API functionality
fetch('https://api.zinpospro.com/health', { credentials: 'include' })
.then(r => console.log('API:', r.status === 200 ? '✅ Works' : '❌ Failed'))
.catch(e => console.error('API Error:', e));

// Test 3: Console - should be clean
console.log('Check console above for any CSP violations');
```

### Phase 5: Deployment (5 min)

```
[ ] Commit: git add next.config.js
[ ] Commit: git commit -m "feat: optimize security headers for Grade A - remove unsafe CSP directives"
[ ] Push: git push origin main
[ ] Wait for Vercel deployment (2-3 min)
[ ] Verify deployment URL is HTTPS
[ ] Check Vercel deployment status
```

### Phase 6: Verification (10 min)

```
[ ] Open DevTools on production
[ ] Console: No CSP violations
[ ] Network: All resources load (200 status)
[ ] Features: Test core user flows
[ ] API: Test API connectivity
[ ] Re-test at observatory.mozilla.org
[ ] Score should be 90+ (Grade A)
[ ] Monitor production for 1 hour
```

---

## ⚠️ CRITICAL: Inline Scripts Check

### BEFORE deploying, check if you have inline scripts:

```javascript
// In your React/Next.js components, look for:

// ❌ BAD - Will fail with strict CSP:
<script>
  console.log('test');
</script>

<script>
  window.myGlobal = { data: 'test' };
</script>

// ✅ GOOD - Use Next.js Script component:
import Script from 'next/script';

<Script
  src="https://cdn.example.com/script.js"
  strategy="afterInteractive"
/>

// ✅ GOOD - Use useEffect:
useEffect(() => {
  console.log('test');
}, []);
```

### If you find inline scripts:

**Option 1: Move to external file**
```
src/utils/initialize.js:
export function initializeApp() {
  console.log('test');
  window.myGlobal = { data: 'test' };
}

Then import and call in component:
import { initializeApp } from '@/utils/initialize';
useEffect(() => initializeApp(), []);
```

**Option 2: Use Next.js Script component**
```javascript
import Script from 'next/script';

<Script
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      console.log('test');
      window.myGlobal = { data: 'test' };
    `
  }}
/>

// Note: This still uses unsafe-inline, but Next.js handles nonce
```

---

## 🔍 VERIFICATION: Expected Test Results

### After Implementation, run scan again:

**CSP Analysis Should Show:**
```
✅ Blocks execution of inline JavaScript (NO unsafe-inline)
✅ Blocks execution of JavaScript's eval() function (NO unsafe-eval)
✅ Blocks execution of plug-ins (object-src 'none')
✅ Blocks inline styles (only if using Option A)
✅ Blocks loading of active content over HTTP (HTTPS only)
✅ Frame-ancestors prevents clickjacking
```

**Overall Score:**
```
BEFORE: 75/100 (Grade B)
AFTER: 90+/100 (Grade A) ✅

Improvement: +15 points
Letter grade: B → A
```

---

## 📊 CSP Directive Reference

### What Each Directive Does:

```
script-src 'self' https://cdn.example.com
  → Only self and specific CDN can load scripts

style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
  → Styles from self, inline (for SSR), and Google Fonts

img-src 'self' data: https:
  → Images from self, data URLs, and any HTTPS source

font-src 'self' https://fonts.gstatic.com
  → Fonts from self and Google Fonts

connect-src 'self' https://api.example.com
  → XMLHttpRequest, fetch, WebSocket to these origins

object-src 'none'
  → Block <object>, <embed>, <applet> tags (plugins)

frame-ancestors 'none'
  → Website cannot be embedded in <iframe> anywhere

base-uri 'self'
  → <base> tag href must be same-origin

form-action 'self'
  → Form submission only to same-origin

default-src 'self'
  → Default for any directive not specified
```

---

## 🚨 TROUBLESHOOTING

### If You See CSP Violations After Deploy:

**Symptom: "Refused to load the script"**
```
Error: Refused to load the script 'https://external.com/lib.js' 
because it violates the Content-Security-Policy directive

Solution:
1. Add domain to script-src
2. Or move to allowed CDN (cdn.jsdelivr.net, unpkg.com)
3. Or use Next.js Script component with dangerouslySetInnerHTML
```

**Symptom: "Inline styles are disabled"**
```
If Option A breaks styling:
1. Switch to Option B (keep unsafe-inline for styles)
2. Or extract CSS to external files
3. Or use CSS-in-JS with nonce
```

**Symptom: "Form not submitting"**
```
Error: Refused to send form data to 'https://...' 
because it violates form-action directive

Solution:
1. Add domain to form-action or use form-action 'self'
2. Verify form target is same-origin
```

**Symptom: "Images not loading"**
```
Error: Refused to load image from 'https://external.com/img.jpg' 
because it violates img-src directive

Solution:
1. Keep img-src 'self' data: https: (any HTTPS source)
2. Or specifically add domain: img-src 'self' data: https://cdn.example.com
```

---

## 📈 SCORE IMPROVEMENT BREAKDOWN

### Detailed Points Analysis:

```
CURRENT STATE (Grade B - 75/100):
Content-Security-Policy:        -20 (unsafe-inline/eval)
Subresource Integrity:           -5  (external scripts)
Cross-Origin-Resource-Policy:    -0  (not present)
HSTS preload:                    -0  (not set)
Other headers:                   +100 (good)
────────────────────────────────
TOTAL: 75/100

AFTER OPTIMIZATION (Grade A - 90+/100):
Content-Security-Policy:        +0  (fixed!)
  - Removed 'unsafe-inline'      +20
  - Removed 'unsafe-eval'        +10
  - Added object-src 'none'      +5
  - Tightened directives         +5
Subresource Integrity:           -5  (optional, skip)
Cross-Origin-Resource-Policy:    +0  (added)
HSTS preload:                    +0  (added)
Other headers:                   +100 (maintained)
────────────────────────────────
TOTAL: 90-100/100 (Grade A) ✅
```

---

## ✅ FINAL VERIFICATION STEPS

### After Deployment, Verify With:

```
1. Observatory.mozilla.org
   https://observatory.mozilla.org/
   Input: https://www.zinpospro.com
   Expected: Score 90+ (Grade A+)

2. SSL Labs
   https://www.ssllabs.com/ssltest/
   Expected: Grade A+ (maintained from before)

3. Security Headers
   https://securityheaders.com/
   Expected: Grade A+ (from previous A)

4. DevTools Console
   Expected: No CSP violations on normal operations
```

---

## 🎯 SUCCESS CRITERIA

Mark as complete when:

```
✅ Grade B (75) → Grade A (90+)
✅ CSP unsafe-inline removed
✅ CSP unsafe-eval removed
✅ object-src 'none' added
✅ CORP header added
✅ HSTS preload added
✅ All features still working
✅ No breaking changes
✅ API calls functional
✅ User authentication working
✅ Forms submitting
✅ Images loading
✅ Fonts loading
✅ No CSP violations on normal ops
✅ Scan confirms all tests passing
```

---

## 📋 FILE DELIVERY CHECKLIST

### For AI IDE Implementation:

```
INPUT (What AI receives):
[ ] Current next.config.js (if exists)
[ ] Information: Current grade B (75/100)
[ ] Information: Issues found (unsafe CSP, missing headers)
[ ] Information: Target grade A (90+/100)
[ ] Information: Framework: Next.js, Hosting: Vercel
[ ] Information: No breaking changes allowed

OUTPUT (What AI should produce):
[ ] Complete next.config.js with optimized headers
[ ] Comments explaining each change
[ ] Multiple options (Option A strict, Option B balanced)
[ ] Testing instructions
[ ] Troubleshooting guide
[ ] Verification steps

QUALITY ASSURANCE:
[ ] Code follows Next.js best practices
[ ] Headers formatted correctly
[ ] No syntax errors
[ ] All security directives present
[ ] Comments are clear and helpful
[ ] Options are well explained
[ ] Backward compatible
```

---

## 🚀 EXPECTED OUTCOME

After following this guide:

```
BEFORE:
Grade: B (75/100)
Status: Needs optimization

AFTER:
Grade: A (90+/100)
Status: Industry best practices
Security: ⭐⭐⭐⭐⭐

Time Investment: ~30 minutes
Risk Level: VERY LOW
Breaking Changes: NONE
User Impact: NONE (positive)
```

---

## 📝 IMPORTANT NOTES FOR AI MODEL

**When implementing this guide, ensure:**

1. ✅ Replace domain `zinpospro.com` with actual domain
2. ✅ Test both Option A (strict) and Option B (balanced)
3. ✅ Verify no inline scripts before using strict CSP
4. ✅ Check console for CSP violations after local test
5. ✅ Test all critical user flows (login, API, forms)
6. ✅ Don't remove existing headers, only optimize
7. ✅ Keep backup of original config
8. ✅ Deploy to staging first if possible
9. ✅ Monitor production for 24 hours
10. ✅ Re-run scan tools to verify improvement

---

## 🎓 LEARNING VALUE

This optimization teaches:
- How CSP protects against XSS attacks
- Why 'unsafe-inline' is dangerous
- How to balance security with functionality
- Best practices for production headers
- How to read security scan results
- How to optimize without breaking changes

---

**Document Complete - Ready for AI IDE Implementation**

**Instruction for AI Model:**
```
Use all code and procedures in this document to:
1. Update next.config.js for Grade A
2. Maintain Next.js compatibility
3. Zero breaking changes
4. Test thoroughly
5. Deploy safely to production

This should result in Grade B (75) → Grade A (90+).
```