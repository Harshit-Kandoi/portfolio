// scripts/fetch-medium.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "blogs.json");

const USERNAME = "kandoiharshitsdlp";
const USER_ID = "11b3fd739833";

const GRAPHQL_URL = "https://medium.com/_/graphql";
const HEADERS = {
    "Content-Type": "application/json",
    "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "*/*",
};

async function fetchAllMediumBlogs() {
    console.log(`Fetching articles for @${USERNAME}...`);

    const articlesMap = new Map();
    let paging = { limit: 25 };
    let hasMore = true;
    let pageNum = 1;

    while (hasMore) {
        const queryPayload = [
            {
                operationName: "UserProfileQuery",
                query: `
                    query UserProfileQuery($id: ID!, $paging: PagingOptions) {
                        user(id: $id) {
                            id
                            username
                            name
                            homepagePostsConnection(paging: $paging) {
                                posts {
                                    id
                                    title
                                    uniqueSlug
                                    firstPublishedAt
                                    mediumUrl
                                    canonicalUrl
                                    previewContent { subtitle }
                                    extendedPreviewContent { subtitle }
                                    previewImage { id }
                                    readingTime
                                    clapCount
                                    postResponses { count }
                                    tags { displayTitle normalizedTagSlug }
                                }
                                pagingInfo {
                                    next {
                                        limit
                                        from
                                    }
                                }
                            }
                        }
                    }
                `,
                variables: { id: USER_ID, paging },
            },
        ];

        try {
            const res = await fetch(GRAPHQL_URL, {
                method: "POST",
                headers: HEADERS,
                body: JSON.stringify(queryPayload),
            });

            if (!res.ok) {
                console.error(`HTTP Error: ${res.status}`);
                break;
            }

            const json = await res.json();
            const connection = json?.[0]?.data?.user?.homepagePostsConnection;
            const posts = connection?.posts || [];

            console.log(`Fetched page ${pageNum} (${posts.length} posts)`);

            for (const item of posts) {
                if (!item || !item.id || !item.title) continue;

                const subtitle =
                    item.extendedPreviewContent?.subtitle ||
                    item.previewContent?.subtitle ||
                    "";

                const tagsList =
                    item.tags?.map(
                        (t) => t.displayTitle || t.normalizedTagSlug
                    ) ?? [];

                articlesMap.set(item.id, {
                    id: item.id,
                    title: item.title,
                    subtitle: subtitle,
                    excerpt: subtitle,
                    slug: item.uniqueSlug,
                    link: `https://medium.com/p/${item.id}`,
                    canonical:
                        item.mediumUrl ||
                        item.canonicalUrl ||
                        `https://medium.com/p/${item.id}`,
                    image: item.previewImage?.id
                        ? `https://miro.medium.com/v2/resize:fit:1200/${item.previewImage.id}`
                        : "",
                    published: item.firstPublishedAt,
                    date: new Date(item.firstPublishedAt).toLocaleDateString(
                        "en-US",
                        {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        }
                    ),
                    readingTime: item.readingTime || null,
                    claps: item.clapCount ?? null,
                    responses: item.postResponses?.count ?? null,
                    tags: tagsList,
                    category: tagsList[0] ?? "Article",
                });
            }

            const nextPaging = connection?.pagingInfo?.next;
            if (nextPaging && nextPaging.from && posts.length > 0) {
                paging = { limit: 25, from: nextPaging.from };
                pageNum++;
            } else {
                hasMore = false;
            }
        } catch (err) {
            console.error("Error fetching page:", err);
            break;
        }
    }

    const blogs = [...articlesMap.values()]
        .sort((a, b) => new Date(b.published) - new Date(a.published))
        .map((blog, index) => ({
            ...blog,
            id: index + 1,
        }));

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(blogs, null, 2));

    console.log(`Successfully saved ${blogs.length} blogs to ${OUTPUT_PATH}`);
}

fetchAllMediumBlogs();
