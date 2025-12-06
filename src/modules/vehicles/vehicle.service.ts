import pool from '../../config/database';

export class VehicleService {
    private validateVehicleType(type: string): boolean {
        return ['car', 'bike', 'van', 'SUV'].includes(type);
    }

    private validateAvailabilityStatus(status: string): boolean {
        return ['available', 'booked'].includes(status);
    }

    async createVehicle(vehicleData: any) {
        const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = vehicleData;

        // Validate type
        if (type && !this.validateVehicleType(type)) {
            throw new Error('Type must be one of: car, bike, van, SUV');
        }

        // Validate availability_status
        if (availability_status && !this.validateAvailabilityStatus(availability_status)) {
            throw new Error('Availability status must be either "available" or "booked"');
        }

        // Validate daily_rent_price
        if (daily_rent_price <= 0) {
            throw new Error('Daily rent price must be a positive number');
        }

        const check = await pool.query('SELECT * FROM vehicles WHERE registration_number = $1', [registration_number]);
        if (check.rows.length > 0) {
            throw new Error('Vehicle with this registration number already exists');
        }

        const result = await pool.query(
            'INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [vehicle_name, type, registration_number, daily_rent_price, availability_status || 'available']
        );

        const vehicle = result.rows[0];
        return {
            ...vehicle,
            daily_rent_price: parseFloat(vehicle.daily_rent_price)
        };
    }

    async getAllVehicles() {
        const result = await pool.query('SELECT * FROM vehicles');
        return result.rows.map(vehicle => ({
            ...vehicle,
            daily_rent_price: parseFloat(vehicle.daily_rent_price)
        }));
    }

    async getVehicleById(vehicleId: string) {
        const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicleId]);
        if (result.rows.length === 0) {
            throw new Error('Vehicle not found');
        }
        const vehicle = result.rows[0];
        return {
            ...vehicle,
            daily_rent_price: parseFloat(vehicle.daily_rent_price)
        };
    }

    async updateVehicle(vehicleId: string, vehicleData: any) {
        const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = vehicleData;

        // Validate type if provided
        if (type && !this.validateVehicleType(type)) {
            throw new Error('Type must be one of: car, bike, van, SUV');
        }

        // Validate availability_status if provided
        if (availability_status && !this.validateAvailabilityStatus(availability_status)) {
            throw new Error('Availability status must be either "available" or "booked"');
        }

        // Validate daily_rent_price if provided
        if (daily_rent_price && daily_rent_price <= 0) {
            throw new Error('Daily rent price must be a positive number');
        }

        const check = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicleId]);
        if (check.rows.length === 0) {
            throw new Error('Vehicle not found');
        }

        let query = 'UPDATE vehicles SET id = id';
        const values = [];
        let paramCount = 1;

        if (vehicle_name) {
            query += `, vehicle_name = $${paramCount}`;
            values.push(vehicle_name);
            paramCount++;
        }
        if (type) {
            query += `, type = $${paramCount}`;
            values.push(type);
            paramCount++;
        }
        if (registration_number) {
            query += `, registration_number = $${paramCount}`;
            values.push(registration_number);
            paramCount++;
        }
        if (daily_rent_price) {
            query += `, daily_rent_price = $${paramCount}`;
            values.push(daily_rent_price);
            paramCount++;
        }
        if (availability_status) {
            query += `, availability_status = $${paramCount}`;
            values.push(availability_status);
            paramCount++;
        }

        query += ` WHERE id = $${paramCount} RETURNING *`;
        values.push(vehicleId);

        const result = await pool.query(query, values);
        const vehicle = result.rows[0];
        return {
            ...vehicle,
            daily_rent_price: parseFloat(vehicle.daily_rent_price)
        };
    }

    async deleteVehicle(vehicleId: string) {
        const check = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicleId]);
        if (check.rows.length === 0) {
            throw new Error('Vehicle not found');
        }
        const bookingCheck = await pool.query('SELECT * FROM bookings WHERE vehicle_id = $1 AND status = $2', [vehicleId, 'active']);
        if (bookingCheck.rows.length > 0) {
            throw new Error('Cannot delete vehicle with active bookings');
        }

        // Delete non-active bookings (cancelled and returned) to avoid foreign key constraint
        await pool.query('DELETE FROM bookings WHERE vehicle_id = $1 AND status != $2', [vehicleId, 'active']);

        await pool.query('DELETE FROM vehicles WHERE id = $1', [vehicleId]);
        return check.rows[0];
    }
}