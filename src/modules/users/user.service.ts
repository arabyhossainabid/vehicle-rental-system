import pool from '../../config/database';

export class UserService {
    async getAllUsers() {
        const result = await pool.query('SELECT id, name, email, phone, role FROM users');
        return result.rows;
    }

    async updateUser(userId: string, userData: any, currentUser: any) {
        const { name, email, phone, role } = userData;

        if (currentUser.role !== 'admin' && currentUser.id !== parseInt(userId)) {
            throw new Error('Access denied');
        }
        if (role && currentUser.role !== 'admin') {
            throw new Error('Only admins can update roles');
        }

        const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0) {
            throw new Error('User not found');
        }

        let query = 'UPDATE users SET id = id';
        const values = [];
        let paramCount = 1;

        if (name) {
            query += `, name = $${paramCount}`;
            values.push(name);
            paramCount++;
        }
        if (email) {
            query += `, email = $${paramCount}`;
            values.push(email.toLowerCase());
            paramCount++;
        }
        if (phone) {
            query += `, phone = $${paramCount}`;
            values.push(phone);
            paramCount++;
        }
        if (role) {
            query += `, role = $${paramCount}`;
            values.push(role);
            paramCount++;
        }

        query += ` WHERE id = $${paramCount} RETURNING id, name, email, phone, role`;
        values.push(userId);

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async deleteUser(userId: string) {
        const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0) {
            throw new Error('User not found');
        }

        const bookingCheck = await pool.query('SELECT * FROM bookings WHERE customer_id = $1 AND status = $2', [userId, 'active']);
        if (bookingCheck.rows.length > 0) {
            throw new Error('Cannot delete user with active bookings');
        }

        await pool.query('DELETE FROM bookings WHERE customer_id = $1 AND status != $2', [userId, 'active']);

        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
        return userCheck.rows[0];
    }
}
