import { UsersRepository } from "./users.repository";
import { CreateUserDto } from "./users.types";

export class UsersService {
    static createUser(userCredentials: CreateUserDto) {
        return UsersRepository.createUser(userCredentials);
    }

    static getUserByEmail(email: string) {
        return UsersRepository.getUser(email, true);
    }
}
