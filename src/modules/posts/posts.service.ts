import { UsersService } from "modules/users/users.service";
import { CommentsService } from "modules/comments/comments.service";
import { PostsRepository } from "./posts.repository";
import { PostsCreateDto, PostsUpdateDto } from "./dto";
import { BlogPost, Comment } from "shared/entities";
import { v4 as uuid } from "uuid";
import { BlogPostLike } from "shared/entities/BlogPostLike.entity";
import { NotFoundError } from "shared/errors";

export class PostsService {
    static async createPost(
        post: Omit<PostsCreateDto, "id">,
        userId: string
    ): Promise<BlogPost> {
        const user = await UsersService.getUserById(userId);

        const newPost: PostsCreateDto = {
            id: uuid(),
            author_id: user.id,
            title: post.title,
            content: post.content,
            tags: post.tags
        };

        return PostsRepository.createPost(newPost);
    }

    static getPost(postId: string): Promise<BlogPost> {
        return PostsRepository.getPost(postId);
    }

    static getPosts(
        page: number = 0,
        limit: number = 5,
        title: string = "",
        content: string = "",
        tags: string[] = []
    ): Promise<BlogPost[]> {
        const offset = page * limit;

        return PostsRepository.getPosts(
            offset,
            limit,
            title,
            content,
            tags
        );
    }

    static async updatePost(
        postId: string,
        post: PostsUpdateDto
    ): Promise<BlogPost> {
        return PostsRepository.updatePost(postId, post);
    }

    static async deletePost(postId: string) {
        return PostsRepository.deletePost(postId);
    }

    static async createPostComment(
        postId: string,
        userId: string,
        comment: Pick<Comment, "content">
    ): Promise<Comment> {
        return CommentsService.createComment(postId, userId, comment);
    }

    static async getPostComments(postId: string): Promise<Comment[]> {
        return CommentsService.getCommentsByPostId(postId);
    }

    static async toggleLike(postId: string, userId: string) {
        const existingLike = await PostsService.getPostLikeIfExists(
            postId,
            userId
        );

        if (!existingLike) {
            await PostsRepository.createPostLike(postId, userId);
        } else {
            await PostsRepository.togglePostLike(postId, userId);
        }

        return PostsRepository.getPostLikeCount(postId);
    }

    static async getPostLikeIfExists(
        postId: string,
        userId: string
    ): Promise<BlogPostLike | null> {
        try {
            return await PostsRepository.getPostLike(postId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                return null;
            } else {
                throw error;
            }
        }
    }
}
