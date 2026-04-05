(() => {
  function renderError(title, detail) {
    try {
      const app = document.getElementById('app');
      if (!app) return;
      app.innerHTML = '' +
        '<div style="min-height:100dvh;background:var(--bg-main);display:flex;align-items:center;justify-content:center;padding:24px;">' +
        '  <div class="card" style="max-width:720px;width:100%;padding:28px;">' +
        '    <h2 style="font-size:18px;font-weight:900;margin-bottom:10px;">' + title + '</h2>' +
        '    <p class="text-muted" style="font-size:13px;line-height:1.7;margin-bottom:12px;">' +
        '      Terjadi error saat memuat aplikasi. Buka DevTools Console untuk detail, atau kirimkan teks di bawah ini.' +
        '    </p>' +
        '    <pre style="white-space:pre-wrap;word-break:break-word;font-size:12px;line-height:1.6;background:#0b1220;color:#e2e8f0;padding:12px;border-radius:12px;overflow:auto;max-height:260px;">' +
        (detail || '') +
        '</pre>' +
        '  </div>' +
        '</div>';
    } catch (_) {}
  }

  window.addEventListener('error', (e) => {
    const msg = (e && e.message) ? String(e.message) : 'Unknown error';
    const stack = (e && e.error && e.error.stack) ? String(e.error.stack) : '';
    renderError('Aplikasi gagal dimuat', msg + (stack ? '\n\n' + stack : ''));
  });

  window.addEventListener('unhandledrejection', (e) => {
    const reason = e && e.reason ? e.reason : null;
    const msg = reason && reason.message ? String(reason.message) : String(reason || 'Unhandled rejection');
    const stack = reason && reason.stack ? String(reason.stack) : '';
    renderError('Aplikasi gagal dimuat', msg + (stack ? '\n\n' + stack : ''));
  });

  if (window.supabase && typeof window.supabase.createClient === 'function') {
    window.supabaseSdk = window.supabase;
  }
})();

