import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest, jsonResponse, errorResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return errorResponse('Unauthorized', 401);

        let query = `
            SELECT b.*, 
            json_build_object('vehicle_name', v.vehicle_name, 'registration_number', v.registration_number, 'daily_rent_price', v.daily_rent_price, 'type', v.type) as vehicle
            ${user.role === 'admin' ? `, json_build_object('name', u.name, 'email', u.email) as customer` : ''} 
            FROM bookings b
            JOIN vehicles v ON b.vehicle_id = v.id
            ${user.role === 'admin' ? 'JOIN users u ON b.customer_id = u.id' : ''}
        `;

        const values = [];
        if (user.role !== 'admin') {
            query += ' WHERE b.customer_id = $1';
            values.push(user.id);
        }

        query += ' ORDER BY b.created_at DESC';

        const result = await pool.query(query, values);

        // Format dates or price if needed (typically DB driver returns Dates nicely, or strings)
        // JSON build object might return nested structure directly.

        return jsonResponse({
            success: true,
            data: result.rows
        });

    } catch (error: any) {
        console.error("Get bookings error", error);
        return errorResponse('Server error', 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return errorResponse('Unauthorized', 401);

        const body = await req.json();
        const { vehicle_id, rent_start_date, rent_end_date } = body;

        // Calculate total price
        const vehicleRes = await pool.query('SELECT daily_rent_price FROM vehicles WHERE id = $1', [vehicle_id]);
        if (vehicleRes.rows.length === 0) return errorResponse('Vehicle not found', 404);

        const pricePerDay = parseFloat(vehicleRes.rows[0].daily_rent_price);
        const start = new Date(rent_start_date);
        const end = new Date(rent_end_date);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        if (days <= 0) return errorResponse('End date must be after start date', 400);

        const totalPrice = days * pricePerDay;

        const result = await pool.query(
            'INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user.id, vehicle_id, rent_start_date, rent_end_date, totalPrice]
        );

        return jsonResponse({
            success: true,
            message: 'Booking created successfully',
            data: result.rows[0]
        }, 201);

    } catch (error: any) {
        console.error("Create booking error", error);
        return errorResponse('Server error', 500);
    }
}
