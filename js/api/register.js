/**
 * Register API - Daftarkan toko baru beserta admin pertama
 */
const registerAPI = {

    async registerToko({ nama_toko, alamat, no_tlp, email, owner, username, password }) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const generateUuid = () => {
            const v = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : null;
            if (!v || !uuidRegex.test(v)) throw new Error('Browser tidak mendukung pembuatan UUID');
            return v;
        };

        const formatRlsError = (err, tableName) => {
            const msg = (err && (err.message || err.details)) ? String(err.message || err.details) : '';
            const isRls = msg.toLowerCase().includes('row-level security') || msg.toLowerCase().includes('row level security');
            const mentionsTable = msg.toLowerCase().includes(`table "${tableName}"`) || msg.toLowerCase().includes(`table '${tableName}'`) || msg.toLowerCase().includes(`table ${tableName}`);
            if (!isRls || !mentionsTable) return err;
            const url = window.CONFIG?.SUPABASE_URL ? String(window.CONFIG.SUPABASE_URL) : '';
            const ref = window.CONFIG?.SUPABASE_PROJECT_REF ? String(window.CONFIG.SUPABASE_PROJECT_REF) : '';
            const key = window.CONFIG?.SUPABASE_KEY ? String(window.CONFIG.SUPABASE_KEY) : '';
            const keyType = key.startsWith('sb_') ? 'publishable' : (key.startsWith('eyJ') ? 'jwt' : 'unknown');
            return new Error(
                `Konfigurasi RLS Supabase memblokir INSERT ke tabel "${tableName}". ` +
                `Pastikan Anda pakai anon/public key yang benar untuk project Supabase yang sama, lalu pastikan policy INSERT mengizinkan anon/authenticated. ` +
                `Debug: project=${ref || '-'} keyType=${keyType} url=${url || '-'}.`
            );
        };

        // Hash password
        const password_hash = await hashPassword(password);

        const id_toko = generateUuid();

        // 2. Insert toko baru ke settings
        let tokoErr = null;
        ({ error: tokoErr } = await supabase
            .from('settings')
            .insert([{
                id_toko,
                nama_toko,
                alamat,
                no_tlp,
                email,
                owner,
                subscription_status: 'pending_payment'
            }]));
        if (tokoErr && String(tokoErr.message || tokoErr.details || '').toLowerCase().includes('subscription_status')) {
            ({ error: tokoErr } = await supabase
                .from('settings')
                .insert([{ id_toko, nama_toko, alamat, no_tlp, email, owner }]));
        }
        if (tokoErr) throw formatRlsError(tokoErr, 'settings');

        // 3. Insert entitas default: Admin & Staff
        const adminEntitasId = generateUuid();
        const staffEntitasId = generateUuid();
        const { error: entErr } = await supabase
            .from('entitas')
            .insert([
                { id_entitas: adminEntitasId, entitas: 'Admin', id_toko },
                { id_entitas: staffEntitasId, entitas: 'Staff', id_toko }
            ]);
        if (entErr) throw formatRlsError(entErr, 'entitas');

        // 4. Insert user admin pertama
        const { error: userErr } = await supabase
            .from('users')
            .insert([{
                nama_user: owner,
                username,
                password_hash,
                entitas_id: adminEntitasId,
                id_toko
            }]);
        if (userErr) {
            const msg = userErr && (userErr.message || userErr.details) ? String(userErr.message || userErr.details) : '';
            if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('unique')) {
                throw new Error('Username sudah digunakan, pilih username lain');
            }
            throw formatRlsError(userErr, 'users');
        }

        return {
            toko: { id_toko, nama_toko, alamat, no_tlp, email, owner },
            user: { username, id_toko, entitas_id: adminEntitasId }
        };
    }
};

window.registerAPI = registerAPI;
