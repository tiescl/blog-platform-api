import { z } from "zod";

export const usersIdDtoSchema = z.object({
    userId: z.string().uuid({ message: "Invalid User Id" })
});

export type UsersIdDto = z.infer<typeof usersIdDtoSchema>;
