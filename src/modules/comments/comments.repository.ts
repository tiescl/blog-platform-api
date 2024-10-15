import { db } from "database/data-source";
import { Comment } from "shared/entities";
import { CommentsCreateDto } from "./dto";
import { DatabaseError, NotFoundError } from "shared/errors";

export class CommentsRepository {
    static async getCommentsByPostId(postId: string): Promise<Comment[]> {
        return await db.manager.query(
            `
            SELECT *
            FROM comments
            WHERE blog_id = $1
            `,
            [postId]
        );
    }

    static async getComment(commentId: string): Promise<Comment> {
        const result = await db.manager.query(
            `
            SELECT *
            FROM comments
            WHERE id = $1
            `,
            [commentId]
        );

        if (!result[0]) {
            throw new NotFoundError(`Comment ${commentId} does not exist`);
        }

        return result[0];
    }

    static async createComment(
        comment: CommentsCreateDto
    ): Promise<Comment> {
        const result = await db.manager.query(
            `
            INSERT INTO comments
                (id, blog_id, user_id, content)
            VALUES
                ($1, $2, $3, $4)
            RETURNING *
            `,
            [comment.id, comment.blog_id, comment.user_id, comment.content]
        );

        if (!result[0]) {
            throw new DatabaseError("Errors connecting to the database");
        }

        return result[0];
    }

    static async updateComment(commentId: string, content: string) {
        const result = await db.manager.query(
            `
            UPDATE comments
            SET content = $1
            WHERE id = $2
            RETURNING *
            `,
            [content, commentId]
        );

        if (!result[0] || !result[0][0]) {
            throw new DatabaseError("Errors connecting to the database");
        }

        return result[0][0];
    }

    static async deleteComment(commentId: string): Promise<Comment> {
        const result = await db.manager.query(
            `
            DELETE FROM comments
            WHERE id = $1
            RETURNING *
            `,
            [commentId]
        );

        if (!result[0] || !result[0][0]) {
            throw new DatabaseError("Errors connecting to the database");
        }

        return result[0][0];
    }
}
