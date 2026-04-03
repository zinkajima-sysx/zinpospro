/**
 * Simple Reactive State Management for ZinPOS Pro
 */
const appStore = {
    state: {
        activePage: 'dashboard',
        isLoading: false,
        sidebarOpen: false,
        notifications: [],
        id_toko: window.DEFAULT_ID_TOKO || 'ZIN001'
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
    
    setPage(page) {
        this.state.activePage = page;
        this.notify();
        // Scroll to top on page change
        window.scrollTo(0, 0);
    },
    
    setLoading(loading) {
        this.state.isLoading = loading;
        this.notify();
    },
    
    addNotification(message, type = 'info') {
        const id = Date.now();
        this.state.notifications.push({ id, message, type });
        this.notify();
        
        // Auto remove after 3s
        setTimeout(() => {
            this.state.notifications = this.state.notifications.filter(n => n.id !== id);
            this.notify();
        }, 3000);
    }
};

window.appStore = appStore;
