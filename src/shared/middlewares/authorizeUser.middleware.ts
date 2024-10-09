import { Request, Response, NextFunction } from "express";
import { PostsIdDto } from "modules/posts/dto";
import { PostsService } from "modules/posts/posts.service";
import { UsersService } from "modules/users/users.service";
import { AuthorizationError } from "shared/errors";
import { getRouteParams } from "shared/validators";

export async function authorizeUser(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { postId } = getRouteParams<PostsIdDto>(req.params);

    const post = await PostsService.getPost(postId);
    const user = await UsersService.getUserById(res.locals.userId);

    try {
        if (user.id != post.author_id && user.role != "admin") {
            throw new AuthorizationError(
                "You are not authorized to perform this action"
            );
        }

        next();
    } catch (err) {
        next(err);
    }
}
