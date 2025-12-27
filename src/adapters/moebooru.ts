import type { SearchResults, PostResult, BooruPost } from "../types.js";
import { BooruAdapter } from "./base.js";

export class MoebooruAdapter extends BooruAdapter {
    async search(query: string, page: number = 1): Promise<SearchResults> {
        const limit = 100;
        const url = this.buildUrl("/post.json", {
            tags: query,
            page,
            limit,
        });
        const response = await this.fetchFn(url, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Search failed: ${response.statusText}`);
        }

        const posts = await response.json() as any[];
        return posts.map((post: any) => String(post.id));
    }

    async lookup(postId: string): Promise<PostResult> {
        const url = this.buildUrl("/post.json", {
            tags: `id:${postId}`,
        });
        const response = await this.fetchFn(url, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Lookup failed: ${response.statusText}`);
        }

        const posts = await response.json();

        if (!Array.isArray(posts) || posts.length === 0) {
            throw new Error(`Post ${postId} not found`);
        }

        return this.convertPost(posts[0]);
    }

    async getThumbnailURL(postId: string): Promise<URL> {
        const rawPost = await this.getRawPost(postId);

        if (rawPost.preview_url) {
            return new URL(rawPost.preview_url);
        }

        throw new Error("Thumbnail URL not available");
    }

    async getPostURL(postId: string): Promise<URL> {
        const rawPost = await this.getRawPost(postId);

        if (rawPost.file_url) {
            return new URL(rawPost.file_url);
        }

        throw new Error("Post URL not available");
    }

    protected convertPost(post: any): PostResult {
        const tags = post.tags ? String(post.tags).split(" ").filter(Boolean) : [];

        return {
            artists: post.artist
                ? String(post.artist).split(" ").filter(Boolean)
                : undefined,
            tags: tags.length > 0 ? tags : undefined,
            statistics: {
                ID: String(post.id),
                posted: post.created_at
                    ? new Date(Number(post.created_at) * 1000)
                    : undefined,
                by: post.author || post.creator_id,
                source: post.source,
                fileType: post.file_ext,
                MD5Hash: post.md5,
                rating: post.rating,
                resolution: {
                    width: Number(post.width) || 0,
                    height: Number(post.height) || 0,
                },
                score: post.score,
                size: post.file_size ? `${post.file_size} bytes` : undefined,
                status: post.status,
            },
            url: post.file_url ? new URL(post.file_url) : undefined,
        };
    }

    private async getRawPost(postId: string): Promise<BooruPost> {
        const url = this.buildUrl("/post.json", {
            tags: `id:${postId}`,
        });
        const response = await this.fetchFn(url, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch post: ${response.statusText}`);
        }

        const posts = await response.json();

        if (!Array.isArray(posts) || posts.length === 0) {
            throw new Error(`Post ${postId} not found`);
        }

        const post = posts[0];

        return {
            id: String(post.id),
            tags: post.tags ? String(post.tags).split(" ") : [],
            file_url: post.file_url,
            preview_url: post.preview_url,
            sample_url: post.sample_url,
            rating: post.rating,
            score: post.score,
            source: post.source,
            md5: post.md5,
            width: post.width,
            height: post.height,
            created_at: post.created_at,
            creator_id: post.creator_id,
            author: post.author,
            file_ext: post.file_ext,
            file_size: post.file_size,
            status: post.status,
        };
    }
}
