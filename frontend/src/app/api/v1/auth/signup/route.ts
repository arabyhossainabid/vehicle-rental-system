import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { hashPassword, generateToken, jsonResponse, errorResponse } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, password, phone, role } = body;

        if (!name || !email || !password || !phone) {
            return errorResponse('Missing required fields', 400);
        }

        // Check if user exists
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return errorResponse('User already exists', 409);
        }

        const hashedPassword = await hashPassword(password);
        const userRole = role || 'customer';

        const result = await pool.query(
            'INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, email, hashedPassword, phone, userRole]
        );

        const user = result.rows[0];
        const token = generateToken(user);

        // Remove password from response
        delete user.password;

        return jsonResponse({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user
            }
        }, 201);
    } catch (error: any) {
        console.error('Signup error:', error);
        return errorResponse('Server error', 500);
    }
}
