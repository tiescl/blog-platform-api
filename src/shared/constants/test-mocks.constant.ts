import { PostsCreateDto } from "modules/posts/dto";
import { UsersCreateDto } from "modules/users/users.types";
import { BlogPost, User } from "shared/entities";
import { v4 as uuid } from "uuid";
import { StatusCode } from "./status-codes.constant";

export const mockUser: Omit<UsersCreateDto, "id" | "role"> = {
    username: "qwerty",
    email: "qwerty@google.com",
    password: "qwerty123"
};

export const mockPost: Omit<PostsCreateDto, "id" | "author_id"> = {
    title: "post",
    content: "posty post",
    tags: ["tag1", "tag2"]
};

export const mockUpdatePost: Omit<
    PostsCreateDto,
    "title" | "id" | "author_id"
> = {
    content: "posty post",
    tags: ["tag3", "tag4"]
};

export const newCompletePost: BlogPost = {
    id: uuid(),
    author_id: uuid(),
    ...mockPost,
    updated_at: new Date(),
    created_at: new Date()
};

export const mockPosts = new Array(10)
    .fill(newCompletePost)
    .map((post) => {
        return {
            ...post,
            created_at: post.created_at.toISOString(),
            updated_at: post.updated_at.toISOString()
        };
    });

export const newCompleteUser: User = {
    id: uuid(),
    username: "qwerty-dvorak",
    email: "qwerty@example.com",
    password: "qwerty123",
    role: "user",
    created_at: new Date()
};

export async function signupUser(
    // @ts-ignore
    request,
    // @ts-ignore
    app,
    // @ts-ignore
    mockUsersRepository
) {
    mockUsersRepository.getUser.mockRejectedValueOnce(
        new Error("error indicating the user does not exist")
    );

    mockUsersRepository.createUser.mockResolvedValueOnce(newCompleteUser);

    const signupRes = await request(app)
        .post("/auth/signup")
        .send(mockUser);

    expect(signupRes.body.token).toBeDefined();
    expect(signupRes.body.user).toBeDefined();

    return signupRes.body;
}

export async function createBlogPost(
    // @ts-ignore
    request,
    // @ts-ignore
    app,
    // @ts-ignore
    mockPostsRepository,
    // @ts-ignore
    mockUsersRepository,
    // @ts-ignore
    token,
    // @ts-ignore
    author_id = ""
) {
    mockPostsRepository.createPost.mockResolvedValue({
        ...newCompletePost,
        author_id: author_id || newCompletePost.author_id
    });

    mockUsersRepository.getUser.mockResolvedValueOnce(newCompleteUser);

    const res = await request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(mockPost);

    expect(mockPostsRepository.createPost).toHaveBeenCalled();
    expect(mockUsersRepository.getUser).toHaveBeenCalled();
    expect(res.statusCode).toBe(StatusCode.Created);
    expect(res.body.message).toEqual("Blog Post created successfully");
    expect(res.body.post).toEqual({
        ...newCompletePost,
        author_id: author_id || newCompletePost.author_id,
        updated_at: newCompletePost.updated_at.toISOString(),
        created_at: newCompletePost.created_at.toISOString()
    });

    return res.body.post;
}
