const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    host: 'localhost',
    port: 5433,
    database: 'gazcom_db',
    user: 'postgres',
    password: '1234',
});

async function fixPassword() {
    try {
        // Set a simple password first to test
        const simplePassword = 'admin123';
        
        // Generate hash
        const hash = await bcrypt.hash(simplePassword, 10);
        console.log('=================================');
        console.log('GENERATED NEW HASH');
        console.log('=================================');
        console.log(`Password: ${simplePassword}`);
        console.log(`Hash: ${hash}`);
        console.log('');
        
        // Test the hash immediately
        const testCompare = await bcrypt.compare(simplePassword, hash);
        console.log(`Testing new hash with "${simplePassword}": ${testCompare ? '✅ WORKS' : '❌ FAILS'}`);
        
        if (!testCompare) {
            console.log('❌ CRITICAL: bcrypt.compare is failing on a freshly generated hash!');
            console.log('This suggests a problem with bcrypt installation.');
            process.exit(1);
        }
        
        // Update database
        await pool.query(
            "UPDATE users SET password_hash = $1 WHERE username = 'admin'",
            [hash]
        );
        console.log('✅ Database updated with new hash');
        console.log('');
        
        // Test with the hash in database
        const result = await pool.query(
            "SELECT password_hash FROM users WHERE username = 'admin'"
        );
        const dbHash = result.rows[0].password_hash;
        console.log(`Hash in DB: ${dbHash}`);
        
        const dbTest = await bcrypt.compare(simplePassword, dbHash);
        console.log(`Testing DB hash with "${simplePassword}": ${dbTest ? '✅ WORKS' : '❌ FAILS'}`);
        
        if (dbTest) {
            console.log('');
            console.log('=================================');
            console.log('🎉 SUCCESS! Now login with:');
            console.log('   Username: admin');
            console.log('   Password: admin123');
            console.log('=================================');
        } else {
            console.log('');
            console.log('❌ Database hash test failed even though it should work');
            console.log('Check if the hash is being stored correctly');
            
            // Show the actual stored hash
            console.log(`\nStored hash length: ${dbHash.length}`);
            console.log(`Expected length: 60`);
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

fixPassword();