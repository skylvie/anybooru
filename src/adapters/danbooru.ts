import type { SearchResults, PostResult, BooruPost } from "../types.js";
import { BooruAdapter } from "./base.js";

export class DanbooruAdapter extends BooruAdapter {
    async search(query: string, page: number = 1): Promise<SearchResults> {
        const limit = 100;
        const url = this.buildUrl("/posts.json", {
            tags: query,
            page,
            limit,
        })
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
        const url = this.buildUrl(`/posts/${postId}.json`, {});
        const response = await this.fetchFn(url, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Lookup failed: ${response.statusText}`);
        }

        const post = await response.json() as any;
        return this.convertPost(post);
    }

    async getThumbnailURL(postId: string): Promise<URL> {
        const rawPost = await this.getRawPost(postId);

        if (rawPost.preview_url) {
            if (rawPost.preview_url.startsWith("http")) {
                return new URL(rawPost.preview_url);
            } else {
                return new URL(rawPost.preview_url, this.baseUrl);
            }
        }

        throw new Error("Thumbnail URL not available");
    }

    async getPostURL(postId: string): Promise<URL> {
        const rawPost = await this.getRawPost(postId);

        if (rawPost.file_url) {
            if (rawPost.file_url.startsWith("http")) {
                return new URL(rawPost.file_url);
            } else {
                return new URL(rawPost.file_url, this.baseUrl);
            }
        }

        throw new Error("Post URL not available");
    }

    protected convertPost(post: any): PostResult {
        const artists = post.tag_string_artist
            ? post.tag_string_artist.split(" ").filter(Boolean)
            : [];
        const copyrights = post.tag_string_copyright
            ? post.tag_string_copyright.split(" ").filter(Boolean)
            : [];
        const characters = post.tag_string_character
            ? post.tag_string_character.split(" ").filter(Boolean)
            : [];
        const meta = post.tag_string_meta
            ? post.tag_string_meta.split(" ").filter(Boolean)
            : [];
        const general = post.tag_string_general
            ? post.tag_string_general.split(" ").filter(Boolean)
            : [];

        return {
            artists: artists.length > 0 ? artists : undefined,
            copyrights: copyrights.length > 0 ? copyrights : undefined,
            characters: characters.length > 0 ? characters : undefined,
            metas: meta.length > 0 ? meta : undefined,
            tags: general.length > 0 ? general : undefined,
            statistics: {
                ID: String(post.id),
                posted: post.created_at ? new Date(post.created_at) : undefined,
                by: post.uploader_name || post.uploader_id,
                source: post.source,
                fileType: post.file_ext,
                MD5Hash: post.md5,
                rating: post.rating,
                resolution: {
                    width: Number(post.image_width) || 0,
                    height: Number(post.image_height) || 0,
                },
                score: post.score,
                size: post.file_size ? `${post.file_size} bytes` : undefined,
                status: post.is_deleted ? "deleted" : undefined,
            },
            url: post.file_url
                ? new URL(
                        post.file_url.startsWith("http")
                            ? post.file_url
                            : `${this.baseUrl}${post.file_url}`
                    )
                : undefined,
        };
    }

    private async getRawPost(postId: string): Promise<BooruPost> {
        const url = this.buildUrl(`/posts/${postId}.json`, {});

        const response = await this.fetchFn(url, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch post: ${response.statusText}`);
        }

        const post = await response.json() as any;

        return {
            id: String(post.id),
            tags: post.tag_string ? post.tag_string.split(" ") : [],
            file_url: post.file_url,
            preview_url: post.preview_file_url,
            sample_url: post.large_file_url,
            rating: post.rating,
            score: post.score,
            source: post.source,
            md5: post.md5,
            width: post.image_width,
            height: post.image_height,
            created_at: post.created_at,
            creator_id: post.uploader_id,
            author: post.uploader_name,
            file_ext: post.file_ext,
            file_size: post.file_size,
            status: post.is_deleted ? "deleted" : undefined,
        };
    }
}
