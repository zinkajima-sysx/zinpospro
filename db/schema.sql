-- =====================================================
-- WARUNG PRO POS - FINAL SUPABASE SCHEMA
-- =====================================================

create extension if not exists "uuid-ossp";

-- =====================================================
-- SETTINGS (TOKO)
-- =====================================================

create table settings (
    id_toko uuid primary key default uuid_generate_v4(),
    nama_toko text not null,
    alamat text,
    no_tlp text,
    email text,
    owner text,
    status text default 'active',
    suspend_reason text,
    suspended_at timestamptz,
    deleted_at timestamptz,
    created_at timestamptz default now()
);

create table if not exists admin_audit_logs (
    id bigserial primary key,
    id_toko uuid references settings(id_toko) on delete set null,
    action text not null,
    from_status text,
    to_status text,
    reason text,
    performed_by text,
    created_at timestamptz default now()
);

do $$
begin
    if not exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'settings'
          and column_name = 'status'
    ) then
        alter table public.settings add column status text default 'active';
    end if;
    if not exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'settings'
          and column_name = 'suspend_reason'
    ) then
        alter table public.settings add column suspend_reason text;
    end if;
    if not exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'settings'
          and column_name = 'suspended_at'
    ) then
        alter table public.settings add column suspended_at timestamptz;
    end if;
    if not exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'settings'
          and column_name = 'deleted_at'
    ) then
        alter table public.settings add column deleted_at timestamptz;
    end if;
end $$;

do $$
begin
    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'settings'
          and policyname = 'settings_insert_public'
    ) then
        create policy settings_insert_public
        on public.settings
        for insert
        to anon, authenticated
        with check (true);
    end if;
end $$;

-- =====================================================
-- ENTITAS (ROLE USER)
-- =====================================================

create table entitas (
    id_entitas uuid primary key default uuid_generate_v4(),
    entitas text not null,
    id_toko uuid references settings(id_toko) on delete cascade,
    created_at timestamptz default now()
);

-- =====================================================
-- USERS
-- =====================================================

create table users (
    id_user uuid primary key default uuid_generate_v4(),
    nama_user text not null,
    username text unique not null,
    password_hash text not null,
    entitas_id uuid references entitas(id_entitas),
    id_toko uuid references settings(id_toko) on delete cascade,
    created_at timestamptz default now()
);

create index idx_users_entitas on users(entitas_id);

-- =====================================================
-- CATEGORIES
-- =====================================================

create table categories (
    id bigserial primary key,
    name text not null,
    id_toko uuid references settings(id_toko) on delete cascade,
    created_at timestamptz default now()
);

create index idx_categories_toko on categories(id_toko);

-- =====================================================
-- PRODUCTS
-- =====================================================

create table products (
    id bigserial primary key,
    name text not null,
    sku text,
    category_id bigint references categories(id),
    purchase_price numeric default 0,
    selling_price numeric not null,
    min_stock integer default 0,
    stock integer default 0,
    unit text,
    id_toko uuid references settings(id_toko) on delete cascade,
    created_at timestamptz default now()
);

create index idx_products_toko on products(id_toko);

-- =====================================================
-- SUPPLIERS
-- =====================================================

create table suppliers (
    id bigserial primary key,
    name text not null,
    phone text,
    address text,
    id_toko uuid references settings(id_toko) on delete cascade,
    created_at timestamptz default now()
);

-- =====================================================
-- CUSTOMERS
-- =====================================================

create table customers (
    id bigserial primary key,
    name text not null,
    phone text,
    address text,
    id_toko uuid references settings(id_toko) on delete cascade,
    created_at timestamptz default now()
);

-- =====================================================
-- SALES
-- =====================================================

create table sales (
    id bigserial primary key,
    invoice_number text not null,
    customer_id bigint references customers(id),

    subtotal numeric default 0,
    discount numeric default 0,
    tax numeric default 0,
    total numeric not null,

    paid_amount numeric default 0,
    change_amount numeric default 0,

    payment_method text,
    status text default 'completed',

    sync_status text default 'pending',
    device_id text,

    id_toko uuid references settings(id_toko) on delete cascade,

    created_at timestamptz default now()
);

create index idx_sales_toko on sales(id_toko);

-- =====================================================
-- SALE ITEMS
-- =====================================================

create table sale_items (
    id bigserial primary key,
    sale_id bigint references sales(id) on delete cascade,
    product_id bigint references products(id),
    qty integer not null,
    price numeric not null,
    subtotal numeric not null,
    id_toko uuid references settings(id_toko) on delete cascade,
    created_at timestamptz default now()
);

create index idx_sale_items_sale on sale_items(sale_id);

-- =====================================================
-- PAYMENTS
-- =====================================================

create table payments (
    id bigserial primary key,
    sale_id bigint references sales(id) on delete cascade,
    amount numeric not null,
    method text,
    id_toko uuid references settings(id_toko) on delete cascade,
    created_at timestamptz default now()
);

-- =====================================================
-- PURCHASES
-- =====================================================

create table purchases (
    id bigserial primary key,
    invoice_number text,
    supplier_id bigint references suppliers(id),

    total numeric not null,

    sync_status text default 'pending',
    device_id text,

    id_toko uuid references settings(id_toko) on delete cascade,

    created_at timestamptz default now()
);

create index idx_purchase_toko on purchases(id_toko);

-- =====================================================
-- PURCHASE ITEMS
-- =====================================================

create table purchase_items (
    id bigserial primary key,
    purchase_id bigint references purchases(id) on delete cascade,
    product_id bigint references products(id),
    qty integer not null,
    price numeric not null,
    subtotal numeric not null,
    id_toko uuid references settings(id_toko) on delete cascade,
    created_at timestamptz default now()
);

create index idx_purchase_items_purchase on purchase_items(purchase_id);

-- =====================================================
-- STOCK MOVEMENTS
-- =====================================================

create table stock_movements (
    id bigserial primary key,
    product_id bigint references products(id),

    type text not null,
    qty integer not null,

    reference_id bigint,
    reference_type text,

    id_toko uuid references settings(id_toko) on delete cascade,

    created_at timestamptz default now()
);

create index idx_stock_product on stock_movements(product_id);

-- =====================================================
-- RECEIVABLES
-- =====================================================

create table receivables (
    id bigserial primary key,
    customer_id bigint references customers(id),

    jumlah_piutang numeric not null,
    status text default 'unpaid',

    id_toko uuid references settings(id_toko) on delete cascade,

    created_at timestamptz default now()
);

-- =====================================================
-- EXPENSES
-- =====================================================

create table expenses (
    id bigserial primary key,
    category_id bigint,
    description text,
    amount numeric not null,

    id_toko uuid references settings(id_toko) on delete cascade,

    created_at timestamptz default now()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

alter table products enable row level security;
alter table categories enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table purchases enable row level security;
alter table purchase_items enable row level security;
alter table payments enable row level security;
alter table suppliers enable row level security;
alter table customers enable row level security;
alter table expenses enable row level security;
alter table receivables enable row level security;
alter table stock_movements enable row level security;

-- =====================================================
-- BASIC RLS POLICY (TOKO ISOLATION)
-- =====================================================

create policy toko_isolation_products
on products
for all
using (id_toko = auth.jwt() ->> 'id_toko');

create policy toko_isolation_sales
on sales
for all
using (id_toko = auth.jwt() ->> 'id_toko');

create policy toko_isolation_purchases
on purchases
for all
using (id_toko = auth.jwt() ->> 'id_toko');
