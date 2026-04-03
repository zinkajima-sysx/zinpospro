/**
 * Navbar Component (Pill Style)
 */
const Navbar = {
    render() {
        const userRole    = window.authStore.state.userRole;
        const entitasId   = window.authStore.state.entitasId;
        const accessCache = window.authStore.state.menuAccess || null; // null = belum load, [] = sudah load

        const allItems = [
            { id: 'dashboard', label: 'Dashboard', icon: 'layout-grid' },
            { id: 'pos',       label: 'Kasir',     icon: 'shopping-cart' },
            { id: 'purchase',  label: 'Restock',   icon: 'package-plus' },
            { id: 'expense',   label: 'Biaya',     icon: 'calculator' },
            { id: 'debt',      label: 'Piutang',   icon: 'wallet' },
            { id: 'report',    label: 'Laporan',   icon: 'bar-chart-2' },
            { id: 'settings',  label: 'Master',    icon: 'settings' },
        ];

        // Filter berdasarkan menu_access jika sudah dimuat
        const menuItems = accessCache
            ? allItems.filter(item => accessCache.includes(item.id))
            : allItems;

        const activePage = window.appStore.state.activePage;

        return menuItems.map(item => `
            <button class="nav-item ${activePage === item.id ? 'active' : ''}" 
                    onclick="window.appStore.setPage('${item.id}')">
                <i data-lucide="${item.icon}"></i>
                <span>${item.label}</span>
            </button>
        `).join('');
    },

    mount() {
        const navContainer = document.getElementById('navbar');
        if (navContainer) {
            navContainer.innerHTML = this.render();
            if (window.lucide) window.lucide.createIcons();
        }
    }
};

window.Navbar = Navbar;

window.appStore.subscribe(() => {
    Navbar.mount();
});
