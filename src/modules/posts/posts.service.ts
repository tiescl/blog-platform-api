import { UsersService } from "modules/users/users.service";
import { PostsCreateDto } from "./dto";
import { BlogPost } from "shared/entities";
import { PostsRepository } from "./posts.repository";
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
}
