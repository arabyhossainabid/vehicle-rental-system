import { Pool } from 'pg';

const connectionString = process.env.DB_HOST?.includes('neon.tech')
    ? `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?sslmode=require`
    : undefined;

const pool = new Pool(
    connectionString
        ? { connectionString }
        : {
            host: process.env.DB_HOST || 'localhost',
            // Default to 5432 if not set, ensuring it's an integer
            // @ts-ignore
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME || 'vehicle_rental',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
        }
);

export default pool;
