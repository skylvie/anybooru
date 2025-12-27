import type { SearchResults, PostResult, BooruPost } from "../types.js";
import { BooruAdapter } from "./base.js";

export class E621Adapter extends BooruAdapter {
    async search(query: string, page: number = 1): Promise<SearchResults> {
        const limit = 100;
        const url = this.buildUrl("/posts.json", {
            tags: query,
            page,
            limit,
        });
        const response = await this.fetchFn(url, {
            headers: {
                ...this.getAuthHeaders(),
                "User-Agent": "AnyBooru/1.0",
            },
        });

        if (!response.ok) {
            throw new Error(`Search failed: ${response.statusText}`);
        }

        const data = await response.json() as any;
        const posts = data.posts || [];

        return posts.map((post: any) => String(post.id));
    }

    async lookup(postId: string): Promise<PostResult> {
        const url = this.buildUrl(`/posts/${postId}.json`, {});
        const response = await this.fetchFn(url, {
            headers: {
                ...this.getAuthHeaders(),
                "User-Agent": "AnyBooru/1.0",
            },
        });

        if (!response.ok) {
            throw new Error(`Lookup failed: ${response.statusText}`);
        }

        const data = await response.json() as any;
        return this.convertPost(data.post);
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
        const tags = post.tags || {};
        const artists = tags.artist || [];
        const copyrights = tags.copyright || [];
        const characters = tags.character || [];
        const species = tags.species || [];
        const meta = tags.meta || [];
        const general = tags.general || [];

        return {
            artists: artists.length > 0 ? artists : undefined,
            copyrights: copyrights.length > 0 ? copyrights : undefined,
            characters: characters.length > 0 ? characters : undefined,
            species: species.length > 0 ? species : undefined,
            metas: meta.length > 0 ? meta : undefined,
            tags: general.length > 0 ? general : undefined,
            statistics: {
                ID: String(post.id),
                posted: post.created_at ? new Date(post.created_at) : undefined,
                by: post.uploader_id,
                source: Array.isArray(post.sources) ? post.sources.join(", ") : post.sources,
                fileType: post.file?.ext,
                MD5Hash: post.file?.md5,
                rating: post.rating,
                resolution: {
                    width: Number(post.file?.width) || 0,
                    height: Number(post.file?.height) || 0,
                },
                score: post.score?.total || 0,
                size: post.file?.size ? `${post.file.size} bytes` : undefined,
            },
            url: post.file?.url ? new URL(post.file.url) : undefined,
        };
    }

    private async getRawPost(postId: string): Promise<BooruPost> {
        const url = this.buildUrl(`/posts/${postId}.json`, {});

        const response = await this.fetchFn(url, {
            headers: {
                ...this.getAuthHeaders(),
                "User-Agent": "AnyBooru/1.0",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch post: ${response.statusText}`);
        }

        const data = await response.json() as any;
        const post = data.post;

        if (!post) {
            throw new Error(`Post ${postId} not found`);
        }

        const allTags = [
            ...(post.tags?.artist || []),
            ...(post.tags?.copyright || []),
            ...(post.tags?.character || []),
            ...(post.tags?.species || []),
            ...(post.tags?.general || []),
            ...(post.tags?.meta || []),
        ];

        return {
            id: String(post.id),
            tags: allTags,
            file_url: post.file?.url,
            preview_url: post.preview?.url,
            sample_url: post.sample?.url,
            rating: post.rating,
            score: post.score?.total,
            source: Array.isArray(post.sources) ? post.sources.join(", ") : post.sources,
            md5: post.file?.md5,
            width: post.file?.width,
            height: post.file?.height,
            created_at: post.created_at,
            creator_id: post.uploader_id,
            file_ext: post.file?.ext,
            file_size: post.file?.size,
        };
    }

    protected getAuthHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            "User-Agent": "AnyBooru/1.0",
        };

        if (this.username && this.password) {
            const auth = Buffer.from(`${this.username}:${this.password}`).toString("base64");
            headers["Authorization"] = `Basic ${auth}`;
        }

        return headers;
    }
}
