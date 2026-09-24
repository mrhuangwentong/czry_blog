---
name: copy-wechat-article
description: Copy a WeChat mp article into the czry_blog Hexo/NexT site as a new post, download its images to image/, update all site pages, and deploy to GitHub. Use when the user shares a mp.weixin.qq.com link and asks to add it, copy it onto the site, or publish/repost it. Do not use for general GitHub pushes or unrelated tasks.
---

# Copy WeChat Article to czry_blog

Copy a WeChat official-account article into this blog, store its images locally, update the whole site (home, archives, tags), then deploy to GitHub (and optionally Gitee).

## 核心原则（最重要的铁律）：最小干预、原样照搬
把微信文章的 #js_content 完整原始 innerHTML **一个标签都不增删、不改写**地复制到 post-body，**只做两件事**：
1. 在标题下方插入一行元信息（发布时间 / 作者 / 阅读量 / 转发量）。
2. 把正文里所有图片 URL 本地化到 `/image/`。
**绝对禁止**：手工重建正文结构、把 SVG 精灵替换成 img 列表、估算/近似滚动条数量、跳过体积大的 GIF、改写内联样式、删除 foreignObject/SVG/SMIL（`<animateTransform>`）动画。微信正文里的 SVG 精灵、foreignObject、background-image、SMIL 动画在 Chrome 都能正常显示和播放，原样保留即可。

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

## 2. 图片本地化（不是重建）

在标准浏览器（Chrome）中，微信正文大多数元素原样可用（含 SVG 精灵、foreignObject、SMIL `<animateTransform>` 动画），因此**不要**把图片/动画结构改成 `<img>` 列表。只需要把所有远程图片 URL 换成本地 `/image/`：

1. **下载每个唯一图片**保存为 `image/<N>.<ext>`（从 `image/` 当前最大编号+1 开始）。先用哈希/字节比对复用 `image/` 里已存在的同名内容文件，已在的话直接复用，避免重复下载堆文件。
2. **一张都不能漏，也绝不能因体积大而跳过**（包括数 MB 的大 GIF）。GIF 在多个位置复用同一 URL 时存一次、多处引用同一本地文件。
3. 改写范围要覆盖两类引用：
   - `<img ... data-src="https://..."/>`：把 `data-src` 的值改为 `/image/N`，并确保 `src` 也指向 `/image/N`。
   - `<svg ... style="background-image:url(https://...)">` 或任意 `style` 里的 `background-image:url(...)`：把 url(...) 里的远程 URL 改成 `/image/N`（注意处理 `&quot;` 等 HTML 实体包裹）。
4. **保持 #js_content 的标签结构与顺序完全不变**，只替换 URL 字符串，不新增/删除/移动任何元素。

## 3. Build the article page

Create `image`-home path: `<YYYY>/<MM>/<DD>/<slug>/index.html` — copy `2026/07/31/flood-risk-checkup/index.html` and replace:

- Every occurrence of the old title string with the new title:
  - `<title>` line, `og:title`, `twitter:*`, `meta description`, `canonical`, the `next-config pagemark`, `<h1 class="post-title">`, the sidebar TOC `<ol class="nav">`, and `article:published_time`/`article:modified_time`.
- `og:url`, `canonical`, `og:image`/`twitter:image` → the new file path and the downloaded image paths (e.g. `/image/31.png`).
- Replace the old folder/slug in all internal path strings (`<YYYY>/<MM>/<DD>/<slug>/`).
- The date `<time>` in `.post-meta` and the sidebar/footer `copyrightYear`.
- Replace the `<div class="post-body">` inner HTML with the **verbatim** `#js_content` innerHTML from the original — do NOT reconstruct. Localize all image URLs per section 2. Keep the SMIL `<animateTransform>`, `foreignObject`, SVG sprites and inline styles untouched.
- **Insert a meta line** right after the post title / at the top of `post-body` (before the article content) with: 发布时间 / 作者 / 阅读量 / 转发量. Keep the author line as `潮州若榆环保科技有限公司` unless the user gives another.
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