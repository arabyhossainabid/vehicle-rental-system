import { Router } from 'express';
import { createBooking, getBookings, updateBookingStatus } from './booking.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createBooking);
router.get('/', authenticate, getBookings);
router.put('/:bookingId', authenticate, updateBookingStatus);

export default router;
