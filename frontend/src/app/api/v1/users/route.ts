import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest, jsonResponse, errorResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user || user.role !== 'admin') return errorResponse('Unauthorized', 403);

        const result = await pool.query('SELECT id, name, email, phone, role, created_at FROM users');
        return jsonResponse({
            success: true,
            data: result.rows
        });
    } catch (error: any) {
        return errorResponse('Server error', 500);
    }
}
