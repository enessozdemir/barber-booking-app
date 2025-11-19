import { Request, Response } from "express";
import { getActiveBarbers, getBarberById, uploadBarberAvatar, deleteBarberAvatar } from "../services/barber.service";
import { AppError } from "../../auth/utils/AppError";

export const getActiveBarbersController = async (req: Request, res: Response) => {
    try {
        const barbers = await getActiveBarbers();
        res.status(200).json({ barbers });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(400).json({ code: error.code, message: error.message });
        } else {
            res.status(500).json({ code: "INTERNAL_ERROR", message: "Bir hata oluştu" });
        }
    }
};

export const getBarberByIdController = async (req: Request, res: Response) => {
    try {
        const { barberId } = req.params;

        if (!barberId) {
            return res.status(400).json({
                code: "MISSING_BARBER_ID",
                message: "Berber ID gerekli"
            });
        }

        const barber = await getBarberById(barberId);

        if (!barber) {
            return res.status(404).json({
                code: "BARBER_NOT_FOUND",
                message: "Berber bulunamadı"
            });
        }

        res.status(200).json({ barber });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(400).json({ code: error.code, message: error.message });
        } else {
            res.status(500).json({ code: "INTERNAL_ERROR", message: "Bir hata oluştu" });
        }
    }
};

export const uploadAvatarController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                code: "UNAUTHORIZED",
                message: "Oturum açmanız gerekli"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                code: "NO_FILE",
                message: "Dosya yüklenmedi"
            });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                code: "INVALID_FILE_TYPE",
                message: "Sadece JPG, PNG ve WebP formatları desteklenir"
            });
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (req.file.size > maxSize) {
            return res.status(400).json({
                code: "FILE_TOO_LARGE",
                message: "Dosya boyutu 5MB'dan küçük olmalıdır"
            });
        }

        const avatarUrl = await uploadBarberAvatar(userId, req.file);

        res.status(200).json({
            message: "Avatar başarıyla yüklendi",
            avatarUrl
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(400).json({ code: error.code, message: error.message });
        } else {
            console.error("Avatar upload error:", error);
            res.status(500).json({ code: "INTERNAL_ERROR", message: "Avatar yüklenirken hata oluştu" });
        }
    }
};

export const deleteAvatarController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                code: "UNAUTHORIZED",
                message: "Oturum açmanız gerekli"
            });
        }

        await deleteBarberAvatar(userId);

        res.status(200).json({
            message: "Avatar başarıyla silindi"
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(400).json({ code: error.code, message: error.message });
        } else {
            console.error("Avatar delete error:", error);
            res.status(500).json({ code: "INTERNAL_ERROR", message: "Avatar silinirken hata oluştu" });
        }
    }
};
