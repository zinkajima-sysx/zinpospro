/**
 * Supplier API Layer - CRUD for Suppliers
 */
const suppliersAPI = {
    tableName: 'suppliers',

    async getAll() {
        const id_toko = window.authStore.state.id_toko;
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('id_toko', id_toko)
            .order('name', { ascending: true });
            
        if (error) {
            console.error('Error fetching suppliers:', error);
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

    async create(supplierData) {
        const id_toko = window.authStore.state.id_toko;
        const { data, error } = await supabase
            .from(this.tableName)
            .insert([{
                ...supplierData,
                id_toko
            }])
            .select();
            
        if (error) throw error;
        return data[0];
    },

    async update(id, supplierData) {
        const id_toko = window.authStore.state.id_toko;
        const { data, error } = await supabase
            .from(this.tableName)
            .update(supplierData)
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

window.suppliersAPI = suppliersAPI;

