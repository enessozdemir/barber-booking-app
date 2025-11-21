import { Request, Response } from "express";
import { getActiveBarbers, getBarberById, uploadBarberAvatar, deleteBarberAvatar } from "../services/barber.service";
import { AppError } from "../../../utils/AppError";
import catchAsync from "../../../utils/catchAsync";

export const getActiveBarbersController = catchAsync(async (req: Request, res: Response) => {
    const barbers = await getActiveBarbers();
    res.status(200).json({ barbers });
});

export const getBarberByIdController = catchAsync(async (req: Request, res: Response) => {
    const { barberId } = req.params;

    if (!barberId) {
        res.status(400).json({
            code: "MISSING_BARBER_ID",
            message: "Berber ID gerekli"
        });
        return;
    }

    const barber = await getBarberById(barberId);

    if (!barber) {
        res.status(404).json({
            code: "BARBER_NOT_FOUND",
            message: "Berber bulunamadı"
        });
        return;
    }

    res.status(200).json({ barber });
});

export const uploadAvatarController = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({
            code: "UNAUTHORIZED",
            message: "Oturum açmanız gerekli"
        });
        return;
    }

    if (!req.file) {
        res.status(400).json({
            code: "NO_FILE",
            message: "Dosya yüklenmedi"
        });
        return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
        res.status(400).json({
            code: "INVALID_FILE_TYPE",
            message: "Sadece JPG, PNG ve WebP formatları desteklenir"
        });
        return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
        res.status(400).json({
            code: "FILE_TOO_LARGE",
            message: "Dosya boyutu 5MB'dan küçük olmalıdır"
        });
        return;
    }

    const avatarUrl = await uploadBarberAvatar(userId, req.file);

    res.status(200).json({
        message: "Avatar başarıyla yüklendi",
        avatarUrl
    });
});

export const deleteAvatarController = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({
            code: "UNAUTHORIZED",
            message: "Oturum açmanız gerekli"
        });
        return;
    }

    await deleteBarberAvatar(userId);

    res.status(200).json({
        message: "Avatar başarıyla silindi"
    });
});
