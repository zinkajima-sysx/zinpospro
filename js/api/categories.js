/**
 * Categories API Layer
 */
const categoryAPI = {
    tableName: 'categories',

    async getAll() {
        const id_toko = window.authStore.state.id_toko;
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('id_toko', id_toko)
            .order('name', { ascending: true });
        if (error) return [];
        return data;
    },

    async create(name) {
        const id_toko = window.authStore.state.id_toko;
        // Cek duplikat
        const { data: existing } = await supabase
            .from(this.tableName).select('id').eq('name', name).eq('id_toko', id_toko).maybeSingle();
        if (existing) throw new Error(`Kategori "${name}" sudah ada`);

        const { data, error } = await supabase
            .from(this.tableName).insert([{ name, id_toko }]).select().single();
        if (error) throw error;
        return data;
    },

    async update(id, name) {
        const id_toko = window.authStore.state.id_toko;
        const { data, error } = await supabase
            .from(this.tableName).update({ name }).eq('id', id).eq('id_toko', id_toko).select().single();
        if (error) throw error;
        return data;
    },

    async delete(id) {
        const id_toko = window.authStore.state.id_toko;
        const { error } = await supabase
            .from(this.tableName).delete().eq('id', id).eq('id_toko', id_toko);
        if (error) throw error;
    }
};

window.categoryAPI = categoryAPI;
