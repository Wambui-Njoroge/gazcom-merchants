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

async function testAdminLogin() {
    try {
        // Get the admin user
        const result = await pool.query(
            "SELECT username, email, password_hash FROM users WHERE username = 'gazcom_admin'"
        );
        
        if (result.rows.length === 0) {
            console.log('❌ Admin user not found!');
            return;
        }
        
        const user = result.rows[0];
        console.log('User found:', user.username);
        console.log('Hash in DB:', user.password_hash);
        
        // Test the password
        const isValid = await bcrypt.compare('admin123', user.password_hash);
        console.log('\nTesting password "admin123":', isValid ? '✅ VALID' : '❌ INVALID');
        
        if (isValid) {
            console.log('\n🎉 SUCCESS! You can now login with:');
            console.log('   Username: gazcom_admin');
            console.log('   Password: admin123');
        } else {
            console.log('\n❌ Still not working. Let me generate a new hash manually.');
            
            // Generate a fresh hash
            const freshHash = await bcrypt.hash('admin123', 10);
            console.log('\nTry this SQL:');
            console.log(`UPDATE users SET password_hash = '${freshHash}' WHERE username = 'gazcom_admin';`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

testAdminLogin();