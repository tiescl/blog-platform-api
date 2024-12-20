import request from "supertest";
import { app } from "app";
import { mockUsersService } from "./repoMocks";
import { User } from "shared/entities";
import { BadRequestError } from "shared/errors";
import { v4 as uuid } from "uuid";
import bcrypt from "bcryptjs";
import { StatusCode } from "shared/constants";

jest.mock("modules/users/users.service");

describe("User Authentication", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /auth/signup", () => {
        test("should register a user", async () => {
            const newUser: User = {
                id: uuid(),
                username: "qwerty-dvorak",
                email: "qwerty@example.com",
                password: "qwerty123",
                role: "user",
                created_at: new Date()
            };

            mockUsersService.createUser.mockResolvedValueOnce(newUser);

            const response = await request(app).post("/auth/signup").send({
                username: "qwerty-dvorak",
                email: "qwerty@example.com",
                password: "qwerty123"
            });

            expect(response.status).toEqual(StatusCode.Created);
            expect(response.body.user).toEqual({
                ...newUser,
                created_at: newUser.created_at.toISOString()
            });
            expect(response.body.token).toBeDefined();
            expect(mockUsersService.createUser).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: expect.any(String),
                    username: "qwerty-dvorak",
                    email: "qwerty@example.com",
                    password: expect.any(String),
                    role: "user"
                })
            );
        });

        test("should return 401 for existing user", async () => {
            const existingUser = {
                username: "qwerty-dvorak",
                email: "qwerty@example.com",
                password: "qwerty123"
            };

            mockUsersService.createUser.mockRejectedValueOnce(
                new BadRequestError("Invalid email")
            );

            const response = await request(app)
                .post("/auth/signup")
                .send(existingUser);

            expect(response.status).toBe(StatusCode.BadRequest);
            expect(response.body.message).toBe("Invalid email");
        });
    });

    describe("POST /auth/login", () => {
        test("should log the user in", async () => {
            const userCredentials = {
                email: "qwerty@example.com",
                password: "qwerty123"
            };

            const mockUser: User = {
                id: uuid(),
                username: "qwerty-dvorak",
                email: userCredentials.email,
                password: await bcrypt.hash(userCredentials.password, 10),
                role: "user",
                created_at: new Date()
            };

            mockUsersService.getUserByEmail.mockResolvedValueOnce(
                mockUser
            );

            const response = await request(app)
                .post("/auth/login")
                .send(userCredentials);

            expect(response.status).toBe(StatusCode.Ok);
            expect(response.body.token).toBeDefined();
            expect(mockUsersService.getUserByEmail).toHaveBeenCalledWith(
                userCredentials.email
            );
        });

        test("should return 401 for invalid credentials", async () => {
            const userCredentials = {
                email: "qwerty@example.com",
                password: "wrongpassword"
            };

            const mockUser: User = {
                id: uuid(),
                username: "qwerty-dvorak",
                email: userCredentials.email,
                password: "correctpassword",
                role: "user",
                created_at: new Date()
            };

            mockUsersService.getUserByEmail.mockResolvedValueOnce(
                mockUser
            );

            const response = await request(app)
                .post("/auth/login")
                .send(userCredentials);

            expect(response.status).toBe(StatusCode.Unauthenticated);
            expect(response.body.message).toBe("Invalid Password");
        });
    });
});
