/**
 * Toast & Confirm Dialog System
 * Replaces native alert() and confirm() with styled UI components
 */

// ── Toast ──────────────────────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed; top: 24px; right: 24px;
            display: flex; flex-direction: column; gap: 10px;
            z-index: 99999; pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    const icons = { success: 'check-circle', error: 'x-circle', warning: 'alert-triangle', info: 'info' };
    const colors = {
        success: { bg: '#f0fdf4', border: '#86efac', icon: '#16a34a', text: '#15803d' },
        error:   { bg: '#fef2f2', border: '#fca5a5', icon: '#dc2626', text: '#b91c1c' },
        warning: { bg: '#fffbeb', border: '#fcd34d', icon: '#d97706', text: '#b45309' },
        info:    { bg: '#eff6ff', border: '#93c5fd', icon: '#2563eb', text: '#1d4ed8' }
    };
    const c = colors[type] || colors.info;

    const toast = document.createElement('div');
    toast.style.cssText = `
        display: flex; align-items: center; gap: 12px;
        background: ${c.bg}; border: 1px solid ${c.border};
        border-radius: 14px; padding: 14px 18px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        pointer-events: all; min-width: 280px; max-width: 380px;
        animation: toastIn 0.3s cubic-bezier(0.4,0,0.2,1);
        cursor: pointer;
    `;
    toast.innerHTML = `
        <i data-lucide="${icons[type] || 'info'}" style="width:20px;height:20px;color:${c.icon};flex-shrink:0;"></i>
        <span style="font-size:14px;font-weight:500;color:${c.text};flex:1;line-height:1.4;">${message}</span>
        <i data-lucide="x" style="width:16px;height:16px;color:${c.icon};opacity:0.6;flex-shrink:0;"></i>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    const dismiss = () => {
        toast.style.animation = 'toastOut 0.25s ease forwards';
        setTimeout(() => toast.remove(), 250);
    };

    toast.addEventListener('click', dismiss);
    const timer = setTimeout(dismiss, duration);
    toast.addEventListener('click', () => clearTimeout(timer));

    // Inject keyframes once
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes toastIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
            @keyframes toastOut { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(20px); } }
        `;
        document.head.appendChild(style);
    }
}

// ── Confirm Dialog ─────────────────────────────────────────────────────────
function showConfirm({ title = 'Konfirmasi', message, confirmText = 'Ya, Lanjutkan', cancelText = 'Batal', type = 'warning' }) {
    return new Promise((resolve) => {
        const colors = {
            warning: { icon: 'alert-triangle', color: '#d97706', bg: '#fffbeb' },
            danger:  { icon: 'trash-2',        color: '#dc2626', bg: '#fef2f2' },
            info:    { icon: 'info',            color: '#2563eb', bg: '#eff6ff' }
        };
        const c = colors[type] || colors.warning;

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position:fixed; inset:0; background:rgba(15,23,42,0.4);
            backdrop-filter:blur(4px); z-index:99998;
            display:flex; align-items:center; justify-content:center;
            animation: toastIn 0.2s ease;
        `;

        overlay.innerHTML = `
            <div style="
                background:#fff; border-radius:20px; padding:32px;
                max-width:400px; width:90%; box-shadow:0 20px 40px rgba(0,0,0,0.12);
                animation: toastIn 0.25s cubic-bezier(0.4,0,0.2,1);
                text-align:center;
            ">
                <div style="
                    width:56px; height:56px; border-radius:50%;
                    background:${c.bg}; display:flex; align-items:center;
                    justify-content:center; margin:0 auto 20px;
                ">
                    <i data-lucide="${c.icon}" style="width:26px;height:26px;color:${c.color};"></i>
                </div>
                <h3 style="font-size:18px;margin-bottom:8px;">${title}</h3>
                <p style="color:var(--text-muted);font-size:14px;margin-bottom:28px;line-height:1.5;">${message}</p>
                <div style="display:flex;gap:12px;">
                    <button id="confirm-cancel" style="
                        flex:1; padding:12px; border-radius:12px;
                        border:1px solid var(--border); background:#fff;
                        font-size:14px; font-weight:500; cursor:pointer;
                    ">${cancelText}</button>
                    <button id="confirm-ok" style="
                        flex:1; padding:12px; border-radius:12px;
                        border:none; background:${c.color}; color:#fff;
                        font-size:14px; font-weight:600; cursor:pointer;
                    ">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        if (window.lucide) window.lucide.createIcons();

        const close = (result) => {
            overlay.style.animation = 'toastOut 0.2s ease forwards';
            setTimeout(() => overlay.remove(), 200);
            resolve(result);
        };

        overlay.querySelector('#confirm-ok').addEventListener('click', () => close(true));
        overlay.querySelector('#confirm-cancel').addEventListener('click', () => close(false));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
    });
}

window.showToast = showToast;
window.showConfirm = showConfirm;
