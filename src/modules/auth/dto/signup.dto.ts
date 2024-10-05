import { z } from "zod";

export const signupDtoSchema = z.object({
    username: z.string().min(2).max(255),
    email: z.string().email(),
    password: z.string().min(8).max(255)
});

export type SignupDto = z.infer<typeof signupDtoSchema>;
