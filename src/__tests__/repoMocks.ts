import { CommentsRepository } from "modules/comments/comments.repository";
import { PostsRepository } from "modules/posts/posts.repository";
import { UsersRepository } from "modules/users/users.repository";
import { UsersService } from "modules/users/users.service";

export const mockPostsRepository = PostsRepository as jest.Mocked<
    typeof PostsRepository
>;
export const mockUsersRepository = UsersRepository as jest.Mocked<
    typeof UsersRepository
>;
export const mockUsersService = UsersService as jest.Mocked<
    typeof UsersService
>;
export const mockCommentsRepository = CommentsRepository as jest.Mocked<
    typeof CommentsRepository
>;

export type TMockCommentsRepo = typeof mockCommentsRepository;
export type TMockUserRepo = typeof mockUsersRepository;
export type TMockPostsRepo = typeof mockPostsRepository;
