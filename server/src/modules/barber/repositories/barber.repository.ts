import { supabase } from "../../../config/supabase";

export class BarberRepository {
    async findActiveBarbers() {
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

        if (error) throw error;
        return data || [];
    }

    async findBarberById(barberId: string) {
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

        if (error) throw error;
        return data;
    }

    async findBarberByUserId(userId: string) {
        const { data, error } = await supabase
            .from("barbers")
            .select("*")
            .eq("id", userId)
            .single();

        if (error) return null;
        return data;
    }

    async updateBarberAvatar(userId: string, avatarUrl: string | null) {
        const { error } = await supabase
            .from('barbers')
            .update({ avatar_url: avatarUrl })
            .eq('id', userId);

        if (error) throw error;
        return true;
    }
}

export default new BarberRepository();
