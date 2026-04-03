/**
 * Register API - Daftarkan toko baru beserta admin pertama
 */
const registerAPI = {

    async registerToko({ nama_toko, alamat, no_tlp, email, owner, username, password }) {
        // Cek username sudah ada atau belum
        const { data: existing } = await supabase
            .from('users').select('id_user').eq('username', username).maybeSingle();
        if (existing) throw new Error('Username sudah digunakan, pilih username lain');

        // Hash password
        const password_hash = await hashPassword(password);

        // 2. Insert toko baru ke settings
        const { data: toko, error: tokoErr } = await supabase
            .from('settings')
            .insert([{ nama_toko, alamat, no_tlp, email, owner }])
            .select()
            .single();
        if (tokoErr) throw tokoErr;

        const id_toko = toko.id_toko;

        // 3. Insert entitas default: Admin & Staff
        const { data: entitasList, error: entErr } = await supabase
            .from('entitas')
            .insert([
                { entitas: 'Admin', id_toko },
                { entitas: 'Staff', id_toko }
            ])
            .select();
        if (entErr) throw entErr;

        const adminEntitas = entitasList.find(e => e.entitas === 'Admin');

        // 4. Insert user admin pertama
        const { data: user, error: userErr } = await supabase
            .from('users')
            .insert([{
                nama_user: owner,
                username,
                password_hash,
                entitas_id: adminEntitas.id_entitas,
                id_toko
            }])
            .select().single();
        if (userErr) throw userErr;

        return { toko, user };
    }
};

window.registerAPI = registerAPI;
