import { DataSource } from "typeorm";
import { DatabaseError } from "shared/errors";

class DbClient {
    public readonly connection = new DataSource({
        type: "postgres",
        host: process.env.DB_HOST,
        username: process.env.DB_USER,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT) || 5432,
        logging: false
    });

    public async init() {
        if (!this.connection.isInitialized) {
            await this.connection.initialize();
        }
    }

    public async onAppInit() {
        const queryRunner = this.connection.createQueryRunner();

        const CREATE_USER_TABLE_QUERY = `
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(10) NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `;

        const UPDATE_MODIFIED_FUNCTION = `
            CREATE OR REPLACE FUNCTION update_modified_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = now();
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `;

        const UPDATE_MODIFIED_TRIGGER = `
            CREATE OR REPLACE TRIGGER update_post_modtime
            BEFORE UPDATE ON posts
            FOR EACH ROW
            EXECUTE FUNCTION update_modified_column();
        `;

        const CREATE_POST_TABLE_QUERY = `
            CREATE TABLE IF NOT EXISTS posts (
                id UUID PRIMARY KEY,
                author_id UUID REFERENCES users(id),
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                tags VARCHAR(100) ARRAY,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `;

        try {
            await queryRunner.query(UPDATE_MODIFIED_FUNCTION);
            await queryRunner.query(CREATE_USER_TABLE_QUERY);
            await queryRunner.query(CREATE_POST_TABLE_QUERY);
            await queryRunner.query(UPDATE_MODIFIED_TRIGGER);
        } catch (error) {
            throw new DatabaseError(`Table creation failed: ${error}`);
        } finally {
            await queryRunner.release();
        }
    }

    public get manager() {
        return this.connection.manager;
    }
}

export const db = new DbClient();
