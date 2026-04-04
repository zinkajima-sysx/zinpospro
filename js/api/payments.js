/**
 * Payments API Layer
 */
const paymentAPI = {
    tableName: 'payments',

    async create(payment) {
        const id_toko = window.authStore?.state?.id_toko;
        if (!id_toko) throw new Error('ID toko tidak ditemukan');
        const { data, error } = await supabase
            .from(this.tableName)
            .insert([{ ...payment, id_toko }]);

        if (error) throw error;
        return data;
    }
};

window.paymentAPI = paymentAPI;
