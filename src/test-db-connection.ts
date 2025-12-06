import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const connectionString = process.env.DB_HOST?.includes('neon.tech')
    ? `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?sslmode=require`
    : undefined;

const pool = new Pool(
    connectionString
        ? { connectionString }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME || 'vehicle_rental',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
        }
);

console.log('Testing database connection...');
console.log('Config:', {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '5432',
    database: process.env.DB_NAME || 'vehicle_rental',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD ? '***' : 'NOT SET'
});

interface PgError extends Error {
    code?: string;
}

pool.query('SELECT NOW()', (err: Error | undefined, res) => {
    if (err) {
        const pgErr = err as PgError;
        console.error('\n Connection FAILED:');
        console.error('Error:', pgErr.message);
        console.error('Code:', pgErr.code);

        if (pgErr.code === '28P01') {
            console.error('\n Solution: Password authentication failed.');
            console.error('   - Check your DB_PASSWORD in .env file');
            console.error('   - Make sure it matches your PostgreSQL password');
        } else if (pgErr.code === '3D000') {
            console.error('\n Solution: Database does not exist.');
            console.error('   - Create the database: CREATE DATABASE vehicle_rental;');
            console.error('   - Or update DB_NAME in .env file');
        } else if (pgErr.code === 'ECONNREFUSED') {
            console.error('\n Solution: Cannot connect to PostgreSQL server.');
            console.error('   - Make sure PostgreSQL is running');
            console.error('   - Check DB_HOST and DB_PORT in .env file');
        }
        process.exit(1);
    } else {
        console.log('\n Connection SUCCESSFUL!');
        console.log('Database time:', res.rows[0].now);

        pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
        `, (err, res) => {
            if (err) {
                console.error('Error checking tables:', err.message);
            } else {
                console.log('\nTables found:', res.rows.length);
                if (res.rows.length > 0) {
                    console.log('  -', res.rows.map(r => r.table_name).join(', '));
                } else {
                    console.log('No tables found. Run setup.sql to create tables.');
                }
            }
            pool.end();
        });
    }
});
