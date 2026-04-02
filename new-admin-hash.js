const bcrypt = require('bcryptjs');

async function createNewAdmin() {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    
    console.log('=================================');
    console.log('NEW ADMIN CREDENTIALS');
    console.log('=================================');
    console.log(`Password: ${password}`);
    console.log(`New Hash: ${hash}`);
    console.log('=================================');
    console.log('\nRun this SQL in pgAdmin:');
    console.log(`
-- Delete existing admin
DELETE FROM users WHERE username = 'gazcom_admin';

-- Create new admin with fresh hash
INSERT INTO users (username, email, password_hash, full_name, phone, role) 
VALUES ('gazcom_admin', 'gazcom.gm@gmail.com', '${hash}', 'GAZCOM Administrator', '+254724515819', 'admin');

-- Verify
SELECT username, email, role FROM users WHERE username = 'gazcom_admin';
    `);
    
    // Also test the hash immediately
    const testResult = await bcrypt.compare('admin123', hash);
    console.log(`\nTesting new hash with "admin123": ${testResult ? '✅ WORKS' : '❌ FAILS'}`);
}

createNewAdmin();