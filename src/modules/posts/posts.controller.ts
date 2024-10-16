import { Router } from "express";
import { PostsService } from "./posts.service";
import {
    postsIdDtoSchema,
    postsCreateDtoSchema,
    postsUpdateDtoSchema,
    postsPaginationDtoSchema,
    PostsIdDto,
    PostsPaginationDto
} from "./dto";
import {
    validateRequestBody,
    validateRouteParameter,
    validateQueryParams,
    getSearchParams,
    getRouteParams
} from "shared/validators";
import { StatusCode } from "shared/constants";
import { authorizeUser, getUserFromToken } from "shared/middlewares";

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
        const { postId } = getRouteParams<PostsIdDto>(req.params);

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
    authorizeUser,
    async function (req, res) {
        const { postId } = getRouteParams<PostsIdDto>(req.params);

        const updatedPost = await PostsService.updatePost(
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
    authorizeUser,
    async function (req, res) {
        const { postId } = getRouteParams<PostsIdDto>(req.params);

        const deletedPost = await PostsService.deletePost(postId);

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
