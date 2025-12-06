import pool from '../../config/database';

export class BookingService {
    async createBooking(bookingData: any, customerId: number) {
        const { vehicle_id, rent_start_date, rent_end_date } = bookingData;

        const vehicleCheck = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicle_id]);
        if (vehicleCheck.rows.length === 0) {
            throw new Error('Vehicle not found');
        }

        const vehicle = vehicleCheck.rows[0];
        if (vehicle.availability_status !== 'available') {
            throw new Error('Vehicle is not available');
        }

        const start = new Date(rent_start_date);
        const end = new Date(rent_end_date);

        // Validate dates
        if (end <= start) {
            throw new Error('End date must be after start date');
        }

        // Calculate number of days (difference in days)
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const totalPrice = diffDays * parseFloat(vehicle.daily_rent_price);

        const booking = await pool.query(
            'INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [customerId, vehicle_id, rent_start_date, rent_end_date, totalPrice, 'active']
        );

        await pool.query('UPDATE vehicles SET availability_status = $1 WHERE id = $2', ['booked', vehicle_id]);

        return {
            id: booking.rows[0].id,
            customer_id: booking.rows[0].customer_id,
            vehicle_id: booking.rows[0].vehicle_id,
            rent_start_date: booking.rows[0].rent_start_date,
            rent_end_date: booking.rows[0].rent_end_date,
            total_price: parseFloat(booking.rows[0].total_price),
            status: booking.rows[0].status,
            vehicle: {
                vehicle_name: vehicle.vehicle_name,
                daily_rent_price: parseFloat(vehicle.daily_rent_price)
            }
        };
    }

    async getBookings(currentUser: any) {
        let query = '';
        const values = [];

        if (currentUser.role === 'admin') {
            query = `
        SELECT b.*,
               u.name as customer_name, u.email as customer_email,
               v.vehicle_name, v.registration_number
        FROM bookings b
        JOIN users u ON b.customer_id = u.id
        JOIN vehicles v ON b.vehicle_id = v.id
      `;
        } else {
            query = `
        SELECT b.*,
               v.vehicle_name, v.registration_number, v.type
        FROM bookings b
        JOIN vehicles v ON b.vehicle_id = v.id
        WHERE b.customer_id = $1
      `;
            values.push(currentUser.id);
        }

        const result = await pool.query(query, values);

        return result.rows.map(row => {
            if (currentUser.role === 'admin') {
                // Admin view includes customer_id
                return {
                    id: row.id,
                    customer_id: row.customer_id,
                    vehicle_id: row.vehicle_id,
                    rent_start_date: row.rent_start_date,
                    rent_end_date: row.rent_end_date,
                    total_price: parseFloat(row.total_price),
                    status: row.status,
                    customer: {
                        name: row.customer_name,
                        email: row.customer_email
                    },
                    vehicle: {
                        vehicle_name: row.vehicle_name,
                        registration_number: row.registration_number
                    }
                };
            } else {
                // Customer view does NOT include customer_id
                return {
                    id: row.id,
                    vehicle_id: row.vehicle_id,
                    rent_start_date: row.rent_start_date,
                    rent_end_date: row.rent_end_date,
                    total_price: parseFloat(row.total_price),
                    status: row.status,
                    vehicle: {
                        vehicle_name: row.vehicle_name,
                        registration_number: row.registration_number,
                        type: row.type
                    }
                };
            }
        });
    }

    async updateBookingStatus(bookingId: string, status: string, currentUser: any) {
        const bookingCheck = await pool.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
        if (bookingCheck.rows.length === 0) {
            throw new Error('Booking not found');
        }

        const booking = bookingCheck.rows[0];

        if (currentUser.role !== 'admin' && booking.customer_id !== currentUser.id) {
            throw new Error('Access denied');
        }

        if (status === 'cancelled') {
            if (booking.status !== 'active') {
                throw new Error('Booking is not active');
            }

            const startDate = new Date(booking.rent_start_date);
            if (startDate <= new Date()) {
                throw new Error('Cannot cancel booking after start date');
            }

            await pool.query('UPDATE bookings SET status = $1 WHERE id = $2', ['cancelled', bookingId]);
            await pool.query('UPDATE vehicles SET availability_status = $1 WHERE id = $2', ['available', booking.vehicle_id]);

            return {
                id: booking.id,
                customer_id: booking.customer_id,
                vehicle_id: booking.vehicle_id,
                rent_start_date: booking.rent_start_date,
                rent_end_date: booking.rent_end_date,
                total_price: parseFloat(booking.total_price),
                status: 'cancelled'
            };

        } else if (status === 'returned') {
            if (currentUser.role !== 'admin') {
                throw new Error('Only admin can mark as returned');
            }

            await pool.query('UPDATE bookings SET status = $1 WHERE id = $2', ['returned', bookingId]);
            await pool.query('UPDATE vehicles SET availability_status = $1 WHERE id = $2', ['available', booking.vehicle_id]);

            return {
                id: booking.id,
                customer_id: booking.customer_id,
                vehicle_id: booking.vehicle_id,
                rent_start_date: booking.rent_start_date,
                rent_end_date: booking.rent_end_date,
                total_price: parseFloat(booking.total_price),
                status: 'returned',
                vehicle: {
                    availability_status: 'available'
                }
            };
        } else {
            throw new Error('Invalid status update');
        }
    }
}