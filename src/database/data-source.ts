import { DataSource } from "typeorm";

class DbClient {
    public readonly connection = new DataSource({
        type: "postgres",
        host: `${process.env.DB_HOST}`,
        database: `${process.env.DB_NAME}`,
        port: 5432,
        logging: false,
        entities: []
    });

    public async init() {
        if (!this.connection.isInitialized) {
            await this.connection.initialize();
        }
    }

    public async onAppInit() {
        const queryRunner = this.connection.createQueryRunner();

        const CREATE_USER_TABLE_QUERY = `
            CREATE TABLE IF NOT EXISTS User (
                user_id UUID PRIMARY KEY,
                user_username VARCHAR(255) UNIQUE NOT NULL,
                user_password VARCHAR(255) NOT NULL
            );
        `;

        try {
            await queryRunner.query(CREATE_USER_TABLE_QUERY);
        } catch (error) {
            throw new Error(`Table creation failed: ${error}`);
        } finally {
            await queryRunner.release();
        }
    }

    public get manager() {
        return this.connection.manager;
    }
}

export const db = new DbClient();
