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

        const UPDATE_MODIFIED_TRIGGER_POSTS = `
            CREATE OR REPLACE TRIGGER update_post_modtime
            BEFORE UPDATE ON posts
            FOR EACH ROW
            EXECUTE FUNCTION update_modified_column();
        `;

        const UPDATE_MODIFIED_TRIGGER_COMMENTS = `
            CREATE OR REPLACE TRIGGER update_comment_modtime
            BEFORE UPDATE ON comments
            FOR EACH ROW
            EXECUTE FUNCTION update_modified_column();
        `;

        const INDEX_POSTS_TITLE = `
            CREATE INDEX IF NOT EXISTS title_index ON posts (title);
        `;

        const INDEX_POSTS_CONTENT = `
            CREATE INDEX IF NOT EXISTS content_index ON posts USING GIN (to_tsvector('english', content));
        `;

        const INDEX_POSTS_TAGS = `
            CREATE INDEX IF NOT EXISTS tags_index ON posts USING GIN (tags);
        `;

        const UPDATE_MODIFIED_TRIGGER_BLOG_LIKES = `
            CREATE OR REPLACE TRIGGER update_blog_like_modtime
            BEFORE UPDATE ON blog_likes
            FOR EACH ROW
            EXECUTE FUNCTION update_modified_column();
        `;

        const CREATE_POST_TABLE_QUERY = `
            CREATE TABLE IF NOT EXISTS posts (
                id UUID PRIMARY KEY,
                author_id UUID REFERENCES users(id) ON DELETE SET NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                tags VARCHAR(100) ARRAY,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `;

        const CREATE_COMMENT_TABLE_QUERY = `
            CREATE TABLE IF NOT EXISTS comments (
                id UUID PRIMARY KEY,
                blog_id UUID REFERENCES posts(id) ON DELETE CASCADE,
                user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                content TEXT NOT NULL,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `;

        const CREATE_BLOG_LIKE_TABLE_QUERY = `
            CREATE TABLE IF NOT EXISTS blog_likes (
                post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                liked BOOLEAN NOT NULL DEFAULT TRUE,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (post_id, user_id)
            )
        `;

        const CREATE_BLOG_LIKE_COUNT_VIEW = `
            CREATE MATERIALIZED VIEW IF NOT EXISTS blog_like_counts AS
            SELECT post_id, COUNT(*) AS like_count
            FROM blog_likes
            WHERE liked = TRUE
            GROUP BY post_id;
        `;

        try {
            await Promise.all([
                queryRunner.query(UPDATE_MODIFIED_FUNCTION),
                queryRunner.query(CREATE_USER_TABLE_QUERY),
                queryRunner.query(CREATE_POST_TABLE_QUERY),
                queryRunner.query(CREATE_COMMENT_TABLE_QUERY),
                queryRunner.query(CREATE_BLOG_LIKE_TABLE_QUERY),
                queryRunner.query(CREATE_BLOG_LIKE_COUNT_VIEW),
                queryRunner.query(UPDATE_MODIFIED_TRIGGER_POSTS),
                queryRunner.query(UPDATE_MODIFIED_TRIGGER_COMMENTS),
                queryRunner.query(UPDATE_MODIFIED_TRIGGER_BLOG_LIKES),
                queryRunner.query(INDEX_POSTS_TITLE),
                queryRunner.query(INDEX_POSTS_CONTENT),
                queryRunner.query(INDEX_POSTS_TAGS)
            ]);
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
