/**
 * Cart Store for managing Kasir items
 */
const cartStore = {
    state: {
        items: [],
        total: 0,
        customer: null,
        paymentMethod: 'Tunai'
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
    
    calculateTotal() {
        this.state.total = this.state.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    },
    
    addItem(product) {
        const existing = this.state.items.find(item => item.id === product.id);
        if (existing) {
            existing.qty += 1;
        } else {
            this.state.items.push({
                ...product,
                qty: 1
            });
        }
        this.calculateTotal();
        this.notify();
    },
    
    removeItem(productId) {
        this.state.items = this.state.items.filter(item => item.id !== productId);
        this.calculateTotal();
        this.notify();
    },
    
    updateQty(productId, qty) {
        const item = this.state.items.find(item => item.id === productId);
        if (item) {
            item.qty = Math.max(0, qty);
            if (item.qty === 0) {
                this.removeItem(productId);
            }
        }
        this.calculateTotal();
        this.notify();
    },
    
    clear() {
        this.state.items = [];
        this.state.total = 0;
        this.state.customer = null;
        this.notify();
    }
};

window.cartStore = cartStore;
