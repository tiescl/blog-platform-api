import { Router } from "express";
import { PostsService } from "./posts.service";
import {
    postsCreateDtoSchema,
    postsIdDtoSchema,
    postsUpdateDtoSchema
} from "./dto";
import {
    validateRequestBody,
    validateRouteParameter,
    validateQueryParams,
    getSearchParams
} from "shared/validators";
import { StatusCode } from "shared/constants";
import { getUserFromToken } from "shared/middlewares";
import { BadRequestError, NotFoundError } from "shared/errors";
import {
    PostsPaginationDto,
    postsPaginationDtoSchema
} from "./dto/posts-pagination.dto";

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
    validateRouteParameter(postsIdDtoSchema),
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

PostsController.patch(
    "/:postId",
    validateRouteParameter(postsIdDtoSchema),
    validateRequestBody(postsUpdateDtoSchema),
    getUserFromToken,
    async function (req, res) {
        const postId = req.params["postId"];
        if (!postId) {
            throw new NotFoundError("Invalid Post Id");
        }

        const updatedPost = await PostsService.updatePost(
            res.locals.userId,
            postId,
            req.body
        );

        res.status(StatusCode.Ok).json({
            message: "Post updated successfully",
            post: updatedPost
        });
    }
);

PostsController.delete(
    "/:postId",
    validateRouteParameter(postsIdDtoSchema),
    getUserFromToken,
    async function (req, res) {
        const postId = req.params["postId"];

        if (!postId) {
            throw new NotFoundError("Invalid Post Id");
        }

        const deletedPost = await PostsService.deletePost(
            res.locals.userId,
            postId
        );

        res.status(StatusCode.Ok).json({
            message: "Post deleted successfully",
            post: deletedPost
        });
    }
);

PostsController.get(
    "/",
    validateQueryParams(postsPaginationDtoSchema),
    async function (req, res) {
        const { page, limit } = getSearchParams<PostsPaginationDto>(
            req.query
        );

        const posts = await PostsService.getPosts(page, limit);

        res.status(StatusCode.Ok).json({
            message: "Posts fetched successfully",
            posts: posts
        });
    }
);
