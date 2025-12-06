import app from './app';
import dotenv from 'dotenv';
import { checkOverdueBookings } from './utils/check-overdue';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    checkOverdueBookings();

    setInterval(() => {
        checkOverdueBookings();
    }, 60 * 60 * 1000);
});
