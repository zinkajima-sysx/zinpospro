/**
 * Product API Layer - Interacts with Supabase 'products' table
 */
const productsAPI = {
    tableName: 'products',

    async getAll() {
        const id_toko = window.authStore.state.id_toko;
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*, categories(name)')
            .eq('id_toko', id_toko)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching products:', error);
            return [];
        }
        return data || [];
    },

    async getById(id) {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(product) {
        const id_toko = window.authStore.state.id_toko;

        // Check duplicate name
        const { data: existing } = await supabase
            .from(this.tableName)
            .select('id')
            .eq('name', product.name)
            .eq('id_toko', id_toko)
            .maybeSingle();
        if (existing) throw new Error(`Produk "${product.name}" sudah ada`);

        const { data, error } = await supabase
            .from(this.tableName)
            .insert([{ ...product, id_toko }])
            .select();

        if (error) throw error;
        return data[0];
    },

    async checkDuplicates(names) {
        const id_toko = window.authStore.state.id_toko;
        const { data } = await supabase
            .from(this.tableName)
            .select('name')
            .in('name', names)
            .eq('id_toko', id_toko);
        return (data || []).map(d => d.name);
    },

    async update(id, updates) {
        const id_toko = window.authStore.state.id_toko;
        const { data, error } = await supabase
            .from(this.tableName)
            .update(updates)
            .eq('id', id)
            .eq('id_toko', id_toko)
            .select();

        if (error) throw error;
        return data[0];
    },

    async delete(id) {
        const id_toko = window.authStore.state.id_toko;
        const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq('id', id)
            .eq('id_toko', id_toko);

        if (error) throw error;
        return true;
    }
};

window.productsAPI = productsAPI;

