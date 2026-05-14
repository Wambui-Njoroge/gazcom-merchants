const { Pool } = require('pg');

const pool = new Pool({
    host: 'aws-1-ap-south-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.wtilejxiyuakuhpaaxun',
    password: 'Wambui254@.',  
    ssl: { rejectUnauthorized: false }
});

async function test() {
    console.log('Testing Supabase connection...');
    try {
        const result = await pool.query('SELECT NOW()');
        console.log(' Connected to Supabase!');
        console.log('Time:', result.rows[0].now);
    } catch (error) {
        console.log(' Error:', error.message);
    }
    pool.end();
}

test();