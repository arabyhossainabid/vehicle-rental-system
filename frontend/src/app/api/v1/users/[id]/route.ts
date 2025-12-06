import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest, jsonResponse, errorResponse } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = getUserFromRequest(req);
        if (!user || user.role !== 'admin') return errorResponse('Unauthorized', 403);

        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [params.id]);
        if (result.rows.length === 0) return errorResponse('User not found', 404);

        return jsonResponse({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error: any) {
        return errorResponse('Server error', 500);
    }
}
