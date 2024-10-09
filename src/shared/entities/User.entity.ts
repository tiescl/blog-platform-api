export interface User {
    id: string;
    email: string;
    username: string;
    password: string;
    role: "admin" | "user";
    created_at: Date;
}
