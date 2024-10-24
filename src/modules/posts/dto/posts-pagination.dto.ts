import { z } from "zod";

export const postsPaginationDtoSchema = z.object({
    page: z
        .string()
        .transform((str) => Number(str))
        .pipe(z.number().int().nonnegative())
        .optional(),
    limit: z
        .string()
        .transform((str) => Number(str))
        .pipe(z.number().int().positive().max(100))
        .optional(),
    title: z.string().toLowerCase().trim().min(2).max(255).optional(),
    content: z.string().toLowerCase().trim().min(2).max(255).optional(),
    tags: z
        .string()
        .min(1)
        .transform((tags) => tags.split(",").map((tag) => tag.trim()))
        .pipe(z.array(z.string().min(1).max(100)).min(1).max(100))
        .optional()
});

export type PostsPaginationDto = z.infer<typeof postsPaginationDtoSchema>;
