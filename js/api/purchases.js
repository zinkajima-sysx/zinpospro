/**
 * Purchases (Restock) API Layer
 */
const purchasesAPI = {
    tableName: 'purchases',

    async create(purchase, items) {
        const id_toko = window.authStore.state.id_toko;
        
        // 1. Create Purchase record
        const { data: purchaseData, error: purchaseError } = await supabase
            .from(this.tableName)
            .insert([{ 
                invoice_number: purchase.invoice_number,
                supplier_id: purchase.supplier_id,
                total: purchase.total,
                id_toko 
            }])
            .select()
            .single();

        if (purchaseError) throw purchaseError;

        // 2. Create Purchase Items
        const purchaseItems = items.map(item => ({
            purchase_id: purchaseData.id,
            product_id: item.id,
            qty: item.qty,
            price: item.price,
            subtotal: item.price * item.qty,
            id_toko
        }));

        const { error: itemsError } = await supabase
            .from('purchase_items')
            .insert(purchaseItems);

        if (itemsError) throw itemsError;

        // 3. Update Product Stock (Atomic update not possible here easily, simple update)
        for (const item of items) {
            const { data: product } = await supabase
                .from('products')
                .select('stock')
                .eq('id', item.id)
                .single();
            
            if (product) {
                await supabase
                    .from('products')
                    .update({ stock: product.stock + item.qty })
                    .eq('id', item.id);
            }

            // 4. Record Stock Movement
            await supabase.from('stock_movements').insert([{
                product_id: item.id,
                type: 'IN',
                qty: item.qty,
                reference_id: purchaseData.id,
                reference_type: 'PURCHASE',
                id_toko
            }]);
        }

        return purchaseData;
    },

    async getAll() {
        const id_toko = window.authStore.state.id_toko;
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*, suppliers(name)')
            .eq('id_toko', id_toko)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }
};

window.purchasesAPI = purchasesAPI;
