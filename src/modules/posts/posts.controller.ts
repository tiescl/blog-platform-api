import { Router } from "express";
import { PostsService } from "./posts.service";
import {
    validateQueryParameter,
    validateRequestBody
} from "shared/validators";
import { postsCreateDtoSchema, PostsIdDto, postsIdDtoSchema } from "./dto";
import { StatusCode } from "shared/constants";
import { getUserFromToken } from "shared/middlewares";
import { BadRequestError } from "shared/errors";

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

PostsController.get(
    "/:postId",
    validateQueryParameter(postsIdDtoSchema),
    async function (req, res) {
        const postId = req.params.postId;

        if (!postId) {
            throw new BadRequestError("Invalid Post Id");
        }

        const blogPost = await PostsService.getPost(postId);

        res.status(StatusCode.Ok).json({
            message: "Blog Post fetched successfully",
            post: blogPost
        });
    }
);
