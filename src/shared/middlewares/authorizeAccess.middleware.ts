import { Request, Response, NextFunction } from "express";
import { CommentsService } from "modules/comments/comments.service";
import { PostsService } from "modules/posts/posts.service";
import { UsersService } from "modules/users/users.service";
import { BlogPost, Comment } from "shared/entities";
import { AuthorizationError } from "shared/errors";

export function authorizeAccess(roles: ("user" | "admin")[]) {
    return async function (
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const { postId, commentId } = req.params;

        var entity: BlogPost | Comment;
        var field: "author_id" | "user_id";
        if (postId) {
            entity = await PostsService.getPost(postId);
            field = "author_id";
        } else if (commentId) {
            entity = await CommentsService.getComment(commentId);
            field = "user_id";
        }
        const user = await UsersService.getUserById(res.locals.userId);

        try {
            if (
                // @ts-expect-error this should in no cases fail
                (roles.includes("user") && user.id == entity[field]) ||
                (roles.includes("admin") && user.role == "admin")
            ) {
                next();
            } else {
                throw new AuthorizationError(
                    "You are not authorized to perform this action"
                );
            }
        } catch (err) {
            next(err);
        }
    };
}
