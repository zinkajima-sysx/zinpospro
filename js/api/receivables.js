/**
 * Receivables (Piutang) API Layer
 */
const receivablesAPI = {
    tableName: 'receivables',

    async getAll() {
        const id_toko = window.authStore.state.id_toko;
        const { data, error } = await supabase
            .from(this.tableName)
            .select(`*, customers(name, phone)`)
            .eq('id_toko', id_toko)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async updateStatus(id, status) {
        const { data, error } = await supabase
            .from(this.tableName)
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async bayar(id, jumlahBayar) {
        const { data: rec, error: fetchErr } = await supabase
            .from(this.tableName).select('sisa_piutang, paid_amount').eq('id', id).single();
        if (fetchErr) throw fetchErr;

        const sisaLama = parseFloat(rec.sisa_piutang) || 0;
        const paidLama = parseFloat(rec.paid_amount)  || 0;
        const bayar    = Math.min(jumlahBayar, sisaLama);
        const sisaBaru = Math.max(0, sisaLama - bayar);
        const paidBaru = paidLama + bayar;
        const status   = sisaBaru <= 0 ? 'paid' : 'unpaid';

        const { data, error } = await supabase
            .from(this.tableName)
            .update({ sisa_piutang: sisaBaru, paid_amount: paidBaru, status })
            .eq('id', id).select().single();
        if (error) throw error;
        return data;
    },

    async delete(id) {
        const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

window.receivablesAPI = receivablesAPI;
