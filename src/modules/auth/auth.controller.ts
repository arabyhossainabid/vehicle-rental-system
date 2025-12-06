import { Request, Response } from 'express';
import { AuthService } from './auth.service';

const authService = new AuthService();

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: user,
        });
    } catch (error: any) {
        if (error.message === 'User already exists') {
            res.status(400).json({ success: false, message: error.message, errors: error.message });
        } else if (error.message === 'Invalid email format') {
            res.status(400).json({ success: false, message: error.message, errors: error.message });
        } else if (error.message === 'Password must be at least 6 characters long') {
            res.status(400).json({ success: false, message: error.message, errors: error.message });
        } else if (error.message === 'Role must be either "admin" or "customer"') {
            res.status(400).json({ success: false, message: error.message, errors: error.message });
        } else if (error.code === '28P01' || error.message?.includes('password authentication failed')) {
            res.status(500).json({
                success: false,
                message: 'Database connection failed. Please check your database credentials in .env file',
                errors: 'Database authentication error'
            });
        } else if (error.code === '3D000') {
            res.status(500).json({
                success: false,
                message: 'Database not found. Please create the database and run setup.sql',
                errors: 'Database not found'
            });
        } else {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server error', errors: error.message });
        }
    }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await authService.loginUser(req.body);
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token: result.token,
                user: result.user
            },
        });
    } catch (error: any) {
        if (error.message === 'Invalid email format') {
            res.status(400).json({ success: false, message: error.message, errors: error.message });
        } else if (error.message === 'User not found') {
            res.status(404).json({ success: false, message: error.message, errors: error.message });
        } else if (error.message === 'Invalid password') {
            res.status(401).json({ success: false, message: 'Invalid password', errors: error.message });
        } else if (error.code === '28P01' || error.message?.includes('password authentication failed')) {
            res.status(500).json({
                success: false,
                message: 'Database connection failed. Please check your database credentials in .env file',
                errors: 'Database authentication error'
            });
        } else if (error.code === '3D000' || error.message?.includes('database') || error.message?.includes('does not exist')) {
            res.status(500).json({
                success: false,
                message: 'Database not found. Please create the database and run setup.sql',
                errors: 'Database not found'
            });
        } else {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server error', errors: error.message });
        }
    }
};