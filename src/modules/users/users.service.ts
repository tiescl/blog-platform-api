import { BadRequestError } from "shared/errors";
import { UsersRepository } from "./users.repository";
import { CreateUserDto } from "./users.types";

export class UsersService {
    static async createUser(userCredentials: CreateUserDto) {
        const userExists = await UsersRepository.userExists(
            userCredentials.email
        );

        if (userExists) {
            throw new BadRequestError("Invalid email");
        }

        return UsersRepository.createUser(userCredentials);
    }

    static getUserByEmail(email: string) {
        return UsersRepository.getUser(email, "email");
    }
}
