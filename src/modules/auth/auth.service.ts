import { LoginDto, SignupDto } from "./dto";
import { User } from "shared/entities/User.entity";
import { AuthenticationError, ServerError } from "shared/errors";
import { UsersService } from "modules/users/users.service";
import { CreateUserDto } from "modules/users/users.types";
import { TOKEN_EXPIRATION_TIME } from "./auth.constants";
import { v4 as uuid } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class AuthService {
    static async login(userCredentials: LoginDto): Promise<string> {
        const { email, password } = userCredentials;

        const user = await UsersService.getUserByEmail(email);

        const isPasswordValid = await this.verifyPassword(
            password,
            user.password
        );

        if (isPasswordValid) {
            return this.generateToken(user.id);
        }

        throw new AuthenticationError("Invalid Password");
    }

    static async signup(
        userCredentials: SignupDto
    ): Promise<{ user: User; token: string }> {
        const { username, email, password } = userCredentials;

        const newUser: CreateUserDto = {
            id: uuid(),
            username,
            email,
            password: await this.hashPassword(password),
            role: "user"
        };

        const user = await UsersService.createUser(newUser);
        const token = this.generateToken(newUser.id);

        return { user, token };
    }

    private static async hashPassword(password: string) {
        const salt = await bcrypt.genSalt(10);

        return bcrypt.hash(password, salt);
    }

    private static generateToken(id: string) {
        const key = process.env.SECRET_JWT_KEY;

        if (!key) {
            throw new ServerError("Internal Server Error");
        }

        return jwt.sign({ id }, key, {
            expiresIn: TOKEN_EXPIRATION_TIME
        });
    }

    private static verifyPassword(password: string, hash: string) {
        return bcrypt.compare(password, hash);
    }
}
