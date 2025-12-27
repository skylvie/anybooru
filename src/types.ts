export type BooruType = "gelbooru" | "danbooru" | "moebooru" | "e621";

export interface BooruConfig {
    url: string;
    type: BooruType;
    username?: string;
    password?: string;
    fetch?: typeof fetch;
};
export type SearchResults = string[];
export interface PostResolution {
    width: number;
    height: number;
};
export interface PostStatistics {
    ID: string;
    posted?: Date;
    by?: string | URL;
    source?: string;
    size?: string;
    fileType?: string;
    MD5Hash?: string;
    status?: string;
    resolution?: PostResolution;
    rating?: string;
    score?: string | number;
};
export interface PostResult {
    artists?: string[];
    copyrights?: string[];
    characters?: string[];
    metas?: string[];
    tags?: string[];
    /** e621.net specific */
    species?: string[];
    statistics: PostStatistics;
    /** URL of the post, not image */
    url?: URL;
};
export interface BooruPost {
    id: string;
    tags: string[];
    file_url: string;
    preview_url?: string;
    sample_url?: string;
    rating?: string;
    score?: number | string;
    source?: string;
    md5?: string;
    width?: number;
    height?: number;
    created_at?: string;
    creator_id?: string | number;
    author?: string;
    file_ext?: string;
    file_size?: number;
    status?: string;
};
