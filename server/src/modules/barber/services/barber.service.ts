import { supabase } from "../../../config/supabase";
import { AppError } from "../../auth/utils/AppError";

export async function getActiveBarbers() {
  const { data, error } = await supabase
    .from("barbers")
    .select(`
      id,
      active,
      created_at,
      avatar_url,
      users!inner (
        id,
        full_name,
        phone,
        email
      )
    `)
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Failed to fetch barbers");
  }

  return data || [];
}

export async function getBarberById(barberId: string) {
  const { data, error } = await supabase
    .from("barbers")
    .select(`
      id,
      active,
      created_at,
      avatar_url,
      users!inner (
        id,
        full_name,
        phone,
        email
      )
    `)
    .eq("id", barberId)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to fetch barber");
  }

  return data;
}

export async function getBarberByUserId(userId: string) {
  const { data, error } = await supabase
    .from("barbers")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function uploadBarberAvatar(userId: string, file: any) {
  // Check if user is a barber
  const barber = await getBarberByUserId(userId);
  if (!barber) {
    throw new AppError("BARBER_NOT_FOUND", "Berber bulunamadı");
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
  const fileName = `${userId}-${Date.now()}.${fileExt}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('barber-avatars')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true
    });

  if (uploadError) {
    console.error('Supabase Storage upload error:', uploadError);
    throw new AppError("UPLOAD_FAILED", `Dosya yüklenemedi: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('barber-avatars')
    .getPublicUrl(fileName);

  const avatarUrl = urlData.publicUrl;

  // Update barber record
  const { error: updateError } = await supabase
    .from('barbers')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  if (updateError) {
    // Rollback: delete uploaded file
    await supabase.storage
      .from('barber-avatars')
      .remove([fileName]);
    throw new AppError("UPDATE_FAILED", "Avatar kaydedilemedi");
  }

  return avatarUrl;
}

export async function deleteBarberAvatar(userId: string) {
  // Check if user is a barber
  const barber = await getBarberByUserId(userId);
  if (!barber) {
    throw new AppError("BARBER_NOT_FOUND", "Berber bulunamadı");
  }

  if (!barber.avatar_url) {
    throw new AppError("NO_AVATAR", "Silinecek avatar bulunamadı");
  }

  // Extract filename from URL
  const fileName = barber.avatar_url.split('/').pop();
  if (!fileName) {
    throw new AppError("INVALID_URL", "Geçersiz avatar URL");
  }

  // Delete from storage
  const { error: deleteError } = await supabase.storage
    .from('barber-avatars')
    .remove([fileName]);

  if (deleteError) {
    throw new AppError("DELETE_FAILED", "Dosya silinemedi");
  }

  // Update barber record
  const { error: updateError } = await supabase
    .from('barbers')
    .update({ avatar_url: null })
    .eq('id', userId);

  if (updateError) {
    throw new AppError("UPDATE_FAILED", "Avatar kaydı güncellenemedi");
  }
}
