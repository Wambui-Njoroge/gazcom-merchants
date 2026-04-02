// create-admin.js
// This file generates a password hash for the admin user

const bcrypt = require('bcrypt');

async function createAdminHash() {
    const password = 'admin123';  // You can change this password
    const hash = await bcrypt.hash(password, 10);
    
    console.log('\n=================================');
    console.log('ADMIN USER GENERATION');
    console.log('=================================');
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
    console.log('\nCopy the hash below and use it in your SQL query');
    console.log('=================================\n');
    
    // Also generate the SQL command for convenience
    console.log('SQL to insert admin user:');
    console.log(`INSERT INTO users (username, email, password_hash, full_name, role) 
VALUES ('admin', 'admin@gazcom.com', '${hash}', 'Administrator', 'admin');`);
}

createAdminHash();