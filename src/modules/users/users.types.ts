import { User } from "shared/entities";

export type UsersCreateDto = Omit<User, "created_at">;
