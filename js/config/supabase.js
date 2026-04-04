/**
 * config.js
 * Supabase Configuration
 */

let supabaseClient = null;

window.supabaseReady = (async () => {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        window.supabaseSdk = window.supabase;
    }
    const sdk = (window.supabase && typeof window.supabase.createClient === 'function')
        ? window.supabase
        : (window.supabaseSdk && typeof window.supabaseSdk.createClient === 'function')
            ? window.supabaseSdk
            : null;
    if (!sdk) throw new Error('Supabase SDK not loaded');

    try {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const defaultTokoFallback = "00000000-0000-0000-0000-000000000001";

        let cfg = null;
        try {
            const res = await fetch('/api/config', { cache: 'no-store' });
            if (!res.ok) throw new Error(`Config endpoint not available (${res.status})`);
            cfg = await res.json();
            localStorage.setItem('zinpos_runtime_config', JSON.stringify(cfg));
        } catch (_) {
            const cached = localStorage.getItem('zinpos_runtime_config');
            cfg = cached ? JSON.parse(cached) : null;
        }
        if (!cfg) throw new Error('Config endpoint not available and no cached config found');

        const supabaseUrl = cfg?.SUPABASE_URL;
        const supabaseAnonKey = cfg?.SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Supabase config missing (SUPABASE_URL / SUPABASE_ANON_KEY)');
        }

        let projectRef = null;
        try {
            const host = new URL(supabaseUrl).host;
            projectRef = host.split('.')[0] || null;
        } catch (_) {
            projectRef = null;
        }

        let defaultToko = cfg?.DEFAULT_TOKO;
        if (typeof defaultToko !== 'string' || !uuidRegex.test(defaultToko)) {
            defaultToko = defaultTokoFallback;
        }

        const CONFIG = {
            SUPABASE_URL: supabaseUrl,
            SUPABASE_KEY: supabaseAnonKey,
            SUPABASE_PROJECT_REF: projectRef,
            APP: {
                DEFAULT_TOKO: defaultToko
            }
        };

        supabaseClient = sdk.createClient(supabaseUrl, supabaseAnonKey);

        // Set window globals for non-module scripts
        window.supabase = supabaseClient;
        window.supabaseClient = supabaseClient;
        window.CONFIG = CONFIG;
        return supabaseClient;
    } catch (error) {
        console.error('Supabase initialization failed:', error);
        throw error;
    }
})();
