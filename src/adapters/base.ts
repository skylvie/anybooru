import type { SearchResults, PostResult } from "../types.js";

export abstract class BooruAdapter {
    protected baseUrl: string;
    protected username?: string;
    protected password?: string;
    protected fetchFn: typeof fetch;

    constructor(
        baseUrl: string,
        username?: string,
        password?: string,
        fetchFn?: typeof fetch
    ) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
        this.username = username;
        this.password = password;
        this.fetchFn = fetchFn || globalThis.fetch;
    }

    /**
    * Search for posts by tags
    */
    abstract search(query: string, page?: number): Promise<SearchResults>;

    /**
    * Get detailed information about a post
    */
    abstract lookup(postId: string): Promise<PostResult>;

    /**
    * Get the URL of a post's thumbnail
    */
    abstract getThumbnailURL(postId: string): Promise<URL>;

    /**
    * Get a post's thumbnail as an ArrayBuffer
    */
    async getThumbnail(postId: string): Promise<ArrayBuffer> {
        const url = await this.getThumbnailURL(postId);
        const response = await this.fetchFn(url.toString());

        if (!response.ok) {
            throw new Error(`Failed to fetch thumbnail: ${response.statusText}`);
        }

        return response.arrayBuffer();
    }

    /**
    * Get the URL of the full post/image
    */
    abstract getPostURL(postId: string): Promise<URL>;

    /**
    * Get the full post/image as an ArrayBuffer
    */
    async getPost(postId: string): Promise<ArrayBuffer> {
        const url = await this.getPostURL(postId);
        const response = await this.fetchFn(url.toString());

        if (!response.ok) {
            throw new Error(`Failed to fetch post: ${response.statusText}`);
        }

        return response.arrayBuffer();
    }

    /**
    * Convert a raw post to standardized PostResult format
    */
    protected abstract convertPost(post: any): PostResult;

    /**
    * Helper to make authenticated requests if credentials are provided
    */
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

    /**
    * Helper to build URL with query parameters
    */
    protected buildUrl(
        endpoint: string,
        params: Record<string, string | number | undefined>
    ): string {
        const url = new URL(endpoint, this.baseUrl);

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                url.searchParams.append(key, String(value));
            }
        });

        return url.toString();
    }
}
