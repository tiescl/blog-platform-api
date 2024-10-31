import request from "supertest";
import { app } from "app";
import { signupAdminUser, signupUser, StatusCode } from "shared/constants";
import { mockUsersRepository } from "./repoMocks";

jest.mock("modules/users/users.repository");

describe("User Profile Management", () => {
    beforeEach(async () => {
        jest.clearAllMocks();
    });

    describe("[PATCH /users/:userId/role]", () => {
        test("should promote a regular user to admin", async () => {
            const adminRes = await signupAdminUser(
                request,
                app,
                mockUsersRepository
            );

            const userRes = await signupUser(
                request,
                app,
                mockUsersRepository
            );

            mockUsersRepository.getUser.mockResolvedValueOnce(
                adminRes.user
            );
            mockUsersRepository.getUser.mockResolvedValueOnce(
                userRes.user
            );

            mockUsersRepository.changeUserRole.mockResolvedValueOnce({
                ...userRes.user,
                role: "admin"
            });

            const res = await request(app)
                .patch(`/users/${userRes.user.id}/role`)
                .set("Authorization", `Bearer ${adminRes.token}`)
                .send({ role: "admin" });

            expect(res.status).toEqual(StatusCode.Ok);
            expect(mockUsersRepository.getUser).toHaveBeenCalledTimes(4);
            expect(mockUsersRepository.changeUserRole).toHaveBeenCalled();
            expect(res.body.user.role).toEqual("admin");
        });

        test("should demote an admin to user", async () => {
            const adminRes = await signupAdminUser(
                request,
                app,
                mockUsersRepository
            );

            const admin1Res = await signupAdminUser(
                request,
                app,
                mockUsersRepository
            );

            mockUsersRepository.getUser.mockResolvedValueOnce(
                adminRes.user
            );
            mockUsersRepository.getUser.mockResolvedValueOnce(
                admin1Res.user
            );

            mockUsersRepository.changeUserRole.mockResolvedValueOnce({
                ...admin1Res.user,
                role: "user"
            });

            const res = await request(app)
                .patch(`/users/${admin1Res.user.id}/role`)
                .set("Authorization", `Bearer ${adminRes.token}`)
                .send({ role: "user" });

            expect(res.status).toEqual(StatusCode.Ok);
            expect(mockUsersRepository.getUser).toHaveBeenCalledTimes(4);
            expect(mockUsersRepository.changeUserRole).toHaveBeenCalled();
            expect(res.body.user.role).toEqual("user");
        });

        test("should throw an error if user is no admin", async () => {
            const userRes = await signupUser(
                request,
                app,
                mockUsersRepository
            );

            const user1Res = await signupAdminUser(
                request,
                app,
                mockUsersRepository
            );

            mockUsersRepository.getUser.mockResolvedValueOnce(
                userRes.user
            );
            mockUsersRepository.getUser.mockResolvedValueOnce(
                user1Res.user
            );

            const res = await request(app)
                .patch(`/users/${user1Res.user.id}/role`)
                .set("Authorization", `Bearer ${userRes.token}`)
                .send({ role: "admin" });

            expect(res.status).toEqual(StatusCode.Forbidden);
            expect(mockUsersRepository.getUser).toHaveBeenCalledTimes(4);
            expect(
                mockUsersRepository.changeUserRole
            ).toHaveBeenCalledTimes(0);
            expect(res.body.message).toBe(
                "You are not authorized to perform this action"
            );
        });
    });

    describe("User Profile Info Updates", () => {
        test("should update the authenticated user's profile", async () => {
            const userRes = await signupUser(
                request,
                app,
                mockUsersRepository
            );

            mockUsersRepository.updateUser.mockImplementationOnce(
                (userId, user) => {
                    return Promise.resolve({
                        ...userRes.user,
                        ...user,
                        id: userId
                    });
                }
            );

            const res = await request(app)
                .patch("/users/profile")
                .set("Authorization", `Bearer ${userRes.token}`)
                .send({ username: "dvorak", password: "neuPasswort" });

            expect(res.status).toEqual(StatusCode.Ok);
            expect(mockUsersRepository.getUser).toHaveBeenCalled();
            expect(mockUsersRepository.updateUser).toHaveBeenCalled();
            expect(res.body.user.username).toEqual("dvorak");
            expect(res.body.user.password).not.toEqual("neuPasswort");
        });

        test("should get the authenticated user's profile", async () => {
            const userRes = await signupUser(
                request,
                app,
                mockUsersRepository
            );

            mockUsersRepository.getUser.mockImplementationOnce(
                (param, column = "id") => {
                    return Promise.resolve({
                        ...userRes.user,
                        [column]: param
                    });
                }
            );

            const res = await request(app)
                .get("/users/profile")
                .set("Authorization", `Bearer ${userRes.token}`);

            expect(res.status).toEqual(StatusCode.Ok);
            expect(mockUsersRepository.getUser).toHaveBeenCalledTimes(2);
            expect(res.body.user).toEqual(userRes.user);
        });

        test("should throw if user is unauthenticated", async () => {
            const res = await request(app).get("/users/profile");

            expect(res.status).toEqual(StatusCode.Unauthenticated);
            expect(mockUsersRepository.getUser).not.toHaveBeenCalled();
            expect(res.body.message).toEqual("Failed to identify user");
        });

        test("should throw if user is unauthenticated", async () => {
            const res = await request(app).patch("/users/profile");

            expect(res.status).toEqual(StatusCode.Unauthenticated);
            expect(mockUsersRepository.getUser).not.toHaveBeenCalled();
            expect(res.body.message).toEqual("Failed to identify user");
        });
    });
});
