import { z } from "zod";

export const usersRoleDtoSchema = z.object({
    role: z.enum(["admin", "user"])
});

export type UsersRoleDto = z.infer<typeof usersRoleDtoSchema>;
