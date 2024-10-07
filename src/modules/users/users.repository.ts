import { db } from "database/data-source";
import { User } from "shared/entities";
import { DatabaseError, NotFoundError } from "shared/errors";
import { UsersCreateDto } from "./users.types";

export class UsersRepository {
    static async createUser(user: UsersCreateDto): Promise<User> {
        const { id, username, email, password, role } = user;

        const result = await db.manager.query(
            `
            INSERT INTO users
                (id, username, email, password, role)
            VALUES
                ($1, $2, $3, $4, $5)
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
        column: "email" | "id" = "id"
    ): Promise<User> {
        const result = await db.manager.query(
            `
            SELECT * FROM users
            WHERE ${column} = $1
        `,
            [param]
        );

        if (!result[0]) {
            throw new NotFoundError("User does not exist");
        }

        return result[0];
    }

    static async doesUserExist(param: string): Promise<boolean> {
        try {
            await this.getUser(param, "email");

            return true;
        } catch (error) {
            if (error instanceof NotFoundError) {
                return false;
            }

            throw error;
        }
    }
}
