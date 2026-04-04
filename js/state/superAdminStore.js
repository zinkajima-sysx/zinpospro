const superAdminStore = {
    state: {
        token: null,
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
        this.listeners.forEach(cb => cb(this.state));
    },

    async init() {
        this.state.loading = true;
        this.notify();
        this.state.token = localStorage.getItem('zinpos_superadmin_token');
        this.state.loading = false;
        this.notify();
    },

    isLoggedIn() {
        return !!this.state.token;
    },

    setToken(token) {
        this.state.token = token;
        if (token) localStorage.setItem('zinpos_superadmin_token', token);
        else localStorage.removeItem('zinpos_superadmin_token');
        this.notify();
    },

    logout() {
        this.setToken(null);
    }
};

window.superAdminStore = superAdminStore;
