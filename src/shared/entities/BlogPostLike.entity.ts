export interface BlogPostLike {
    blog_id: string;
    user_id: string;
    liked: boolean;
    updated_at: Date;
    created_at: Date;
}
