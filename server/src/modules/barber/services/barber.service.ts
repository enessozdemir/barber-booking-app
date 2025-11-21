import { AppError } from "../../../utils/AppError";
import barberRepository from "../repositories/barber.repository";
import { supabase } from "../../../config/supabase";
import logger from "../../../utils/logger";

export async function getActiveBarbers() {
  try {
    return await barberRepository.findActiveBarbers();
  } catch (error) {
    throw new Error("Failed to fetch barbers");
  }
}

export async function getBarberById(barberId: string) {
  try {
    return await barberRepository.findBarberById(barberId);
  } catch (error) {
    throw new Error("Failed to fetch barber");
  }
}

export async function getBarberByUserId(userId: string) {
  return await barberRepository.findBarberByUserId(userId);
}

export async function uploadBarberAvatar(userId: string, file: any) {
  // Check if user is a barber
  const barber = await getBarberByUserId(userId);
  if (!barber) {
    throw new AppError("BARBER_NOT_FOUND", "Berber bulunamadı", 404);
  }

  // Delete old avatar if exists
  if (barber.avatar_url) {
    const oldFileName = barber.avatar_url.split('/').pop();
    if (oldFileName) {
      await supabase.storage
        .from('barber-avatars')
        .remove([oldFileName]);
    }
  }

  // Generate unique filename
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${userId} -${Date.now()}.${fileExt} `;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('barber-avatars')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true
    });

  if (uploadError) {
    logger.error(`Supabase Storage upload error: ${uploadError.message}`);
    throw new AppError("UPLOAD_FAILED", `Dosya yüklenemedi: ${uploadError.message} `, 500);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('barber-avatars')
    .getPublicUrl(fileName);

  const avatarUrl = urlData.publicUrl;

  // Update barber record
  try {
    await barberRepository.updateBarberAvatar(userId, avatarUrl);
  } catch (updateError) {
    // Rollback: delete uploaded file
    await supabase.storage
      .from('barber-avatars')
      .remove([fileName]);
    throw new AppError("UPDATE_FAILED", "Avatar kaydedilemedi", 500);
  }

  return avatarUrl;
}

export async function deleteBarberAvatar(userId: string) {
  // Check if user is a barber
  const barber = await getBarberByUserId(userId);
  if (!barber) {
    throw new AppError("BARBER_NOT_FOUND", "Berber bulunamadı", 404);
  }

  if (!barber.avatar_url) {
    throw new AppError("NO_AVATAR", "Silinecek avatar bulunamadı", 400);
  }

  // Extract filename from URL
  const fileName = barber.avatar_url.split('/').pop();
  if (!fileName) {
    throw new AppError("INVALID_URL", "Geçersiz avatar URL", 400);
  }

  // Delete from storage
  const { error: deleteError } = await supabase.storage
    .from('barber-avatars')
    .remove([fileName]);

  if (deleteError) {
    throw new AppError("DELETE_FAILED", "Dosya silinemedi", 500);
  }

  // Update barber record
  try {
    await barberRepository.updateBarberAvatar(userId, null);
  } catch (updateError) {
    throw new AppError("UPDATE_FAILED", "Avatar kaydı güncellenemedi", 500);
  }
}
