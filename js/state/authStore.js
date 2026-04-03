/**
 * Auth Store for Supabase Session Management
 */
const authStore = {
    state: {
        user: null,
        session: null,
        userRole: null,
        userName: null,
        entitasId: null,
        id_toko: null,
        menuAccess: null, // null = belum load, array = sudah load
        loading: true
    },
    
    listeners: [],
    
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    },
    
    notify() {
        this.listeners.forEach(callback => callback(this.state));
    },
    
    async init() {
        this.state.loading = true;
        this.notify();

        // Check local storage for custom session
        const savedUser = localStorage.getItem('zinpos_user');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                this.state.user = userData;
                this.state.userRole  = userData.entitas?.entitas || 'Staff';
                this.state.userName  = userData.nama_user || userData.username;
                this.state.entitasId = userData.entitas_id || null;
                this.state.id_toko   = userData.id_toko || (window.CONFIG ? window.CONFIG.APP.DEFAULT_TOKO : null);

                // Restore RLS context
                if (this.state.id_toko) {
                    await supabase.rpc('set_current_toko', { p_id_toko: this.state.id_toko });
                }

                await this._loadMenuAccess();
            } catch (e) {
                localStorage.removeItem('zinpos_user');
            }
        }
        
        this.state.loading = false;
        this.notify();
    },

    async login(username, password) {
        // Hash password sebelum query
        const hashed = await hashPassword(password);

        const { data, error } = await window.supabase
            .from('users')
            .select(`*, entitas:entitas_id (entitas)`)
            .eq('username', username)
            .eq('password_hash', hashed)
            .single();

        if (error || !data) {
            console.error('Login error:', error);
            throw new Error('Invalid credentials');
        }

        this.state.user      = data;
        this.state.userRole  = data.entitas?.entitas || 'Staff';
        this.state.userName  = data.nama_user || data.username;
        this.state.entitasId = data.entitas_id || null;
        this.state.id_toko   = data.id_toko || (window.CONFIG ? window.CONFIG.APP.DEFAULT_TOKO : 'ZIN001');

        localStorage.setItem('zinpos_user', JSON.stringify(data));

        // Set RLS context di Supabase agar isolasi per toko aktif
        await supabase.rpc('set_current_toko', { p_id_toko: this.state.id_toko });

        await this._loadMenuAccess();
        
        this.notify();
        return data;
    },

    async logout() {
        this.state.user        = null;
        this.state.userRole    = null;
        this.state.userName    = null;
        this.state.entitasId   = null;
        this.state.id_toko     = null;
        this.state.menuAccess  = null;
        localStorage.removeItem('zinpos_user');
        this.notify();
    },

    async _loadMenuAccess() {
        try {
            const entitasId = this.state.entitasId;
            if (!entitasId || !window.menuAccessAPI) {
                this.state.menuAccess = null; // null = tampilkan semua
                return;
            }
            const rows = await window.menuAccessAPI.getByEntitas(entitasId);
            if (!rows.length) {
                this.state.menuAccess = null; // belum ada setting = tampilkan semua
            } else {
                this.state.menuAccess = rows.filter(r => r.is_visible === 1).map(r => r.menu_id);
            }
        } catch (e) {
            console.error('menuAccess load error:', e);
            this.state.menuAccess = null;
        }
    },

    isLoggedIn() {
        return !!this.state.user;
    }
};

window.authStore = authStore;
// Initialization will be triggered by App.init to ensure dependencies are loaded
