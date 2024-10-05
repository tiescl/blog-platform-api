import { db } from "database/data-source";
import { User } from "shared/entities/User.entity";
import { DatabaseError, NotFoundError } from "shared/errors";
import { CreateUserDto } from "./users.types";

export class UsersRepository {
    static async createUser(user: CreateUserDto): Promise<User> {
        const { id, username, email, password, role } = user;

        const result = await db.manager.query(
            `
            INSERT INTO users
                (id, username, email, password, role)
            VALUES
                (?, ?, ?, ?, ?)
            RETURNING *
        `,
            [id, username, email, password, role]
        );

        if (!result[0]) {
            throw new DatabaseError("Errors connecting to the database");
        }

        return result[0];
    }

    static async getUser(
        param: string,
        byEmail: boolean = false
    ): Promise<User> {
        const column = byEmail ? "email" : "id";

        const result = await db.manager.query(
            `
            SELECT * FROM users
            WHERE ${column} = ?
        `,
            [param]
        );

        if (!result[0]) {
            throw new NotFoundError("User does not exist");
        }

        return result[0];
    }
}
