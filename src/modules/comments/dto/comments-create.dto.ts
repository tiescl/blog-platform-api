import { z } from "zod";
import { Comment } from "shared/entities";

export const commentsCreateDtoSchema = z.object({
    content: z.string().trim().min(1).max(1024)
});

export type CommentsCreateDto = Omit<Comment, "updated_at" | "created_at">;
