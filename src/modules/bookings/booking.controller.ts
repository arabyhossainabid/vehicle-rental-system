import { Request, Response } from 'express';
import { BookingService } from './booking.service';

const bookingService = new BookingService();

interface AuthRequest extends Request {
    user?: any;
}

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    const currentUser = req.user;

    let customerId: number;
    if (currentUser.role === 'admin') {
        customerId = req.body.customer_id;
        if (!customerId) {
            res.status(400).json({
                success: false,
                message: 'customer_id is required',
                errors: 'customer_id is required'
            });
            return;
        }
    } else {
        customerId = currentUser.id;
        if (req.body.customer_id && req.body.customer_id !== currentUser.id) {
            res.status(403).json({
                success: false,
                message: 'You can only create bookings for yourself',
                errors: 'You can only create bookings for yourself'
            });
            return;
        }
    }

    try {
        const booking = await bookingService.createBooking(req.body, customerId);
        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking,
        });
    } catch (error: any) {
        if (error.message === 'Vehicle not found') {
            res.status(404).json({ success: false, message: error.message, errors: error.message });
        } else if (error.message === 'Vehicle is not available' || error.message === 'End date must be after start date') {
            res.status(400).json({ success: false, message: error.message, errors: error.message });
        } else {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server error', errors: error.message });
        }
    }
};

export const getBookings = async (req: AuthRequest, res: Response): Promise<void> => {
    const currentUser = req.user;

    try {
        const bookings = await bookingService.getBookings(currentUser);

        const message = bookings.length === 0
            ? 'No bookings found'
            : (currentUser.role === 'admin' ? 'Bookings retrieved successfully' : 'Your bookings retrieved successfully');

        res.status(200).json({
            success: true,
            message: message,
            data: bookings,
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', errors: error.message });
    }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    const { bookingId } = req.params;
    const { status } = req.body;
    const currentUser = req.user;

    try {
        const updatedBooking = await bookingService.updateBookingStatus(bookingId, status, currentUser);

        if (status === 'cancelled') {
            res.status(200).json({
                success: true,
                message: 'Booking cancelled successfully',
                data: updatedBooking
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'Booking marked as returned. Vehicle is now available',
                data: updatedBooking
            });
        }
    } catch (error: any) {
        if (error.message === 'Booking not found') {
            res.status(404).json({ success: false, message: error.message, errors: error.message });
        } else if (error.message === 'Access denied' || error.message === 'Only admin can mark as returned') {
            res.status(403).json({ success: false, message: error.message, errors: error.message });
        } else if (error.message === 'Booking is not active' || error.message === 'Cannot cancel booking after start date' || error.message === 'Invalid status update') {
            res.status(400).json({ success: false, message: error.message, errors: error.message });
        } else {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server error', errors: error.message });
        }
    }
};
