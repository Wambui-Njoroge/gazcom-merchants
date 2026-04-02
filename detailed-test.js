const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    host: 'localhost',
    port: 5433,
    database: 'gazcom_db',
    user: 'postgres',
    password: '1234',
});

async function detailedTest() {
    try {
        // Get the actual hash from database
        const result = await pool.query(
            "SELECT username, password_hash FROM users WHERE username = 'admin'"
        );
        
        if (result.rows.length === 0) {
            console.log('Admin user not found');
            return;
        }
        
        const storedHash = result.rows[0].password_hash;
        console.log('=================================');
        console.log('DETAILED PASSWORD ANALYSIS');
        console.log('=================================');
        console.log(`Stored hash: ${storedHash}`);
        console.log(`Hash length: ${storedHash.length}`);
        console.log(`Hash starts with: ${storedHash.substring(0, 7)}`);
        console.log('');
        
        // Test with bcrypt compare
        const testPassword = 'admin123';
        console.log(`Testing password: "${testPassword}"`);
        
        try {
            const isValid = await bcrypt.compare(testPassword, storedHash);
            console.log(`bcrypt.compare result: ${isValid}`);
        } catch (err) {
            console.log(`bcrypt.compare error: ${err.message}`);
        }
        
        // Also test with the hash we know should work
        const knownGoodHash = '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrC7JqE5hJkYwXcMZ5xYpXq8vWxYzK6';
        console.log('');
        console.log('Testing with known good hash:');
        const knownValid = await bcrypt.compare('admin123', knownGoodHash);
        console.log(`Known good hash test: ${knownValid ? '✅ Works' : '❌ Fails'}`);
        
        console.log('');
        console.log('Comparing stored hash with known good hash:');
        console.log(`Stored: ${storedHash}`);
        console.log(`Known:  ${knownGoodHash}`);
        console.log(`Are they equal? ${storedHash === knownGoodHash ? 'YES' : 'NO'}`);
        
        if (storedHash !== knownGoodHash) {
            console.log('\n⚠️ The stored hash is different from the known good hash!');
            console.log('This means the password was not properly updated.');
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

detailedTest();