/**
 * Payments API Layer
 */
const paymentAPI = {
    tableName: 'payments',

    async create(payment) {
        const id_toko = window.appStore.state.id_toko;
        const { data, error } = await supabase
            .from(this.tableName)
            .insert([{ ...payment, id_toko }]);

        if (error) throw error;
        return data;
    }
};

window.paymentAPI = paymentAPI;
