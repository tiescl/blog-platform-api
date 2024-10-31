import { z } from "zod";
import { signupDtoSchema } from "modules/auth/dto";

export const usersUpdateDtoSchema = signupDtoSchema.partial();

export type UsersUpdateDto = z.infer<typeof usersUpdateDtoSchema>;
