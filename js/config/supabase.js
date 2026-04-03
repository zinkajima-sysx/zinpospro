/**
 * config.js
 * Supabase Configuration
 */

const CONFIG = {
    SUPABASE_URL: "https://pgopeapgcwoegdnbabgi.supabase.co",
    SUPABASE_KEY: "sb_publishable_7_pwETDKQcpcTr4Hw1JZzg_pHkKh3-x",
    APP: {
        DEFAULT_TOKO: "00000000-0000-0000-0000-000000000001"
    }
};

let supabaseClient = null;

function initSupabase() {
    if (!window.supabase) {
        console.error("Supabase SDK not loaded");
        return;
    }

    try {
        supabaseClient = window.supabase.createClient(
            CONFIG.SUPABASE_URL,
            CONFIG.SUPABASE_KEY
        );

        // Set window globals for non-module scripts
        window.supabase = supabaseClient;
        window.CONFIG = CONFIG;

        console.log("Supabase connected");
    } catch (error) {
        console.error("Supabase initialization failed:", error);
    }
}

initSupabase();