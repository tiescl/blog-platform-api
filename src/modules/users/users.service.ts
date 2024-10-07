import { BadRequestError } from "shared/errors";
import { UsersRepository } from "./users.repository";
import { UsersCreateDto } from "./users.types";

export class UsersService {
    static async createUser(userCredentials: UsersCreateDto) {
        const doesUserExist = await UsersRepository.doesUserExist(
            userCredentials.email
        );

        if (doesUserExist) {
            throw new BadRequestError("Invalid email");
        }

        return UsersRepository.createUser(userCredentials);
    }

    static getUserByEmail(email: string) {
        return UsersRepository.getUser(email, "email");
    }

    static getUserById(id: string) {
        return UsersRepository.getUser(id);
    }
}
