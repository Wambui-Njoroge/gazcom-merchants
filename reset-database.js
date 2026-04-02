const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'gazcom_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
});

async function resetDatabase() {
    try {
        console.log('🔄 Resetting database...\n');
        
        // Delete all orders and cart items
        await pool.query('DELETE FROM order_items');
        await pool.query('DELETE FROM orders');
        await pool.query('DELETE FROM cart');
        console.log('✅ Cleared orders and cart');
        
        // Delete all regular users
        await pool.query("DELETE FROM users WHERE role = 'user'");
        console.log('✅ Deleted regular users');
        
        // Ensure admin users exist with correct passwords
        const adminHash = '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrC7JqE5hJkYwXcMZ5xYpXq8vWxYzK6';
        
        // Update or create admin
        await pool.query(`
            INSERT INTO users (username, email, password_hash, full_name, phone, role) 
            VALUES ('admin', 'admin@gazcom.com', $1, 'System Administrator', '254700000000', 'admin')
            ON CONFLICT (username) DO UPDATE SET password_hash = $1, role = 'admin'
        `, [adminHash]);
        
        await pool.query(`
            INSERT INTO users (username, email, password_hash, full_name, phone, role) 
            VALUES ('gazcom_admin', 'gazcom.gm@gmail.com', $1, 'GAZCOM Administrator', '+254724515819', 'admin')
            ON CONFLICT (username) DO UPDATE SET password_hash = $1, role = 'admin'
        `, [adminHash]);
        
        console.log('✅ Admin users ready');
        
        // Show remaining users
        const users = await pool.query('SELECT id, username, email, role FROM users');
        console.log('\n📋 Current users:');
        users.rows.forEach(user => {
            console.log(`   - ${user.username} (${user.role}): ${user.email}`);
        });
        
        console.log('\n✅ Database reset complete!');
        console.log('\n🔑 Login credentials:');
        console.log('   Admin 1: admin / admin123');
        console.log('   Admin 2: gazcom_admin / admin123');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

resetDatabase();