# AnyBooru
A universal, platform-independent API for interacting with multiple booru sites

## Installation
> [!WARNING]  
> Currently, anybooru is not available on the npm. It will be soon
- JS runtime: `pnpm i anybooru`
- Web: `https://unpkg.com/anybooru@1.0.0/index.js`

## Usage
### Gelbooru
```js
import { AnyBooru } from 'anybooru';

const api = new AnyBooru({ 
    url: 'https://gelbooru.example.com',
    type: 'gelbooru',
    username: '', // Optional
    password: '' // Optional
});

const postIds = await api.search('', 1); // Search for posts
const post = await api.lookup(postIds[0]); // Get information about a post
const thumbnailURL = await api.getThumbnailURL(postIds[0]); // Get URL to thumbnail
const postURL = await api.getPostURL(postIds[0]); // Get URL to post image
const thumbnailData = await api.getThumbnail(postIds[0]); // Get thumbnail as arraybuffer
const imageData = await api.getPost(postIds[0]); // Get post image as arraybuffer
```
### Danbooru
```js
import { AnyBooru } from 'anybooru';

const api = new AnyBooru({ 
    url: 'https://danbooru.example.com',
    type: 'danbooru'
});

const postIds = await api.search('', 1);
const post = await api.lookup(postIds[0]);
const thumbnailURL = await api.getThumbnailURL(postIds[0]);
const postURL = await api.getPostURL(postIds[0]);
const thumbnailData = await api.getThumbnail(postIds[0]);
const imageData = await api.getPost(postIds[0]);
```
### Moebooru
```js
import { AnyBooru } from 'anybooru';

const api = new AnyBooru({ 
    url: 'https://moebooru.example.com',
    type: 'moebooru'
});

const postIds = await api.search('', 1);
const post = await api.lookup(postIds[0]);
const thumbnailURL = await api.getThumbnailURL(postIds[0]);
const postURL = await api.getPostURL(postIds[0]);
const thumbnailData = await api.getThumbnail(postIds[0]);
const imageData = await api.getPost(postIds[0]);
```
### e621
```js
import { AnyBooru } from 'anybooru';

const api = new AnyBooru({ 
    url: 'https://e621.example.com',
    type: 'e621'
});

const postIds = await api.search('', 1);
const post = await api.lookup(postIds[0]);
const thumbnailURL = await api.getThumbnailURL(postIds[0]);
const postURL = await api.getPostURL(postIds[0]);
const thumbnailData = await api.getThumbnail(postIds[0]);
const imageData = await api.getPost(postIds[0]);
```
