const bcrypt = require('bcrypt');

async function testHash() {
    // This is YOUR password hash from pgAdmin
    const hash = '$2b$10$rp.VRhYkN70et7rKtscQWuShtETh2Cb8/IdkM2z3O6r7WDHhEQTRq';
    
    // Test common passwords
    const passwords = [
        'admin123', 
        'password', 
        'admin', 
        '123456', 
        'gazcom', 
        'gazcom@254',
        'gazcom123',
        'GAZCOM2024',
        'Admin@123'
    ];
    
    console.log('🔍 Testing your password hash against common passwords...\n');
    console.log('Hash from database:', hash);
    console.log('=================================\n');
    
    let found = false;
    
    for (const pwd of passwords) {
        const isValid = await bcrypt.compare(pwd, hash);
        if (isValid) {
            console.log(`✅✅✅ SUCCESS! Password is: "${pwd}" ✅✅✅`);
            found = true;
            break;
        } else {
            console.log(`❌ "${pwd}" - does NOT match`);
        }
    }
    
    if (!found) {
        console.log('\n⚠️ None of the common passwords matched.');
        console.log('Your password might be something else you set earlier.');
        console.log('\n💡 Tip: Try any password you might have used when creating the account.');
        console.log('If you want to reset it to "admin123", run the SQL update command in pgAdmin.');
    }
    
    console.log('\n=================================');
}

testHash();