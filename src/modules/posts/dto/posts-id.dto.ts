import { z } from "zod";

export const postsIdDtoSchema = z.object({
    postId: z.string().uuid({ message: "Invalid Post Id" })
});

export type PostsIdDto = z.infer<typeof postsIdDtoSchema>;
