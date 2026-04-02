-- Create database
CREATE DATABASE gazcom_db;

-- Connect to database
\c gazcom_db;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table (Updated with your petroleum categories)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0
);

-- Insert your 5 main categories
INSERT INTO categories (name, description, icon, display_order) VALUES 
('PETROLEUM EQUIPMENTS', 'Pipes, valves, fittings, pumps, and other petroleum handling equipment', 'fas fa-oil-can', 1),
('PETROLEUM ELECTRICALS', 'Electrical components, wiring, lighting, and control systems for petroleum facilities', 'fas fa-bolt', 2),
('PETROL STATION PARTS AND ACCESSORIES', 'Fuel dispensers, nozzles, hoses, and station accessories', 'fas fa-gas-pump', 3),
('PETROLEUM GAS AND ACCESSORIES', 'LPG cylinders, regulators, hoses, and gas handling equipment', 'fas fa-fire', 4),
('PETROLEUM PERSONAL PROTECTIVE EQUIPMENTS', 'Safety gear, coveralls, gloves, helmets, and protective equipment', 'fas fa-hard-hat', 5);

-- Products table (Updated with petroleum-specific fields)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    sub_category VARCHAR(100),
    sku VARCHAR(50) UNIQUE,
    image_url VARCHAR(255),
    stock_quantity INTEGER DEFAULT 0,
    specifications JSONB, -- For storing technical specs
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    order_number VARCHAR(50) UNIQUE,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    shipping_address TEXT,
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Cart table
CREATE TABLE cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_password_resets_token ON password_resets(token);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_cart_user ON cart(user_id);