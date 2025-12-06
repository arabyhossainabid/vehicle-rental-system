import pool from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

const runMigration = async () => {
    try {
        console.log('Starting database migration...');
        console.log('Connecting to:', process.env.DB_HOST);

        const sqlPath = path.join(__dirname, '../../setup.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            try {
                await pool.query(statement);
                console.log('Executed:', statement.substring(0, 50) + '...');
            } catch (error: any) {
                if (error.message.includes('already exists')) {
                    console.log('Table already exists, skipping');
                } else {
                    throw error;
                }
            }
        }

        console.log('Database migration completed successfully!');
        process.exit(0);
    } catch (error: any) {
        console.error('Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    }
};

runMigration();
