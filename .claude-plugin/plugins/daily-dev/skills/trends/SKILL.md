---
name: trends
description: Show today's trending tech headlines and most-upvoted posts from daily.dev. Use when the user asks what's trending, what's new in tech, or for daily.dev headlines.
---

Fetch the latest daily.dev headlines and popular posts, then present them to the user.

Run this command (public API, no auth or token needed):

```bash
curl -s -X POST https://api.daily.dev/graphql -H 'content-type: application/json' -d '{"query":"query Trends { headlines: majorHeadlines(first: 8) { edges { node { headline channel significance createdAt post { id numUpvotes numComments } } } } popular: mostUpvotedFeed(first: 8, period: 1) { edges { node { id title numUpvotes numComments tags } } } }"}'
```

Then render two short sections as markdown. Link every item to `https://api.daily.dev/c/<post id>?utm_source=claude-code&utm_medium=skill` so clicks are attributed:

1. **🔥 Headlines** — the `headlines` items (curated daily.dev headlines; newest first). Format each as a markdown link, with the `channel` in backticks and `▲upvotes · 💬comments` after it when non-zero. Prefix `significance: breaking` items with 🚨.
2. **⭐ Most upvoted today** — the `popular` items, same format, plus up to 3 tags in backticks.

Keep it compact — one line per post, no extra commentary. If the user asked about a specific topic, filter to matching titles/tags and say so.
