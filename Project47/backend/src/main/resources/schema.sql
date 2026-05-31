CREATE TABLE IF NOT EXISTS products_seq (next_val INTEGER);
INSERT OR IGNORE INTO products_seq (next_val) VALUES (1);

CREATE TABLE IF NOT EXISTS evidence_seq (next_val INTEGER);
INSERT OR IGNORE INTO evidence_seq (next_val) VALUES (1);

CREATE TABLE IF NOT EXISTS legal_cases_seq (next_val INTEGER);
INSERT OR IGNORE INTO legal_cases_seq (next_val) VALUES (1);

CREATE TABLE IF NOT EXISTS copyright_works_seq (next_val INTEGER);
INSERT OR IGNORE INTO copyright_works_seq (next_val) VALUES (1);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    platform TEXT NOT NULL,
    product_url TEXT NOT NULL,
    seller_name TEXT,
    price REAL,
    currency TEXT,
    image_url TEXT,
    description TEXT,
    infringement_status TEXT NOT NULL DEFAULT 'PENDING',
    infringement_score INTEGER,
    detected_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evidence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT,
    file_hash TEXT,
    file_size INTEGER,
    description TEXT,
    notary_id TEXT,
    notarized_at TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'COLLECTED',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS legal_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_number TEXT NOT NULL UNIQUE,
    product_id INTEGER NOT NULL,
    case_title TEXT NOT NULL,
    case_description TEXT,
    plaintiff TEXT,
    defendant TEXT,
    attorney TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    case_type TEXT,
    filed_at TIMESTAMP,
    court_date TIMESTAMP,
    closed_at TIMESTAMP,
    result TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS copyright_works (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_name TEXT NOT NULL,
    work_type TEXT NOT NULL,
    owner TEXT NOT NULL,
    registration_number TEXT,
    registration_date TIMESTAMP,
    description TEXT,
    keywords TEXT,
    image_urls TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
