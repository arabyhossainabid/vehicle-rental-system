import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../config/database';

export class AuthService {
    private validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async registerUser(userData: any) {
        const { name, email, password, phone, role } = userData;

        // Validate email format
        if (!this.validateEmail(email)) {
            throw new Error('Invalid email format');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        // Validate role
        if (role && !['admin', 'customer'].includes(role)) {
            throw new Error('Role must be either "admin" or "customer"');
        }

        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
        if (userCheck.rows.length > 0) {
            throw new Error('User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            'INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role',
            [name, email.toLowerCase(), hashedPassword, phone, role || 'customer']
        );

        return newUser.rows[0];
    }

    async loginUser(credentials: any) {
        const { email, password } = credentials;

        // Validate email format
        if (!this.validateEmail(email)) {
            throw new Error('Invalid email format');
        }

        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
        if (userResult.rows.length === 0) {
            throw new Error('User not found');
        }

        const user = userResult.rows[0];

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            throw new Error('Invalid password');
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '1d' }
        );

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        };
    }
}