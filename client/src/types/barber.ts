export interface Barber {
    id: string;
    active: boolean;
    created_at: string;
    avatar_url?: string | null;
    users: {
        id: string;
        full_name: string;
        phone: string;
        email: string;
    };
}
