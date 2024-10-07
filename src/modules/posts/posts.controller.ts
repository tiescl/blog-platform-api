import { Router } from "express";
import { PostsService } from "./posts.service";
import { validateRequestBody } from "shared/validators";
import { postsCreateDtoSchema } from "./dto";
import { StatusCode } from "shared/constants";
import { getUserFromToken } from "shared/middlewares";

export const PostsController = Router();

PostsController.post(
    "/",
    validateRequestBody(postsCreateDtoSchema),
    getUserFromToken,
    async function (req, res) {
        const newPost = await PostsService.createPost(
            req.body,
            res.locals.userId
        );

        res.status(StatusCode.Created).json({
            message: "Blog Post created successfully",
            post: newPost
        });
    }
);
