/**
 * Sales API Layer
 */
const salesAPI = {
    tableName: 'sales',

    async create(sale, items) {
        const id_toko = window.authStore.state.id_toko;
        
        // 1. Create Sale record
        const { data: saleData, error: saleError } = await supabase
            .from(this.tableName)
            .insert([{ ...sale, id_toko }])
            .select()
            .single();

        if (saleError) throw saleError;

        // 2. Create Sale Items
        const saleItems = items.map(item => ({
            sale_id: saleData.id,
            product_id: item.id,
            qty: item.qty,
            price: item.price,
            subtotal: item.price * item.qty,
            id_toko
        }));

        const { error: itemsError } = await supabase
            .from('sale_items')
            .insert(saleItems);

        if (itemsError) throw itemsError;

        // 3. Reduce Product Stock & record movement
        for (const item of items) {
            const { data: product } = await supabase
                .from('products')
                .select('stock')
                .eq('id', item.id)
                .single();

            if (product) {
                await supabase
                    .from('products')
                    .update({ stock: Math.max(0, product.stock - item.qty) })
                    .eq('id', item.id);
            }

            await supabase.from('stock_movements').insert([{
                product_id: item.id,
                type: 'OUT',
                qty: item.qty,
                reference_id: saleData.id,
                reference_type: 'SALE',
                id_toko
            }]);
        }

        // 4. Jika metode Piutang, insert ke tabel receivables
        if (sale.payment_method === 'Piutang' && sale.customer_id) {
            const { error: recvError } = await supabase
                .from('receivables')
                .insert([{
                    customer_id: sale.customer_id,
                    jumlah_piutang: sale.total,
                    sisa_piutang: sale.total,
                    paid_amount: 0,
                    status: 'unpaid',
                    invoice_number: sale.invoice_number,
                    sale_id: saleData.id,
                    id_toko
                }]);
            if (recvError) console.error('Receivable insert error:', recvError);
        }

        return saleData;
    },

    async getHistory() {
        const id_toko = window.authStore.state.id_toko;
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*, customers(name)')
            .eq('id_toko', id_toko)
            .order('created_at', { ascending: false });

        if (error) return [];
        return data;
    }
};

window.salesAPI = salesAPI;
