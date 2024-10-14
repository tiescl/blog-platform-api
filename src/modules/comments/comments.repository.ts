import { db } from "database/data-source";
import { Comment } from "shared/entities";

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
}
