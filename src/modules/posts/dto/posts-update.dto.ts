import { z } from "zod";
import { postsCreateDtoSchema } from "./posts-create.dto";

export const postsUpdateDtoSchema = postsCreateDtoSchema.partial();

export type PostsUpdateDto = z.infer<typeof postsUpdateDtoSchema>;
