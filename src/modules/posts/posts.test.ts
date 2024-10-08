import request from "supertest";
import { app } from "app";
import { PostsRepository } from "./posts.repository";
import { UsersRepository } from "modules/users/users.repository";
import {
    createBlogPost,
    mockPost,
    mockPosts,
    mockUpdatePost,
    signupUser,
    StatusCode
} from "shared/constants";
import { NotFoundError } from "shared/errors";
import { User } from "shared/entities";
import { randomUUID } from "crypto";

jest.mock("./posts.repository");
jest.mock("modules/users/users.repository");

const mockPostsRepository = PostsRepository as jest.Mocked<
    typeof PostsRepository
>;
const mockUsersRepository = UsersRepository as jest.Mocked<
    typeof UsersRepository
>;

describe("Blog Post Management", () => {
    var userResBody: { token: string; user: User };

    beforeEach(async () => {
        jest.clearAllMocks();

        userResBody = await signupUser(request, app, mockUsersRepository);
    });

    describe("[POST /blogs]", () => {
        console.log(mockPosts);
        test("should create a new blog post", async () => {
            await createBlogPost(
                request,
                app,
                mockPostsRepository,
                mockUsersRepository,
                userResBody.token
            );
        });

        test("should not create a post if token is invalid", async () => {
            const res = await request(app)
                .post("/blogs")
                .set("Authorization", "Bearer token")
                .send(mockPost);

            expect(res.status).toEqual(StatusCode.Unauthenticated);
            expect(res.body.message).toEqual("Failed to identify user");
        });
    });

    describe("[GET /blogs/:postId]", () => {
        test("should fetch a blog post", async () => {
            const post = await createBlogPost(
                request,
                app,
                mockPostsRepository,
                mockUsersRepository,
                userResBody.token
            );

            mockPostsRepository.getPost.mockResolvedValueOnce(post);

            const res = await request(app).get(`/blogs/${post.id}`);

            expect(res.status).toBe(StatusCode.Ok);
            expect(mockPostsRepository.getPost).toHaveBeenCalled();
            expect(res.body.post).toEqual(post);
        });

        test("should not fetch a blog post for an invalid post id", async () => {
            mockPostsRepository.getPost.mockRejectedValueOnce(
                new NotFoundError("error when post doesn't exist")
            );
            const res = await request(app).get(`/blogs/${randomUUID()}`);

            expect(res.status).toBe(StatusCode.NotFound);
            expect(mockPostsRepository.getPost).toHaveBeenCalled();
            expect(res.body.message).toBeDefined();
        });
    });

    describe("[PATCH /blogs/:postId]", () => {
        test("should update the post", async () => {
            const post = await createBlogPost(
                request,
                app,
                mockPostsRepository,
                mockUsersRepository,
                userResBody.token,
                userResBody.user.id
            );

            mockPostsRepository.getPost.mockResolvedValueOnce(post);
            mockUsersRepository.getUser.mockResolvedValueOnce(
                userResBody.user
            );
            mockPostsRepository.updatePost.mockResolvedValueOnce({
                ...post,
                content: mockUpdatePost.content,
                tags: mockUpdatePost.tags
            });

            const res = await request(app)
                .patch(`/blogs/${post.id}`)
                .set("Authorization", `Bearer ${userResBody.token}`)
                .send(mockUpdatePost);

            expect(res.status).toBe(StatusCode.Ok);
            expect(mockPostsRepository.updatePost).toHaveBeenCalled();
        });

        test("should not update post if user is not authorized", async () => {
            const post = await createBlogPost(
                request,
                app,
                mockPostsRepository,
                mockUsersRepository,
                userResBody.token
                // not passing any value for author_id
                // so default random uuid will be used
            );

            mockPostsRepository.getPost.mockResolvedValueOnce(post);
            mockUsersRepository.getUser.mockResolvedValueOnce(
                userResBody.user
            );
            mockPostsRepository.updatePost.mockRejectedValueOnce(
                new Error("Unauthorized")
            );

            const res = await request(app)
                .patch(`/blogs/${post.id}`)
                .set("Authorization", `Bearer ${userResBody.token}`)
                .send(mockUpdatePost);

            expect(res.status).toBe(StatusCode.Forbidden);
            expect(mockPostsRepository.getPost).toHaveBeenCalled();
            expect(mockUsersRepository.getUser).toHaveBeenCalled();
            expect(mockPostsRepository.updatePost).toHaveBeenCalledTimes(
                0
            );
        });
    });

    describe("[DELETE /blogs/:postId]", () => {
        test("should delete a blog post", async () => {
            const post = await createBlogPost(
                request,
                app,
                mockPostsRepository,
                mockUsersRepository,
                userResBody.token,
                userResBody.user.id
            );

            mockPostsRepository.getPost.mockResolvedValueOnce(post);
            mockUsersRepository.getUser.mockResolvedValueOnce(
                userResBody.user
            );
            mockPostsRepository.deletePost.mockResolvedValueOnce(post);

            const res = await request(app)
                .delete(`/blogs/${post.id}`)
                .set("Authorization", `Bearer ${userResBody.token}`);

            expect(res.status).toBe(StatusCode.Ok);
            expect(mockPostsRepository.deletePost).toHaveBeenCalled();
        });

        test("should not delete post if user is not authorized", async () => {
            const post = await createBlogPost(
                request,
                app,
                mockPostsRepository,
                mockUsersRepository,
                userResBody.token
                // not passing any value for author_id
                // so default random uuid will be used
            );

            mockPostsRepository.getPost.mockResolvedValueOnce(post);
            mockUsersRepository.getUser.mockResolvedValueOnce(
                userResBody.user
            );
            mockPostsRepository.deletePost.mockRejectedValueOnce(
                new Error("Unauthorized")
            );

            const res = await request(app)
                .delete(`/blogs/${post.id}`)
                .set("Authorization", `Bearer ${userResBody.token}`);

            expect(res.status).toBe(StatusCode.Forbidden);
            expect(mockPostsRepository.getPost).toHaveBeenCalled();
            expect(mockUsersRepository.getUser).toHaveBeenCalled();
            expect(mockPostsRepository.deletePost).toHaveBeenCalledTimes(
                0
            );
        });
    });

    describe("[GET /blogs]", () => {
        test("should fetch a list of blog posts", async () => {
            mockPostsRepository.getPosts.mockResolvedValueOnce(mockPosts);

            const res = await request(app).get("/blogs?page=1&limit=10");

            expect(res.statusCode).toBe(StatusCode.Ok);
            expect(res.body).toEqual({
                message: "Posts fetched successfully",
                posts: mockPosts
            });
        });

        it("should return an empty array if there are no posts", async () => {
            mockPostsRepository.getPosts.mockResolvedValueOnce([]);

            const res = await request(app).get("/blogs?page=1&limit=10");

            expect(res.statusCode).toBe(StatusCode.Ok);
            expect(res.body).toEqual({
                message: "Posts fetched successfully",
                posts: []
            });
        });
    });
});
