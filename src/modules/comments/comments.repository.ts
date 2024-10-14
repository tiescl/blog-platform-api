import { db } from "database/data-source";
import { Comment } from "shared/entities";
import { CommentsCreateDto } from "./dto";
import { DatabaseError } from "shared/errors";

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
}
