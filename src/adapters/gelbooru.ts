import type { SearchResults, PostResult, BooruPost } from "../types.js";
import { BooruAdapter } from "./base.js";

export class GelbooruAdapter extends BooruAdapter {
    async search(query: string, page: number = 1): Promise<SearchResults> {
        const limit = 100;
        const pid = page - 1;
        const params: Record<string, string | number> = {
            page: "dapi",
            s: "post",
            q: "index",
            json: "1",
            tags: query,
            pid,
            limit,
        };

        if (this.password && this.username) {
            params.api_key = this.password;
            params.user_id = this.username;
        }

        const url = this.buildUrl("/index.php", params);
        const response = await this.fetchFn(url, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Search failed: ${response.statusText}`);
        }

        const text = await response.text();
        if (!text || text.trim().length === 0) {
            return [];
        }

        const data = JSON.parse(text) as any;
        const posts = Array.isArray(data) ? data : data.post || [];

        return posts.map((post: any) => String(post.id));
    }

    async lookup(postId: string): Promise<PostResult> {
        const params: Record<string, string | number> = {
            page: "dapi",
            s: "post",
            q: "index",
            json: "1",
            id: postId,
        };

        if (this.password && this.username) {
            params.api_key = this.password;
            params.user_id = this.username;
        }

        const url = this.buildUrl("/index.php", params);
        const response = await this.fetchFn(url, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Lookup failed: ${response.statusText}`);
        }

        const text = await response.text();
        if (!text || text.trim().length === 0) {
            throw new Error(`Post ${postId} not found`);
        }

        const data = JSON.parse(text) as any;
        const posts = Array.isArray(data) ? data : data.post || [];

        if (posts.length === 0) {
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
        const artists = tags.filter((tag: string) => tag.includes("artist:"));
        const copyrights = tags.filter((tag: string) => tag.includes("copyright:"));
        const characters = tags.filter((tag: string) => tag.includes("character:"));
        const meta = tags.filter((tag: string) => tag.includes("meta:"));
        const generalTags = tags.filter(
            (tag: string) =>
                !tag.includes("artist:") &&
                !tag.includes("copyright:") &&
                !tag.includes("character:") &&
                !tag.includes("meta:")
        );

        return {
            artists: artists.length > 0 ? artists : undefined,
            copyrights: copyrights.length > 0 ? copyrights : undefined,
            characters: characters.length > 0 ? characters : undefined,
            metas: meta.length > 0 ? meta : undefined,
            tags: generalTags.length > 0 ? generalTags : undefined,
            statistics: {
                ID: String(post.id),
                posted: post.created_at ? new Date(post.created_at) : undefined,
                by: post.owner || post.creator_id,
                source: post.source,
                fileType: post.image,
                MD5Hash: post.md5 || post.hash,
                rating: post.rating,
                resolution: {
                    width: Number(post.width) || 0,
                    height: Number(post.height) || 0,
                },
                score: post.score,
                size: post.file_size ? `${post.file_size} bytes` : undefined,
            },
            url: post.file_url ? new URL(post.file_url) : undefined,
        };
    }

    private async getRawPost(postId: string): Promise<BooruPost> {
        const params: Record<string, string | number> = {
            page: "dapi",
            s: "post",
            q: "index",
            json: "1",
            id: postId,
        };

        if (this.password && this.username) {
            params.api_key = this.password;
            params.user_id = this.username;
        }

        const url = this.buildUrl("/index.php", params);
        const response = await this.fetchFn(url, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch post: ${response.statusText}`);
        }

        const text = await response.text();
        if (!text || text.trim().length === 0) {
            throw new Error(`Post ${postId} not found`);
        }

        const data = JSON.parse(text) as any;
        const posts = Array.isArray(data) ? data : data.post || [];

        if (posts.length === 0) {
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
            md5: post.md5 || post.hash,
            width: post.width,
            height: post.height,
            created_at: post.created_at,
            creator_id: post.creator_id,
            author: post.owner,
            file_ext: post.image,
            file_size: post.file_size,
        };
    }
}
