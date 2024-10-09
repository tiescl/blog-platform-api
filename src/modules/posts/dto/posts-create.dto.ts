import { z } from "zod";

export const postsCreateDtoSchema = z.object({
    title: z.string().trim().min(2).max(255),
    content: z.string().trim().min(2).max(15000),
    tags: z.array(z.string().trim().max(100)).max(100)
});

export type PostsCreateDto = z.infer<typeof postsCreateDtoSchema> & {
    id: string;
    author_id: string;
};
