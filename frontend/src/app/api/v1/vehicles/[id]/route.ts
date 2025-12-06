import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest, jsonResponse, errorResponse } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [params.id]);
        if (result.rows.length === 0) return errorResponse('Vehicle not found', 404);

        const vehicle = result.rows[0];
        return jsonResponse({
            success: true,
            data: {
                ...vehicle,
                daily_rent_price: parseFloat(vehicle.daily_rent_price)
            }
        });
    } catch (error: any) {
        return errorResponse('Server error', 500);
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = getUserFromRequest(req);
        if (!user || user.role !== 'admin') return errorResponse('Unauthorized', 403);

        const result = await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING *', [params.id]);
        if (result.rows.length === 0) return errorResponse('Vehicle not found', 404);

        return jsonResponse({
            success: true,
            message: 'Vehicle deleted successfully'
        });
    } catch (error: any) {
        // handle foreign key constraint error friendly
        if (error.code === '23503') return errorResponse('Cannot delete vehicle with active bookings', 400);
        return errorResponse('Server error', 500);
    }
}
