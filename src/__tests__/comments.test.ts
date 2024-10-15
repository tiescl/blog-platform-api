import request from "supertest";
import { app } from "app";
import { BlogPost, Comment, User } from "shared/entities";
import {
    mockPostsRepository,
    mockUsersRepository,
    mockCommentsRepository
} from "./repoMocks";
import {
    createBlogPost,
    mockComment,
    newCompleteComment,
    signupUser,
    StatusCode
} from "shared/constants";

jest.mock("modules/posts/posts.repository");
jest.mock("modules/users/users.repository");
jest.mock("modules/comments/comments.repository");

describe("Comment Management", () => {
    var userResBody: { token: string; user: User };
    var blogResBody: BlogPost;

    beforeEach(async () => {
        jest.clearAllMocks();

        userResBody = await signupUser(request, app, mockUsersRepository);
        blogResBody = await createBlogPost(
            request,
            app,
            mockPostsRepository,
            mockUsersRepository,
            userResBody.token,
            userResBody.user.id
        );
    });

    test("should create a comment for a post", async () => {
        mockPostsRepository.getPost.mockResolvedValueOnce(blogResBody);
        mockUsersRepository.getUser.mockResolvedValueOnce(
            userResBody.user
        );
        mockCommentsRepository.createComment.mockImplementationOnce(
            (comment) => {
                return Promise.resolve({
                    ...comment,
                    updated_at: new Date(),
                    created_at: new Date()
                });
            }
        );

        const res = await request(app)
            .post(`/blogs/${blogResBody.id}/comments`)
            .set("Authorization", `Bearer ${userResBody.token}`)
            .send(mockComment);

        expect(res.status).toBe(StatusCode.Created);
        expect(mockUsersRepository.getUser).toHaveBeenCalled();
        expect(mockPostsRepository.getPost).toHaveBeenCalled();
        expect(mockCommentsRepository.createComment).toHaveBeenCalled();
        expect(res.body.comment).toEqual(
            expect.objectContaining({
                ...mockCommentsRepository.createComment.mock.calls[0]![0],
                updated_at: expect.any(String),
                created_at: expect.any(String)
            })
        );
    });

    test("should update a comment", async () => {
        const ownedComment: Comment = {
            ...newCompleteComment,
            user_id: userResBody.user.id
        };
        const commentContentToUpdate = "FizzBuzz";

        mockUsersRepository.getUser.mockResolvedValueOnce(
            userResBody.user
        );
        mockCommentsRepository.getComment.mockResolvedValueOnce(
            ownedComment
        );
        mockCommentsRepository.updateComment.mockImplementationOnce(
            (commentId: string, content: string) => {
                return Promise.resolve({
                    ...ownedComment,
                    id: commentId,
                    content: content
                });
            }
        );

        const res = await request(app)
            .patch(`/comments/${newCompleteComment.id}`)
            .set("Authorization", `Bearer ${userResBody.token}`)
            .send({ content: commentContentToUpdate });

        expect(res.status).toBe(StatusCode.Ok);
        expect(mockUsersRepository.getUser).toHaveBeenCalled();
        expect(mockCommentsRepository.getComment).toHaveBeenCalled();
        expect(mockCommentsRepository.updateComment).toHaveBeenCalled();
        expect(res.body.comment).toEqual(
            expect.objectContaining({
                ...ownedComment,
                content:
                    mockCommentsRepository.updateComment.mock.calls[0]![1],
                updated_at: expect.any(String),
                created_at: expect.any(String)
            })
        );
    });

    test("should delete a comment", async () => {
        const ownedComment: Comment = {
            ...newCompleteComment,
            user_id: userResBody.user.id
        };

        mockUsersRepository.getUser.mockResolvedValueOnce(
            userResBody.user
        );
        mockCommentsRepository.getComment.mockResolvedValueOnce(
            ownedComment
        );
        mockCommentsRepository.deleteComment.mockResolvedValueOnce(
            ownedComment
        );

        const res = await request(app)
            .delete(`/comments/${ownedComment.id}`)
            .set("Authorization", `Bearer ${userResBody.token}`);

        expect(res.status).toBe(StatusCode.Ok);
        expect(mockUsersRepository.getUser).toHaveBeenCalled();
        expect(mockCommentsRepository.getComment).toHaveBeenCalled();
        expect(mockCommentsRepository.deleteComment).toHaveBeenCalled();
    });
});
