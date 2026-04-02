const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    host: 'localhost',
    port: 5433,
    database: 'gazcom_db',
    user: 'postgres',
    password: '1234',
});

async function createPermanentAdmin() {
    try {
        console.log('=================================');
        console.log('CREATING PERMANENT ADMIN ACCOUNT');
        console.log('=================================\n');
        
        // Admin details
        const adminDetails = {
            username: 'gazcom_admin',
            email: 'gazcom.gm@gmail.com',
            password: 'GazAdmin!26',
            full_name: 'GAZCOM Administrator',
            phone: '+254724515819',
            role: 'admin'
        };
        
        // Generate password hash
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(adminDetails.password, salt);
        
        console.log('📝 Admin Account Details:');
        console.log(`   Username: ${adminDetails.username}`);
        console.log(`   Email: ${adminDetails.email}`);
        console.log(`   Password: ${adminDetails.password}`);
        console.log(`   Full Name: ${adminDetails.full_name}`);
        console.log(`   Phone: ${adminDetails.phone}`);
        console.log(`   Role: ${adminDetails.role}`);
        console.log('');
        
        // Delete any existing admin accounts
        console.log('🗑️  Removing any existing admin accounts...');
        await pool.query("DELETE FROM users WHERE username IN ('admin', 'admin1', 'gazcom_admin') OR role = 'admin'");
        console.log('✅ Previous admins removed\n');
        
        // Create new permanent admin
        console.log('🆕 Creating new permanent admin...');
        const result = await pool.query(`
            INSERT INTO users (username, email, password_hash, full_name, phone, role, created_at) 
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
            RETURNING id, username, email, full_name, role, created_at
        `, [
            adminDetails.username,
            adminDetails.email,
            passwordHash,
            adminDetails.full_name,
            adminDetails.phone,
            adminDetails.role
        ]);
        
        console.log('✅ Admin account created successfully!\n');
        
        // Verify the password works
        const verifyUser = await pool.query(
            "SELECT password_hash FROM users WHERE username = $1",
            [adminDetails.username]
        );
        
        const isValid = await bcrypt.compare(adminDetails.password, verifyUser.rows[0].password_hash);
        
        console.log('=================================');
        if (isValid) {
            console.log('🎉 ADMIN ACCOUNT CREATED SUCCESSFULLY! 🎉');
            console.log('=================================');
            console.log('\n📋 LOGIN CREDENTIALS:');
            console.log('-----------------------------------');
            console.log(`   Username: ${adminDetails.username}`);
            console.log(`   Email: ${adminDetails.email}`);
            console.log(`   Password: ${adminDetails.password}`);
            console.log(`   Role: ${adminDetails.role}`);
            console.log('-----------------------------------');
            console.log('\n🌐 Login URL: http://localhost:5000/login.html');
            console.log('=================================\n');
        } else {
            console.log('❌ Password verification failed! Please try again.');
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createPermanentAdmin();