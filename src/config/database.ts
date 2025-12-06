import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Use connection string for Neon (handles SSL automatically)
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

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export default pool;