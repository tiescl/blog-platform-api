import { UsersService } from "modules/users/users.service";
import { CommentsService } from "modules/comments/comments.service";
import { PostsRepository } from "./posts.repository";
import { PostsCreateDto, PostsUpdateDto } from "./dto";
import { BlogPost, Comment } from "shared/entities";
import { v4 as uuid } from "uuid";

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
        limit: number = 5
    ): Promise<BlogPost[]> {
        const offset = page * limit;

        return PostsRepository.getPosts(offset, limit);
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

    static async getPostComments(postId: string): Promise<Comment[]> {
        const post = await PostsService.getPost(postId);

        return CommentsService.getCommentsByPostId(post.id);
    }
}
