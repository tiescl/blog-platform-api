import { UsersService } from "modules/users/users.service";
import { CommentsRepository } from "./comments.repository";
import { Comment } from "shared/entities";
import { PostsService } from "modules/posts/posts.service";
import { CommentsCreateDto } from "./dto";
import { v4 as uuid } from "uuid";

export class CommentsService {
    static async getCommentsByPostId(postId: string): Promise<Comment[]> {
        const post = await PostsService.getPost(postId);

        return CommentsRepository.getCommentsByPostId(post.id);
    }

    static async createComment(
        postId: string,
        userId: string,
        comment: Pick<Comment, "content">
    ): Promise<Comment> {
        const post = await PostsService.getPost(postId);
        const user = await UsersService.getUserById(userId);

        const newComment: CommentsCreateDto = {
            id: uuid(),
            blog_id: post.id,
            user_id: user.id,
            content: comment.content
        };

        return CommentsRepository.createComment(newComment);
    }
}
