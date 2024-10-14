import { CommentsRepository } from "./comments.repository";
import { Comment } from "shared/entities";

export class CommentsService {
    static getCommentsByPostId(postId: string): Promise<Comment[]> {
        return CommentsRepository.getCommentsByPostId(postId);
    }
}
