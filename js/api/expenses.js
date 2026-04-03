/**
 * Expenses API Layer
 */
const expensesAPI = {
    tableName: 'expenses',

    async getAll() {
        const id_toko = window.authStore.state.id_toko;
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('id_toko', id_toko)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async create(expense) {
        const id_toko = window.authStore.state.id_toko;
        const { data, error } = await supabase
            .from(this.tableName)
            .insert([{ 
                category_name: expense.category_name || expense.category_id || null,
                description: expense.description,
                amount: expense.amount,
                id_toko 
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
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

window.expensesAPI = expensesAPI;
