import pool from './config/database';

const testConnection = async () => {
    try {
        console.log('Testing database connection...');
        console.log('Host:', process.env.DB_HOST);
        console.log('Database:', process.env.DB_NAME);

        const result = await pool.query('SELECT NOW()');
        console.log('✅ Database connected successfully!');
        console.log('Current time from database:', result.rows[0].now);

        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('\n✅ Tables in database:');
        tables.rows.forEach(row => console.log('  -', row.table_name));

        const userCount = await pool.query('SELECT COUNT(*) FROM users');
        console.log(`\n✅ Users table exists with ${userCount.rows[0].count} records`);

        process.exit(0);
    } catch (error: any) {
        console.error('❌ Database connection failed:', error.message);
        console.error(error);
        process.exit(1);
    }
};

testConnection();
