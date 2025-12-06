import { Request, Response } from 'express';
import { UserService } from './user.service';

const userService = new UserService();

interface AuthRequest extends Request {
    user?: any;
}

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: users,
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', errors: error.message });
    }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    const { userId } = req.params;
    const currentUser = req.user;

    try {
        const updatedUser = await userService.updateUser(userId, req.body, currentUser);
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser,
        });
    } catch (error: any) {
        if (error.message === 'Access denied' || error.message === 'Only admins can update roles') {
            res.status(403).json({ success: false, message: error.message, errors: error.message });
        } else if (error.message === 'User not found') {
            res.status(404).json({ success: false, message: error.message, errors: error.message });
        } else {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server error', errors: error.message });
        }
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;

    try {
        await userService.deleteUser(userId);
        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error: any) {
        if (error.message === 'User not found') {
            res.status(404).json({ success: false, message: error.message, errors: error.message });
        } else if (error.message === 'Cannot delete user with active bookings') {
            res.status(400).json({ success: false, message: error.message, errors: error.message });
        } else {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server error', errors: error.message });
        }
    }
};
