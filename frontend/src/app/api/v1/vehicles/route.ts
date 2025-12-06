import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest, jsonResponse, errorResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const result = await pool.query('SELECT * FROM vehicles');
        const vehicles = result.rows.map(v => ({
            ...v,
            daily_rent_price: parseFloat(v.daily_rent_price)
        }));

        return jsonResponse({
            success: true,
            data: vehicles
        });
    } catch (error: any) {
        console.error('Fetch vehicles error:', error);
        return errorResponse('Server error', 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user || user.role !== 'admin') {
            return errorResponse('Unauthorized', 403);
        }

        const body = await req.json();
        const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = body;

        // Validation logic can be added here similar to service
        if (daily_rent_price <= 0) return errorResponse('Price must be positive', 400);

        const check = await pool.query('SELECT * FROM vehicles WHERE registration_number = $1', [registration_number]);
        if (check.rows.length > 0) return errorResponse('Vehicle already exists', 400);

        const result = await pool.query(
            'INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [vehicle_name, type, registration_number, daily_rent_price, availability_status || 'available']
        );

        const vehicle = result.rows[0];
        return jsonResponse({
            success: true,
            message: 'Vehicle created successfully',
            data: {
                ...vehicle,
                daily_rent_price: parseFloat(vehicle.daily_rent_price)
            }
        }, 201);

    } catch (error: any) {
        console.error('Create vehicle error:', error);
        return errorResponse('Server error', 500);
    }
}
