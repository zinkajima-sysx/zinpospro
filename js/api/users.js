/**
 * Users API Layer - Manage Staff and Permissions
 */
const usersAPI = {
    tableName: 'users',

    async getAll() {
        const id_toko = window.authStore.state.id_toko;
        const { data, error } = await supabase
            .from(this.tableName)
            .select(`
                *,
                entitas:entitas_id (entitas)
            `)
            .eq('id_toko', id_toko);
            
        if (error) {
            console.error('Error fetching users:', error);
            return [];
        }
        return data || [];
    },

    async create(userData) {
        const id_toko = window.authStore.state.id_toko;
        const { data, error } = await supabase
            .from(this.tableName)
            .insert([{
                ...userData,
                id_toko
            }])
            .select();
            
        if (error) throw error;
        return data[0];
    },

    async update(id, userData) {
        const id_toko = window.authStore.state.id_toko;
        const { data, error } = await supabase
            .from(this.tableName)
            .update(userData)
            .eq('id_user', id)
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
            .eq('id_user', id)
            .eq('id_toko', id_toko);
            
        if (error) throw error;
        return true;
    }
};

window.usersAPI = usersAPI;

