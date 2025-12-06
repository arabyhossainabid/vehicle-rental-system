import { Request, Response } from 'express';
import { VehicleService } from './vehicle.service';

const vehicleService = new VehicleService();

export const createVehicle = async (req: Request, res: Response): Promise<void> => {
    try {
        const vehicle = await vehicleService.createVehicle(req.body);
        res.status(201).json({
            success: true,
            message: 'Vehicle created successfully',
            data: vehicle,
        });
    } catch (error: any) {
        if (error.message === 'Vehicle with this registration number already exists') {
            res.status(400).json({ success: false, message: error.message, errors: error.message });
        } else if (error.message.includes('Type must be') || error.message.includes('Availability status') || error.message.includes('Daily rent price')) {
            res.status(400).json({ success: false, message: error.message, errors: error.message });
        } else {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server error', errors: error.message });
        }
    }
};

export const getAllVehicles = async (req: Request, res: Response): Promise<void> => {
    try {
        const vehicles = await vehicleService.getAllVehicles();
        if (vehicles.length === 0) {
            res.status(200).json({
                success: true,
                message: 'No vehicles found',
                data: [],
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Vehicles retrieved successfully',
            data: vehicles,
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', errors: error.message });
    }
};

export const getVehicleById = async (req: Request, res: Response): Promise<void> => {
    const { vehicleId } = req.params;

    try {
        const vehicle = await vehicleService.getVehicleById(vehicleId);
        res.status(200).json({
            success: true,
            message: 'Vehicle retrieved successfully',
            data: vehicle,
        });
    } catch (error: any) {
        if (error.message === 'Vehicle not found') {
            res.status(404).json({ success: false, message: error.message, errors: error.message });
        } else {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server error', errors: error.message });
        }
    }
};

export const updateVehicle = async (req: Request, res: Response): Promise<void> => {
    const { vehicleId } = req.params;

    try {
        const updatedVehicle = await vehicleService.updateVehicle(vehicleId, req.body);
        res.status(200).json({
            success: true,
            message: 'Vehicle updated successfully',
            data: updatedVehicle,
        });
    } catch (error: any) {
        if (error.message === 'Vehicle not found') {
            res.status(404).json({ success: false, message: error.message, errors: error.message });
        } else if (error.message.includes('Type must be') || error.message.includes('Availability status') || error.message.includes('Daily rent price')) {
            res.status(400).json({ success: false, message: error.message, errors: error.message });
        } else {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server error', errors: error.message });
        }
    }
};

export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
    const { vehicleId } = req.params;

    try {
        await vehicleService.deleteVehicle(vehicleId);
        res.status(200).json({
            success: true,
            message: 'Vehicle deleted successfully',
        });
    } catch (error: any) {
        if (error.message === 'Vehicle not found') {
            res.status(404).json({ success: false, message: error.message, errors: error.message });
        } else if (error.message === 'Cannot delete vehicle with active bookings') {
            res.status(400).json({ success: false, message: error.message, errors: error.message });
        } else {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server error', errors: error.message });
        }
    }
};