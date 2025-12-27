import type {
    BooruType,
    BooruConfig,
    SearchResults,
    PostResult,
} from "./types.js";
import {
    BooruAdapter,
    GelbooruAdapter,
    DanbooruAdapter,
    MoebooruAdapter,
    E621Adapter,
} from "./adapters/index.js";


export class AnyBooru {
    private adapter: BooruAdapter;

    constructor(config: BooruConfig) {
        const fetchFn = config.fetch || globalThis.fetch;

        this.adapter = this.createAdapter(
            config.url,
            config.type,
            config.username,
            config.password,
            fetchFn
        );
    }

    private createAdapter(
        baseUrl: string,
        type: BooruType,
        username?: string,
        password?: string,
        fetchFn?: typeof fetch
    ): BooruAdapter {
        switch (type) {
            case "gelbooru":
                return new GelbooruAdapter(baseUrl, username, password, fetchFn);
            case "danbooru":
                return new DanbooruAdapter(baseUrl, username, password, fetchFn);
            case "moebooru":
                return new MoebooruAdapter(baseUrl, username, password, fetchFn);
            case "e621":
                return new E621Adapter(baseUrl, username, password, fetchFn);
            default:
                throw new Error(`Unsupported booru type: ${type}`);
        }
    }

    /**
    * Search for posts by tags
    * @param query - Search query/tags
    * @param page - Page number (optional, defaults to 1)
    * @returns Array of post IDs
    */
    async search(query: string, page: number = 1): Promise<SearchResults> {
        return this.adapter.search(query, page);
    }

    /**
    * Get detailed information about a specific post
    * @param postId - The post ID
    * @returns Detailed post information
    */
    async lookup(postId: string): Promise<PostResult> {
        return this.adapter.lookup(postId);
    }

    /**
    * Get the URL of a post's thumbnail
    * @param postId - The post ID
    * @returns Thumbnail URL
    */
    async getThumbnailURL(postId: string): Promise<URL> {
        return this.adapter.getThumbnailURL(postId);
    }

    /**
    * Get a post's thumbnail as an ArrayBuffer
    * @param postId - The post ID
    * @returns Thumbnail data
    */
    async getThumbnail(postId: string): Promise<ArrayBuffer> {
        return this.adapter.getThumbnail(postId);
    }

    /**
    * Get the URL of the full post/image
    * @param postId - The post ID
    * @returns Post URL
    */
    async getPostURL(postId: string): Promise<URL> {
        return this.adapter.getPostURL(postId);
    }

    /**
    * Get the full post/image as an ArrayBuffer
    * @param postId - The post ID
    * @returns Post data
    */
    async getPost(postId: string): Promise<ArrayBuffer> {
        return this.adapter.getPost(postId);
    }
}

export type {
    BooruType,
    BooruConfig,
    SearchResults,
    PostResult,
    PostStatistics,
    PostResolution,
} from "./types.js";
