import { supabase } from "../../../config/supabase";

export class AuthRepository {
    async findUserByPhone(phone: string) {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("phone", phone)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async findUserByEmail(email: string) {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async findUserById(id: string) {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async createUser(user: any) {
        const { data, error } = await supabase
            .from("users")
            .insert(user)
            .select()
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async updateUserPassword(id: string, password: string) {
        const { error } = await supabase
            .from("users")
            .update({ password })
            .eq("id", id);

        if (error) throw error;
        return true;
    }

    async updateUser(id: string, data: any) {
        const { data: updatedUser, error } = await supabase
            .from("users")
            .update(data)
            .eq("id", id)
            .select("id, phone, email, full_name, role")
            .single();

        if (error) throw error;
        return updatedUser;
    }

    async findUserByPhoneExcludingId(phone: string, excludeId: string) {
        const { data, error } = await supabase
            .from("users")
            .select("id")
            .eq("phone", phone)
            .neq("id", excludeId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async findUserByEmailExcludingId(email: string, excludeId: string) {
        const { data, error } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .neq("id", excludeId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }
}

export default new AuthRepository();
