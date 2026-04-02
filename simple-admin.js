const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'gazcom_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
});

async function createSimpleAdmin() {
    const password = 'password123';  // Simpler password
    const hash = await bcrypt.hash(password, 10);
    
    console.log('Creating admin with password:', password);
    
    // Delete existing
    await pool.query("DELETE FROM users WHERE username = 'gazcom_admin'");
    
    // Create new
    await pool.query(`
        INSERT INTO users (username, email, password_hash, full_name, phone, role) 
        VALUES ($1, $2, $3, $4, $5, 'admin')
    `, ['gazcom_admin', 'gazcom.gm@gmail.com', hash, 'GAZCOM Administrator', '+254724515819']);
    
    console.log('✅ Admin created!');
    console.log('Username: gazcom_admin');
    console.log('Password: password123');
    
    // Verify
    const result = await pool.query("SELECT password_hash FROM users WHERE username = 'gazcom_admin'");
    const isValid = await bcrypt.compare(password, result.rows[0].password_hash);
    console.log('Verification:', isValid ? '✅ Works!' : '❌ Failed');
    
    process.exit(0);
}

createSimpleAdmin();