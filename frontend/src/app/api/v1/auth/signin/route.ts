import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { comparePassword, generateToken, jsonResponse, errorResponse } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return errorResponse('Please provide email and password', 400);
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return errorResponse('Invalid credentials', 401);
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return errorResponse('Invalid credentials', 401);
        }

        const token = generateToken(user);

        // Remove password from response
        delete user.password;

        return jsonResponse({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user
            }
        });
    } catch (error: any) {
        console.error('Signin error:', error);
        return errorResponse('Server error', 500);
    }
}
