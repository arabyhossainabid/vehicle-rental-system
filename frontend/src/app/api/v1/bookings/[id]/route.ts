import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest, jsonResponse, errorResponse } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return errorResponse('Unauthorized', 401);

        const body = await req.json();
        const { status } = body;

        // Get current booking
        const bookingRes = await pool.query('SELECT * FROM bookings WHERE id = $1', [params.id]);
        if (bookingRes.rows.length === 0) return errorResponse('Booking not found', 404);
        const booking = bookingRes.rows[0];

        // Auth check
        if (user.role !== 'admin' && booking.customer_id !== user.id) {
            return errorResponse('Unauthorized', 403);
        }

        // Validate status transitions
        if (status === 'cancelled') {
            // Logic: can only cancel if active? etc.
        }

        const result = await pool.query(
            'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
            [status, params.id]
        );

        return jsonResponse({
            success: true,
            message: 'Booking updated',
            data: result.rows[0]
        });

    } catch (error: any) {
        return errorResponse('Server error', 500);
    }
}
