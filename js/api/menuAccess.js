/**
 * Menu Access API - Hak akses menu per entitas
 */
const menuAccessAPI = {
    tableName: 'menu_access',

    async getByEntitas(id_entitas) {
        const id_toko = window.authStore.state.id_toko;
        const { data, error } = await supabase
            .from(this.tableName)
            .select('menu_id, is_visible')
            .eq('id_entitas', id_entitas)
            .eq('id_toko', id_toko);
        if (error) throw error;
        return data || [];
    },

    async saveAccess(id_entitas, menuMap) {
        // menuMap: { dashboard: 1, pos: 0, ... }
        const id_toko = window.authStore.state.id_toko;
        const rows = Object.entries(menuMap).map(([menu_id, is_visible]) => ({
            id_entitas,
            menu_id,
            is_visible,
            id_toko
        }));

        const { error } = await supabase
            .from(this.tableName)
            .upsert(rows, { onConflict: 'id_entitas,menu_id,id_toko' });
        if (error) throw error;
        return true;
    },

    async getVisibleMenus(id_entitas) {
        const rows = await this.getByEntitas(id_entitas);
        // Jika belum ada setting, anggap semua visible
        if (!rows.length) return null;
        return rows.filter(r => r.is_visible === 1).map(r => r.menu_id);
    }
};

window.menuAccessAPI = menuAccessAPI;
