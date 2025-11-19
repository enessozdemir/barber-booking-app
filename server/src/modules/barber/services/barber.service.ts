import { supabase } from "../../../config/supabase";

export async function getActiveBarbers() {
  const { data, error } = await supabase
    .from("barbers")
    .select(`
      id,
      active,
      rating,
      created_at,
      users!inner (
        id,
        full_name,
        phone,
        email
      )
    `)
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getBarberById(barberId: string) {
  const { data, error } = await supabase
    .from("barbers")
    .select(`
      id,
      active,
      rating,
      created_at,
      users!inner (
        id,
        full_name,
        phone,
        email
      )
    `)
    .eq("id", barberId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getBarberByUserId(userId: string) {
  const { data, error } = await supabase
    .from("barbers")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    // Don't throw on "not found" - return null instead
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}
