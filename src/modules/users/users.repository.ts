import { db } from "database/data-source";
import { User } from "shared/entities";
import { DatabaseError, NotFoundError } from "shared/errors";
import { UsersCreateDto } from "./users.types";
import { UsersUpdateDto } from "./dto/users-update.dto";

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

    static async updateUser(
        userId: string,
        user: UsersUpdateDto
    ): Promise<User> {
        const values = Object.values(user);
        const columns = Object.keys(user);
        for (let i = 0; i < columns.length; ++i) {
            columns[i] = `${columns[i]} = $${i + 1}`;
        }

        const result = await db.manager.query(
            `
            UPDATE users
            SET ${columns.join(", ")}
            WHERE id = $${values.length + 1}
            RETURNING *
            `,
            [...values, userId]
        );

        if (!result[0] || !result[0][0]) {
            throw new DatabaseError("Errors connecting to the database");
        }

        return result[0][0];
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

    static async changeUserRole(
        userId: string,
        role: "admin" | "user"
    ): Promise<User> {
        const result = await db.manager.query(
            `
            UPDATE users
            SET role = $2
            WHERE id = $1
            RETURNING *
            `,
            [userId, role]
        );

        if (!result[0] || !result[0][0]) {
            throw new DatabaseError("Errors connecting to the database");
        }

        return result[0][0];
    }
}
