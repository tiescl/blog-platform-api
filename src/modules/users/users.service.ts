import { AuthService } from "modules/auth/auth.service";
import { UsersRoleDto } from "./dto";
import { UsersUpdateDto } from "./dto/users-update.dto";
import { UsersRepository } from "./users.repository";
import { UsersCreateDto } from "./users.types";
import { BadRequestError } from "shared/errors";

export class UsersService {
    static async createUser(userCredentials: UsersCreateDto) {
        const user = await UsersService.getUserIfExists(
            userCredentials.email
        );

        if (user) {
            throw new BadRequestError("Invalid email");
        }

        return UsersRepository.createUser(userCredentials);
    }

    static async updateUser(userId: string, user: UsersUpdateDto) {
        user.password &&= await AuthService.hashPassword(user.password);

        return UsersRepository.updateUser(userId, user);
    }

    static async changeUserRole(userId: string, { role }: UsersRoleDto) {
        const user = await UsersService.getUserById(userId);

        return UsersRepository.changeUserRole(user.id, role);
    }

    static async getUserIfExists(email: string) {
        try {
            return await UsersRepository.getUser(email, "email");
        } catch {
            return null;
        }
    }

    static getUserByEmail(email: string) {
        return UsersRepository.getUser(email, "email");
    }

    static getUserById(id: string) {
        return UsersRepository.getUser(id);
    }
}
