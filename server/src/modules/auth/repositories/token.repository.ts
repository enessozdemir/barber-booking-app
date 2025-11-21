import { supabase } from "../../../config/supabase";

export class TokenRepository {
    async createRefreshToken(data: { user_id: string; token: string; expires_at: string; revoked: boolean }) {
        const { data: result, error } = await supabase
            .from("refresh_tokens")
            .insert(data)
            .select()
            .maybeSingle();

        if (error) throw error;
        return result;
    }

    async findRefreshToken(tokenHash: string) {
        const { data, error } = await supabase
            .from("refresh_tokens")
            .select("*")
            .eq("token", tokenHash)
            .eq("revoked", false)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async revokeRefreshTokenById(id: string, revokedAt: string) {
        try {
            const { data, error } = await supabase
                .from("refresh_tokens")
                .update({ revoked: true, revoked_at: revokedAt })
                .eq("id", id)
                .select()
                .maybeSingle();

            if (error) throw error;
            return data;
        } catch (err: any) {
            // Fallback for missing revoked_at column
            const { data, error } = await supabase
                .from("refresh_tokens")
                .update({ revoked: true })
                .eq("id", id)
                .select()
                .maybeSingle();

            if (error) throw error;
            return data;
        }
    }

    async revokeAllForUser(userId: string, revokedAt: string) {
        try {
            const { data, error } = await supabase
                .from("refresh_tokens")
                .update({ revoked: true, revoked_at: revokedAt })
                .eq("user_id", userId)
                .select();

            if (error) throw error;
            return data;
        } catch (err: any) {
            const { data, error } = await supabase
                .from("refresh_tokens")
                .update({ revoked: true })
                .eq("user_id", userId)
                .select();

            if (error) throw error;
            return data;
        }
    }
}

export default new TokenRepository();
