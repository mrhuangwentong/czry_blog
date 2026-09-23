---
name: copy-wechat-article
description: Copy a WeChat mp article into the czry_blog Hexo/NexT site as a new post, download its images to image/, update all site pages, and deploy to GitHub. Use when the user shares a mp.weixin.qq.com link and asks to add it, copy it onto the site, or publish/repost it. Do not use for general GitHub pushes or unrelated tasks.
---

# Copy WeChat Article to czry_blog

Copy a WeChat official-account article into this blog, store its images locally, update the whole site (home, archives, tags), then deploy to GitHub (and optionally Gitee). Deliverable content must reproduce the original article's text and image order/positioning so the page matches the WeChat layout.

Work project root: `/Users/etong/trae_workspace/czry_blog`
Template article (copy its HTML skeleton): `2026/07/31/flood-risk-checkup/index.html`

## Before you start

- If the user did not give the publish **date** and **slug**, ask for them. Default to the article's own publish date from `<meta name="og:article:published_time">` or the manifest, and derive a lowercase hyphen slug from the title.
- If the user gave a date, use it exactly for the folder path even if it differs from the article's actual date.
- Two image folders exist. Content/WeChat images go into **`image/`** (already has numbered files 24.png, 25.png, 26.jpg, 28.jpg, 29.png, 30.png). **Do NOT touch `images/`** — that holds theme favicons/logos only.

## 1. Fetch the article

1. Load the mp.weixin.qq.com URL the user shared.
2. Extract in this order, keeping the body's own order:
   - Title (from `og:title` / `<h1 class="rich_media_title">`)
   - Author / source (e.g. 申能保险; the trailing "文章来源：…" line in the body)
   - Publish date
   - Body HTML: headings (`<h2>/<h3>`, typically numbered 一、二、三 / 01/02/03), paragraphs, and every `<img>`.
3. Note every image's original order and its alt text, since the new page must render them in the same sequence.

## 2. Download images to image/

1. Save each content image as `image/<N>.<ext>` continuing from the current highest number in `image/` (e.g. next is 31). Use the extension from the source URL.
2. **Do NOT blanket-skip GIFs.** WeChat articles often build their visual layout out of many GIFs (section dividers AND horizontally-scrollable swipe strips). Download every distinct image; only discard a file if it is a pure spacer (verified < ~500 bytes). When GIFs repeat across the page, store each distinct GIF once and reuse it.
3. **Preserve horizontal scroll strips.** WeChat "swipeable scroller" content is grouped in a flex container (the wrapper uses `display:flex` + `overflow-x`/`white-space:nowrap`). Recreate it in the page body with inline CSS: `<div style="display:flex;overflow-x:auto;white-space:nowrap;gap:7px;">` with each card `<img style="flex:0 0 auto;width:150px;border-radius:6px;">`. Keep the same number/order of images per strip as the original.
4. Skip only genuine tiny decorative spacers (a few hundred bytes) that are pure dividers, not structural GIFs.
5. Keep a map of source-image → local file so the remapped `src` in step 3 is correct.

## 3. Build the article page

Create `image`-home path: `<YYYY>/<MM>/<DD>/<slug>/index.html` — copy `2026/07/31/flood-risk-checkup/index.html` and replace:

- Every occurrence of the old title string with the new title:
  - `<title>` line, `og:title`, `twitter:*`, `meta description`, `canonical`, the `next-config pagemark`, `<h1 class="post-title">`, the sidebar TOC `<ol class="nav">`, and `article:published_time`/`article:modified_time`.
- `og:url`, `canonical`, `og:image`/`twitter:image` → the new file path and the downloaded image paths (e.g. `/image/31.png`).
- Replace the old folder/slug in all internal path strings (`<YYYY>/<MM>/<DD>/<slug>/`).
- The date `<time>` in `.post-meta` and the sidebar/footer `copyrightYear`.
- Replace the `<div class="post-body">` inner HTML with the new content. Convert WeChat images to `<img src="/image/<N>.ext" alt="...">`. Keep the original heading tags, list order, bold/span color highlights, and the centered/small-font `文章来源：…` line so the layout matches WeChat.
- Set `article:published_time` / `modified_time` to the publish date.

Keep the style block that hides categories (`.post-meta-item[title*="分类"]`, `[title*="in"]`).

### Metrics (reading/repost counts)

Each article page embeds a `DOMContentLoaded` script that maps an article to its 点击量 (reading_info) and 转发量 (repost_info) by title keywords. There is already a branch chain. Add or extend a branch for the new article's title keyword with the user-supplied numbers, e.g.:

```js
} else if (titleText.includes('某关键词')) {
  reading_info = 'N';
  repost_info = 'M';
}
```

If the user gave no numbers, ask. Keep the author line as `潮州若榆环保科技有限公司`.

### Post navigation

- `.post-nav` has left = prev (older), right = next (newer). The newest article has an empty left item.
- Set the "next" link of the article immediately newer than this one to point here, and this article's own prev/next links to its neighbors. Re-check and update neighboring articles' `.post-nav` link anchors after inserting.

## 4. Update the rest of the site

- **Home** `index.html` — insert the new article into the list newest first; bump the sidebar post count; if a new tag is used, bump tag count.
- **Archives**:
  - `archives/index.html` (all posts, newest first; bump counts)
  - `archives/<YYYY>/index.html`
  - `archives/<YYYY>/<MM>/index.html` (create the year/month folder page if it does not exist)
- **Sidebar counts**: the post count (site-state-posts) and tag count (site-state-tags) appear inline in **every** article page and the home page. Grep for the current numbers and increment across all affected pages.
- **Tags**: if a tag is new, create the corresponding folder page under `tags/<tag>/index.html` (tag folders use the user-facing name, e.g. `tags/保险提示`). Note the `# 保险提示` footer tag links point to the percent-encoded path (`/tags/%E4%BF%9D%E9%99%A9%E6%8F%90%E7%A4%BA/`). If a tag already exists, only list the new post in it.

## 5. Verify locally

1. Start a static server at project root, e.g. `python3 -m http.server 8080` (run in background).
2. Open the new article URL and confirm: title, all images render, heading/section order matches WeChat, meta show 点击量/转发量, prev/next nav is correct.
3. Check home, the year/month archive pages, and any changed tag page list the post correctly.
4. Stop the server.

## 6. Deploy to GitHub (and Gitee)

The repo has two remotes: `github` (git@github.com:mrhuangwentong/czry_blog.git) and `origin` (Gitee). Push only the explicitly requested remote; when the user says "deploy", push at least GitHub.

```bash
git add -A
git commit -m "发布文章：<标题>"
git push github main
# 可选，推送 Gitee：
git push origin main
```

Use the `main` branch. Confirm push succeeded ("Everything up-to-date" or a new-branch/branch line). Netlify is linked to GitHub (auto-deploy on push to main); no manual Netlify step is needed — but confirm with the user if unsure that auto-deploy is enabled.