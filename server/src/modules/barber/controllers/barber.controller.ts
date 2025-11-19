import { Request, Response } from "express";
import * as barberService from "../services/barber.service";

export async function getActiveBarbers(req: Request, res: Response) {
    try {
        const barbers = await barberService.getActiveBarbers();
        return res.json({ barbers });
    } catch (err: any) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            error: {
                code: err.code || 'INTERNAL_SERVER_ERROR',
                message: err.message || 'Failed to fetch barbers'
            }
        });
    }
}

export async function getBarberById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const barber = await barberService.getBarberById(id);

        if (!barber) {
            return res.status(404).json({
                error: {
                    code: 'BARBER_NOT_FOUND',
                    message: 'Barber not found'
                }
            });
        }

        return res.json({ barber });
    } catch (err: any) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            error: {
                code: err.code || 'INTERNAL_SERVER_ERROR',
                message: err.message || 'Failed to fetch barber'
            }
        });
    }
}
