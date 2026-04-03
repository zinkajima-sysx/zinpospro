/**
 * General Application Configuration
 */
const appConfig = {
    appName: 'ZinPOS Pro',
    version: '1.0.0',
    defaultStoreId: 'ZIN001',
    theme: {
        primary: '#6366f1',
        secondary: '#64748b',
        radius: '20px'
    },
    // Store Profile Persistence

    store: JSON.parse(localStorage.getItem('zinpos_store_config')) || {
        name: 'ZinPOS Pro Station',
        address: 'Jl. Raya No. 123, Indonesia',
        phone: '081234567890',
        footer: 'Terima kasih telah berbelanja!'
    },

    saveStoreConfig(config) {
        this.store = config;
        localStorage.setItem('zinpos_store_config', JSON.stringify(config));
    }
};


window.appConfig = appConfig;
