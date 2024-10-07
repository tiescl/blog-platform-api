import { UsersService } from "modules/users/users.service";
import { PostsCreateDto } from "./dto";
import { BlogPost, User } from "shared/entities";
import { PostsRepository } from "./posts.repository";
import { v4 as uuid } from "uuid";
import { AuthenticationError, AuthorizationError } from "shared/errors";
import { PostsUpdateDto } from "./dto/posts-update.dto";

export class PostsService {
    static async createPost(
        post: Omit<PostsCreateDto, "id">,
        userId: string
    ): Promise<BlogPost> {
        const user = await UsersService.getUserById(userId);

        if (!user) {
            throw new AuthenticationError("Invalid token");
        }

        const newPost: PostsCreateDto = {
            id: uuid(),
            author_id: userId,
            title: post.title,
            content: post.content,
            tags: post.tags
        };

        return PostsRepository.createPost(newPost);
    }

    static getPost(postId: string): Promise<BlogPost> {
        return PostsRepository.getPost(postId);
    }

    static async updatePost(
        userId: string,
        postId: string,
        post: PostsUpdateDto
    ): Promise<BlogPost> {
        await this.authorizeUser(userId, postId);

        return PostsRepository.updatePost(postId, post);
    }

    static async deletePost(userId: string, postId: string) {
        await this.authorizeUser(userId, postId);

        return PostsRepository.deletePost(postId);
    }

    private static async authorizeUser(userId: string, postId: string) {
        const post = await this.getPost(postId);
        const user = await UsersService.getUserById(userId);

        if (user.id != post.author_id && user.role != "admin") {
            throw new AuthorizationError(
                "You are not authorized to perform this action"
            );
        }
    }
}
