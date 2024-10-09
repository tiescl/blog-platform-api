import { User } from "shared/entities/User.entity";

export type CreateUserDto = Omit<User, "created_at">;
