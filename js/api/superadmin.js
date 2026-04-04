const superAdminAPI = {
    async login(username, password) {
        const res = await fetch('/api/superadmin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || 'Login gagal');
        if (!json.token) throw new Error('Token tidak ditemukan');
        return json.token;
    },

    async listStores({ q = '', status = 'all', includeDeleted = false } = {}) {
        const token = window.superAdminStore?.state?.token;
        if (!token) throw new Error('Belum login superadmin');
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (status) params.set('status', status);
        if (includeDeleted) params.set('includeDeleted', '1');

        let res;
        try {
            res = await fetch(`/api/superadmin/stores?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (e) {
            throw new Error('Gagal menghubungi endpoint superadmin. Pastikan deployment Vercel sudah terbaru dan env SUPABASE_SERVICE_ROLE_KEY sudah di-set.');
        }
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
            const detail = json.detail ? ` (${typeof json.detail === 'string' ? json.detail : JSON.stringify(json.detail)})` : '';
            throw new Error((json.error || 'Gagal memuat data toko') + detail);
        }
        return json.data || [];
    },

    async updateStoreStatus(id_toko, status, reason = '') {
        const token = window.superAdminStore?.state?.token;
        if (!token) throw new Error('Belum login superadmin');
        const res = await fetch('/api/superadmin/store', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ id_toko, status, reason })
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
            const detail = json.detail ? ` (${typeof json.detail === 'string' ? json.detail : JSON.stringify(json.detail)})` : '';
            throw new Error((json.error || 'Gagal mengubah status') + detail);
        }
        return json.data;
    },

    async softDeleteStore(id_toko, reason = '') {
        const token = window.superAdminStore?.state?.token;
        if (!token) throw new Error('Belum login superadmin');
        const res = await fetch('/api/superadmin/store', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ id_toko, reason })
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
            const detail = json.detail ? ` (${typeof json.detail === 'string' ? json.detail : JSON.stringify(json.detail)})` : '';
            throw new Error((json.error || 'Gagal menghapus toko') + detail);
        }
        return json.data;
    },
    async getLogs(id_toko, limit = 30) {
        const token = window.superAdminStore?.state?.token;
        if (!token) throw new Error('Belum login superadmin');
        const params = new URLSearchParams({ id_toko, limit: String(limit) });
        const res = await fetch(`/api/superadmin/logs?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
            const detail = json.detail ? ` (${typeof json.detail === 'string' ? json.detail : JSON.stringify(json.detail)})` : '';
            throw new Error((json.error || 'Gagal memuat audit log') + detail);
        }
        return json.data || [];
    }
};

window.superAdminAPI = superAdminAPI;
