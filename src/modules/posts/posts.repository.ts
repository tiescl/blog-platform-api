import { BlogPost } from "shared/entities";
import { PostsCreateDto } from "./dto";
import { db } from "database/data-source";
import { DatabaseError, NotFoundError } from "shared/errors";
import { PostsUpdateDto } from "./dto/posts-update.dto";
import { BlogPostLike } from "shared/entities/BlogPostLike.entity";

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

    static getPosts(
        offset: number,
        limit: number,
        title: string,
        content: string,
        tags: string[]
    ): Promise<BlogPost[]> {
        const params = [];
        let query = `
            SELECT * FROM posts
            WHERE 42 != 69
        `;

        if (title) {
            params.push(`%${title}%`);
            query += `
                AND title ILIKE $${params.length}
            `;
        }

        if (content) {
            params.push(`%${content}%`);
            query += `
                AND content ILIKE $${params.length}
            `;
        }

        if (tags.length > 0) {
            params.push(tags);
            query += `
                AND tags && $${params.length}
            `;
        }

        params.push(offset);
        params.push(limit);
        query += `
            OFFSET $${params.length - 1}
            LIMIT $${params.length}
        `;

        const result = db.manager.query(query, params);

        return result;
    }

    static async updatePost(postId: string, post: PostsUpdateDto) {
        const values = Object.values(post);
        const columns = Object.keys(post);
        for (let i = 0; i < columns.length; ++i) {
            columns[i] = `${columns[i]} = $${i + 1}`;
        }

        const result = await db.manager.query(
            `
            UPDATE posts
            SET ${columns.join(", ")}
            WHERE id = $${values.length + 1}
            RETURNING *
            `,
            [...values, postId]
        );

        if (!result[0] || !result[0][0]) {
            throw new DatabaseError("Errors connecting to the database");
        }

        return result[0][0];
    }

    static async deletePost(postId: string) {
        const result = await db.manager.query(
            `
            DELETE FROM posts
            WHERE id = $1
            RETURNING *
            `,
            [postId]
        );

        if (!result[0] || !result[0][0]) {
            throw new DatabaseError("Errors connecting to the database");
        }

        return result[0][0];
    }

    static async getPostLike(
        postId: string,
        userId: string
    ): Promise<BlogPostLike> {
        const result = await db.manager.query(
            `
            SELECT * FROM blog_likes
            WHERE post_id = $1 AND user_id = $2
            `,
            [postId, userId]
        );

        if (!result[0]) {
            throw new NotFoundError(
                `Like for Post ${postId} does not exist`
            );
        }

        return result[0];
    }

    static async createPostLike(postId: string, userId: string) {
        const result = await db.manager.query(
            `
            INSERT INTO blog_likes
                (post_id, user_id)
            VALUES
                ($1, $2)
            RETURNING *
            `,
            [postId, userId]
        );

        if (!result[0]) {
            throw new DatabaseError("Errors connecting to the database");
        }

        return result[0];
    }

    static async togglePostLike(postId: string, userId: string) {
        const result = await db.manager.query(
            `
            UPDATE blog_likes
            SET liked = NOT liked
            WHERE post_id = $1 AND user_id = $2
            RETURNING *
            `,
            [postId, userId]
        );

        if (!result[0] || !result[0][0]) {
            throw new DatabaseError("Errors connecting to the database");
        }

        return result[0][0];
    }

    static async getPostLikeCount(postId: string) {
        await db.manager.query(
            "REFRESH MATERIALIZED VIEW blog_like_counts"
        );

        const result = await db.manager.query(
            `
            SELECT like_count
            FROM blog_like_counts
            WHERE post_id = $1
            `,
            [postId]
        );

        if (!result[0]) {
            return { like_count: "0" };
        }

        return result[0];
    }
}
