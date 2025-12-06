import pool from '../config/database';

export const checkOverdueBookings = async () => {
    try {
        console.log('Checking for overdue bookings...');

        const result = await pool.query(
            'SELECT * FROM bookings WHERE status = $1 AND rent_end_date < NOW()',
            ['active']
        );

        if (result.rows.length === 0) {
            console.log('No overdue bookings found.');
            return;
        }

        console.log(`Found ${result.rows.length} overdue bookings.`);

        for (const booking of result.rows) {
            await pool.query('UPDATE bookings SET status = $1 WHERE id = $2', ['returned', booking.id]);
            await pool.query('UPDATE vehicles SET availability_status = $1 WHERE id = $2', ['available', booking.vehicle_id]);
            console.log(`Booking ${booking.id} marked as returned.`);
        }

        console.log('Overdue check completed.');
    } catch (error: any) {
        if (error.code === '28P01' || error.message?.includes('password authentication failed')) {
            console.log('Database connection failed. Please check your .env file credentials.');
            console.log('The server will continue running, but auto-return feature is disabled.');
            return;
        }
        if (error.code === '3D000' || error.message?.includes('database') || error.message?.includes('does not exist')) {
            console.log('Database not found. Please create the database and run setup.sql');
            console.log('The server will continue running, but auto-return feature is disabled.');
            return;
        }
        console.error('Error checking overdue bookings:', error.message);
    }
};
