import { Router } from 'express';
import { createVehicle, getAllVehicles, getVehicleById, updateVehicle, deleteVehicle } from './vehicle.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, authorize(['admin']), createVehicle);
router.get('/', getAllVehicles);
router.get('/:vehicleId', getVehicleById);
router.put('/:vehicleId', authenticate, authorize(['admin']), updateVehicle);
router.delete('/:vehicleId', authenticate, authorize(['admin']), deleteVehicle);

export default router;
