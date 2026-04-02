const { Pool } = require('pg');
require('dotenv').config();

console.log('🔧 GAZCOM Database Password Reset Tool');
console.log('=======================================\n');

// Use your PostgreSQL settings (port 5433 as you mentioned)
const pool = new Pool({
    host: 'localhost',
    port: 5433,
    database: 'gazcom_db',
    user: 'postgres',
    password: 'postgres', // Change this if your PostgreSQL password is different
});

async function resetAdminPassword() {
    try {
        console.log('📡 Connecting to PostgreSQL on port 5433...');
        
        // Test connection
        const testConn = await pool.query('SELECT NOW()');
        console.log('✅ Database connected successfully!\n');
        
        // Check if users table exists
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'users'
            );
        `);
        
        if (!tableCheck.rows[0].exists) {
            console.log('❌ Users table does not exist!');
            console.log('Please run the schema.sql first to create tables.');
            process.exit(1);
        }
        
        // Check existing users
        const existingUsers = await pool.query('SELECT id, username, email, role FROM users');
        console.log(`📋 Found ${existingUsers.rows.length} existing user(s):`);
        existingUsers.rows.forEach(user => {
            console.log(`   - ${user.username} (${user.role}): ${user.email}`);
        });
        console.log('');
        
        // Update or create admin
        const adminHash = '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrC7JqE5hJkYwXcMZ5xYpXq8vWxYzK6';
        
        const adminExists = await pool.query("SELECT id FROM users WHERE username = 'admin'");
        
        if (adminExists.rows.length > 0) {
            console.log('🔄 Updating existing admin password...');
            await pool.query(`
                UPDATE users 
                SET password_hash = $1 
                WHERE username = 'admin'
            `, [adminHash]);
            console.log('✅ Admin password updated!\n');
        } else {
            console.log('🆕 Creating new admin user...');
            await pool.query(`
                INSERT INTO users (username, email, password_hash, full_name, role) 
                VALUES ($1, $2, $3, $4, $5)
            `, ['admin', 'admin@gazcom.com', adminHash, 'Administrator', 'admin']);
            console.log('✅ Admin user created!\n');
        }
        
        // Verify the update
        const verify = await pool.query(`
            SELECT username, email, role FROM users WHERE username = 'admin'
        `);
        
        console.log('=======================================');
        console.log('🎉 LOGIN CREDENTIALS:');
        console.log('=======================================');
        console.log(`📧 Username: ${verify.rows[0].username}`);
        console.log(`📧 Email: ${verify.rows[0].email}`);
        console.log(`👤 Role: ${verify.rows[0].role}`);
        console.log(`🔑 Password: admin123`);
        console.log('=======================================\n');
        console.log('🌐 Login here: http://localhost:5000/login.html');
        console.log('\n💡 Tip: After login, you can change your password in the admin panel.');
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Is PostgreSQL running?');
        console.error('2. Is the password in this script correct?');
        console.error('3. Is PostgreSQL on port 5433?');
        console.error('\nTry starting PostgreSQL:');
        console.error('   net start postgresql-15');
        process.exit(1);
    }
}

resetAdminPassword();