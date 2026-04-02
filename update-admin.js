const { Pool } = require('pg');

console.log('🔧 GAZCOM Admin Password Reset');
console.log('=======================================\n');

const pool = new Pool({
    host: 'localhost',
    port: 5433,
    database: 'gazcom_db',
    user: 'postgres',
    password: '1234',  // Your PostgreSQL password
});

async function resetAdmin() {
    try {
        console.log('📡 Connecting to PostgreSQL on port 5433...');
        
        // Test connection
        await pool.query('SELECT NOW()');
        console.log('✅ Database connected successfully!\n');
        
        // Check existing users
        const users = await pool.query('SELECT id, username, email, role FROM users');
        console.log(`📋 Found ${users.rows.length} user(s):`);
        users.rows.forEach(user => {
            console.log(`   - ${user.username} (${user.role}): ${user.email}`);
        });
        console.log('');
        
        // Update admin password (password will be 'admin123')
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
        
        // Also update any other admin users
        await pool.query(`
            UPDATE users 
            SET password_hash = $1 
            WHERE role = 'admin' AND username != 'admin'
        `, [adminHash]);
        
        // Verify
        const verify = await pool.query(`
            SELECT username, email, role FROM users WHERE role = 'admin'
        `);
        
        console.log('=======================================');
        console.log('🎉 SUCCESS! Login Credentials:');
        console.log('=======================================');
        verify.rows.forEach(user => {
            console.log(`Username: ${user.username}`);
            console.log(`Email: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`Password: admin123`);
            console.log('---------------------------------------');
        });
        console.log('\n🌐 Login Page: http://localhost:5000/login.html');
        console.log('=======================================\n');
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        process.exit(1);
    }
}

resetAdmin();