import { z } from "zod";

export const commentsIdDtoSchema = z.object({
    commentId: z.string().uuid({ message: "Invalid Comment Id" })
});

export type CommentsIdDto = z.infer<typeof commentsIdDtoSchema>;
