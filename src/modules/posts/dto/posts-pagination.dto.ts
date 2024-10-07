import { z } from "zod";

export const postsPaginationDtoSchema = z.object({
    page: z
        .string()
        .transform((str) => Number(str))
        .pipe(z.number().int().nonnegative()),
    limit: z
        .string()
        .transform((str) => Number(str))
        .pipe(z.number().int().positive().max(100))
});

export type PostsPaginationDto = z.infer<typeof postsPaginationDtoSchema>;
