// scripts/fetch-medium.js
//
// Regenerates src/data/blogs.ts from Medium.
//   npm run fetch-medium                 -> rewrites src/data/blogs.ts
//   node scripts/fetch-medium.js --dry-run   -> prints the merged list, writes nothing
//   node scripts/fetch-medium.js --out <file> -> writes somewhere else
//
// Posts are merged with the existing file and de-duplicated by URL. Hand-curated
// fields on existing posts (category, featured, excerpt/subtitle) are kept; Medium
// supplies new posts plus fresh image / reading time / tags. Sorted newest first.
// If Medium returns nothing (blocked, offline), the file is left untouched.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_OUTPUT = path.join(__dirname, "..", "src", "data", "blogs.ts");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const outIdx = args.indexOf("--out");
const OUTPUT_PATH = outIdx >= 0 && args[outIdx + 1] ? path.resolve(args[outIdx + 1]) : DEFAULT_OUTPUT;

const USERNAME = "kandoiharshitsdlp";
const USER_ID = "11b3fd739833";

const GRAPHQL_URL = "https://medium.com/_/graphql";
const HEADERS = {
    "Content-Type": "application/json",
    "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "*/*",
};

const QUERY = `
    query UserProfileQuery($id: ID!, $paging: PagingOptions) {
        user(id: $id) {
            homepagePostsConnection(paging: $paging) {
                posts {
                    id
                    title
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
                pagingInfo { next { limit from } }
            }
        }
    }
`;

/** Normalises a URL for de-duplication (no query/hash/trailing slash, lower-case host). */
function urlKey(url) {
    if (!url) return "";
    try {
        const u = new URL(url);
        return `${u.host.toLowerCase()}${u.pathname.replace(/\/+$/, "")}`;
    } catch {
        return url.trim().replace(/[?#].*$/, "").replace(/\/+$/, "");
    }
}

/** Medium post id is the trailing hex chunk of any post URL ("…-1fdfbac6c672" or "/p/1fdfbac6c672"). */
function postIdFromUrl(url) {
    const m = /([0-9a-f]{10,16})\/?(?:[?#].*)?$/.exec(url || "");
    return m ? m[1] : "";
}

const formatDate = (ms) =>
    new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function readExistingPosts(file) {
    if (!fs.existsSync(file)) return [];
    const src = fs.readFileSync(file, "utf8");
    const start = src.indexOf("= [");
    const end = src.lastIndexOf("];");
    if (start < 0 || end < 0) throw new Error(`Could not find the blogPosts array in ${file}`);
    return JSON.parse(src.slice(start + 2, end + 1));
}

async function fetchMediumPosts() {
    console.log(`Fetching articles for @${USERNAME}...`);
    const posts = [];
    let paging = { limit: 25 };

    for (let page = 1; page <= 20; page++) {
        const res = await fetch(GRAPHQL_URL, {
            method: "POST",
            headers: HEADERS,
            body: JSON.stringify([{ operationName: "UserProfileQuery", query: QUERY, variables: { id: USER_ID, paging } }]),
        });
        if (!res.ok) throw new Error(`Medium responded with HTTP ${res.status}`);

        const json = await res.json();
        const connection = json?.[0]?.data?.user?.homepagePostsConnection;
        const batch = connection?.posts || [];
        console.log(`Fetched page ${page} (${batch.length} posts)`);

        for (const item of batch) {
            if (!item?.id || !item.title || !item.firstPublishedAt) continue;
            const subtitle = item.extendedPreviewContent?.subtitle || item.previewContent?.subtitle || "";
            const tags = (item.tags ?? []).map((t) => t.displayTitle || t.normalizedTagSlug).filter(Boolean);
            posts.push({
                mediumId: item.id,
                published: item.firstPublishedAt,
                title: item.title,
                subtitle,
                excerpt: subtitle,
                date: formatDate(item.firstPublishedAt),
                category: tags[0] ?? "Article",
                image: item.previewImage?.id ? `https://miro.medium.com/v2/resize:fit:1200/${item.previewImage.id}` : "",
                link: `https://medium.com/p/${item.id}`,
                canonical: item.mediumUrl || item.canonicalUrl || `https://medium.com/p/${item.id}`,
                claps: typeof item.clapCount === "number" ? item.clapCount : undefined,
                responses: typeof item.postResponses?.count === "number" ? item.postResponses.count : undefined,
                readingTime: item.readingTime ? Math.max(1, Math.ceil(item.readingTime)) : undefined, // Medium rounds up
                tags,
            });
        }

        const next = connection?.pagingInfo?.next;
        if (!next?.from || batch.length === 0) break;
        paging = { limit: 25, from: next.from };
    }
    return posts;
}

function merge(existing, fetched) {
    const byKey = new Map();
    const keysOf = (p) => [urlKey(p.link), urlKey(p.canonical), postIdFromUrl(p.link), postIdFromUrl(p.canonical)].filter(Boolean);
    const find = (p) => keysOf(p).map((k) => byKey.get(k)).find(Boolean);
    const index = (p) => keysOf(p).forEach((k) => byKey.set(k, p));

    const merged = [];
    for (const post of existing) {
        if (find(post)) continue; // duplicate already in the file
        const copy = { ...post };
        merged.push(copy);
        index(copy);
    }

    let nextId = merged.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0) + 1;
    let added = 0;
    for (const fresh of fetched) {
        const { mediumId: _mediumId, published: _published, ...data } = fresh;
        const current = find(fresh);
        if (current) {
            // Keep curated fields; refresh what Medium is authoritative for.
            if (data.image) current.image = data.image;
            if (data.readingTime) current.readingTime = data.readingTime;
            if (data.claps !== undefined) current.claps = data.claps;
            if (data.responses !== undefined) current.responses = data.responses;
            if (data.tags.length) current.tags = data.tags;
            if (!current.canonical) current.canonical = data.canonical;
            index(current);
        } else {
            const post = { id: nextId++, ...data, featured: false };
            merged.push(post);
            index(post);
            added++;
        }
    }

    merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { merged, added };
}

const FIELD_ORDER = ["id", "title", "subtitle", "excerpt", "date", "category", "image", "link", "canonical", "claps", "responses", "readingTime", "tags", "featured"];

function serialize(posts) {
    const ordered = posts.map((p) => {
        const o = {};
        for (const k of FIELD_ORDER) if (p[k] !== undefined && p[k] !== null) o[k] = p[k];
        return o;
    });
    return [
        'import { BlogPost } from "../types";',
        "",
        "// Generated by scripts/fetch-medium.js (npm run fetch-medium). Hand edits to",
        "// category / featured / excerpt are preserved on the next run.",
        `export const blogPosts: BlogPost[] = ${JSON.stringify(ordered, null, 2)};`,
        "",
    ].join("\n");
}

async function main() {
    const existing = readExistingPosts(DEFAULT_OUTPUT);
    let fetched = [];
    try {
        fetched = await fetchMediumPosts();
    } catch (err) {
        console.error(`Could not fetch from Medium: ${err.message}`);
    }
    if (fetched.length === 0) {
        console.error("No posts fetched; leaving blogs.ts unchanged.");
        process.exitCode = 1;
        return;
    }

    const { merged, added } = merge(existing, fetched);
    if (DRY_RUN) {
        console.log(merged.map((p) => `${p.date.padEnd(13)} ${p.title}`).join("\n"));
        console.log(`\n${merged.length} posts (${added} new). Dry run: nothing written.`);
        return;
    }
    fs.writeFileSync(OUTPUT_PATH, serialize(merged));
    console.log(`Saved ${merged.length} posts (${added} new) to ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main();
