export interface Blog {
    id: string;
    author_id: string;
    title: string;
    content: string;
    tags: string[];
    updated_at: Date;
    created_at: Date;
}
