/**
 * config.js
 * Supabase Configuration
 */

const CONFIG = {
    SUPABASE_URL: "https://pgopeapgcwoegdnbabgi.supabase.co",
    SUPABASE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnb3BlYXBnY3dvZWdkbmJhYmdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNTU0NzcsImV4cCI6MjA4OTkzMTQ3N30.aIfqBe-L2EoezCiESmfWt5Ky5erJn_7gj2zszXhHrRA",
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