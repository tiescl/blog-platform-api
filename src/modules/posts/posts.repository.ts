import { BlogPost } from "shared/entities";
import { PostsCreateDto } from "./dto";
import { db } from "database/data-source";
import { DatabaseError, NotFoundError } from "shared/errors";

export class PostsRepository {
    static async createPost(post: PostsCreateDto): Promise<BlogPost> {
        const result = await db.manager.query(
            `
            INSERT INTO posts
            (id, author_id, title, content, tags)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [...Object.values(post)]
        );

        if (!result[0]) {
            throw new DatabaseError("Errors connecting to the database");
        }

        return result[0];
    }

    static async getPost(postId: string) {
        const result = await db.manager.query(
            `
            SELECT *
            FROM posts
            WHERE id = $1
            `,
            [postId]
        );

        if (!result[0]) {
            throw new NotFoundError(`Post ${postId} does not exist`);
        }

        return result[0];
    }
}
