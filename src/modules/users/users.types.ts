import { User } from "shared/entities";

export type CreateUserDto = Omit<User, "created_at">;
