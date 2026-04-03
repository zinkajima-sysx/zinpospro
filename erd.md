erDiagram

    SETTINGS ||--o{ ENTITAS : "has roles"
    SETTINGS ||--o{ USERS : "has users"
    SETTINGS ||--o{ CATEGORIES : "has categories"
    SETTINGS ||--o{ PRODUCTS : "has products"
    SETTINGS ||--o{ SUPPLIERS : "has suppliers"
    SETTINGS ||--o{ CUSTOMERS : "has customers"
    SETTINGS ||--o{ SALES : "records sales"
    SETTINGS ||--o{ PURCHASES : "records purchases"
    SETTINGS ||--o{ EXPENSES : "tracks expenses"

    ENTITAS ||--o{ USERS : "role for"

    CATEGORIES ||--o{ PRODUCTS : "contains"

    PRODUCTS ||--o{ SALE_ITEMS : "sold in"
    PRODUCTS ||--o{ PURCHASE_ITEMS : "bought in"
    PRODUCTS ||--o{ STOCK_MOVEMENTS : "stock tracked"

    SALES ||--o{ SALE_ITEMS : "contains"
    SALES ||--o{ PAYMENTS : "paid with"

    PURCHASES ||--o{ PURCHASE_ITEMS : "contains"

    SUPPLIERS ||--o{ PURCHASES : "provides"

    CUSTOMERS ||--o{ RECEIVABLES : "owes"

    SETTINGS {
        uuid id_toko PK
        string nama_toko
        string alamat
        string no_tlp
        string email
        string owner
        timestamptz created_at
    }

    ENTITAS {
        uuid id_entitas PK
        string entitas
        uuid id_toko FK
        timestamptz created_at
    }

    USERS {
        uuid id_user PK
        string nama_user
        string username
        string password
        uuid entitas_id FK
        uuid id_toko FK
        timestamptz created_at
    }

    CATEGORIES {
        bigint id PK
        string name
        uuid id_toko FK
        timestamptz created_at
    }

    PRODUCTS {
        bigint id PK
        string name
        string sku
        bigint category_id FK
        numeric purchase_price
        numeric selling_price
        integer min_stock
        integer stock
        string unit
        uuid id_toko FK
        timestamptz created_at
    }

    SUPPLIERS {
        bigint id PK
        string name
        string phone
        string address
        uuid id_toko FK
        timestamptz created_at
    }

    CUSTOMERS {
        bigint id PK
        string name
        string phone
        string address
        uuid id_toko FK
        timestamptz created_at
    }

    SALES {
        bigint id PK
        string invoice_number
        bigint customer_id FK
        numeric subtotal
        numeric discount
        numeric tax
        numeric total
        numeric paid_amount
        numeric change_amount
        string payment_method
        string status
        string sync_status
        string device_id
        uuid id_toko FK
        timestamptz created_at
    }

    SALE_ITEMS {
        bigint id PK
        bigint sale_id FK
        bigint product_id FK
        integer qty
        numeric price
        numeric subtotal
        uuid id_toko FK
        timestamptz created_at
    }

    PAYMENTS {
        bigint id PK
        bigint sale_id FK
        numeric amount
        string method
        uuid id_toko FK
        timestamptz created_at
    }

    PURCHASES {
        bigint id PK
        string invoice_number
        bigint supplier_id FK
        numeric total
        string sync_status
        string device_id
        uuid id_toko FK
        timestamptz created_at
    }

    PURCHASE_ITEMS {
        bigint id PK
        bigint purchase_id FK
        bigint product_id FK
        integer qty
        numeric price
        numeric subtotal
        uuid id_toko FK
        timestamptz created_at
    }

    STOCK_MOVEMENTS {
        bigint id PK
        bigint product_id FK
        string type
        integer qty
        bigint reference_id
        string reference_type
        uuid id_toko FK
        timestamptz created_at
    }

    RECEIVABLES {
        bigint id PK
        bigint customer_id FK
        numeric jumlah_piutang
        string status
        uuid id_toko FK
        timestamptz created_at
    }

    EXPENSES {
        bigint id PK
        bigint category_id
        string description
        numeric amount
        uuid id_toko FK
        timestamptz created_at
    }