/**
 * Customers API Layer
 */
const customersAPI = {
    tableName: 'customers',

    async getAll() {
        const id_toko = window.authStore.state.id_toko;
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('id_toko', id_toko)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching customers:', error);
            return [];
        }
        return data || [];
    },

    async create(customer) {
        const id_toko = window.authStore.state.id_toko;
        const { data, error } = await supabase
            .from(this.tableName)
            .insert([{ ...customer, id_toko }])
            .select();

        if (error) throw error;
        return data[0];
    },

    async update(id, customer) {
        const id_toko = window.authStore.state.id_toko;
        const { data, error } = await supabase
            .from(this.tableName)
            .update(customer)
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

window.customersAPI = customersAPI;


