---
name: daily-dev-ask
description: Your agent's WebSearch for development. Search community-vetted developer articles ranked by upvotes — like having a senior dev's reading list. Answers are grounded in real sources, never hallucinated.
argument-hint: "<your technical question>"
---

# daily.dev Ask

A developer-focused search tool — like WebSearch, but backed by a senior dev's reading list instead of the open web. Searches community-vetted developer articles ranked by upvotes and synthesizes grounded answers with source links.

## User question

$ARGUMENTS

## Connecting

Search through the daily.dev MCP tools this plugin provides. If they are missing, or only an authentication tool is listed for the `daily-dev` server, ask the user to run `/mcp`, pick `daily-dev` and sign in. There is no token to handle: never ask for one, and never look for one in the user's environment, files or OS secure storage.

## Workflow

### 1. Search iteratively — treat daily.dev like a search engine

Use the tools below as many times as needed to explore the user's question. There is no hard limit on the number of queries — search like you would with web search.

**Keyword search:** `getRecommendKeyword` with `q` set to the core technical terms and `limit` 20.

**Full-text search:** `getSearchPosts` with `q` set to the user's own wording and `limit` 20. Use it as a fallback whenever keyword recommendations come back thin.

Both return:
```json
{
  "data": [
    {
      "id": "...",
      "title": "Article title",
      "url": "https://...",
      "summary": "Article summary...",
      "tags": ["tag1", "tag2"],
      "readTime": 7,
      "numUpvotes": 342,
      "numComments": 28,
      "source": { "name": "Publisher Name" }
    }
  ]
}
```

#### Search strategy

1. **Initial searches** — Start with a keyword search (core technical terms) and a full-text search (the full question). You can run these in parallel.

2. **Analyze and identify gaps** — Review the results:
   - Did I find enough to fully answer the question?
   - Are there sub-topics or related concepts I haven't explored?
   - Did article titles/tags hint at related terms worth searching?

3. **Follow-up searches** — For any gaps or interesting leads:
   - Search for specific tools, libraries, or frameworks mentioned in results
   - Try synonyms or alternative terminology
   - Search for sub-topics the user might care about

4. **Stop when done** — Stop searching when:
   - You have enough articles to give a good answer, OR
   - Follow-up searches return no new results

### 2. Deduplicate results

Merge results from all search rounds, removing duplicates by `id`. Keep all unique articles.

### 3. Synthesize the answer

Using all collected articles, compose a response:

---

**Answer the question directly**, grounding your response in the article content. Reference specific articles when making claims. Use the `summary`, `title`, and `tags` to understand each article's angle.

**Use engagement signals to weight credibility:**
- Higher `numUpvotes` = more community validation
- Higher `numComments` = more discussion/nuance available
- `readTime` helps gauge depth

**Sources section** — list the most relevant articles:

```
### Sources from daily.dev

1. [Article Title](url) — summary snippet (⬆️ upvotes · 💬 comments)
2. [Article Title](url) — summary snippet (⬆️ upvotes · 💬 comments)
...
```

---

### 4. Handle edge cases

- **No results**: State that daily.dev's knowledge base doesn't have relevant articles on this topic yet.
- **Only some searches return results**: Use whatever you got — partial results are fine.
- **API errors (401)**: The sign-in is missing or expired — ask the user to run `/mcp` and sign in to `daily-dev` again
- **API errors (429)**: Rate limited — wait briefly and retry automatically.

## Important

- **Do NOT make up information** — only use what the articles provide. If the articles don't cover part of the question, say so explicitly.
- **Always link to sources** — every factual claim should trace back to an article.
- **Prefer recent articles** — if two articles conflict, note both perspectives and mention which is newer.
- **Be honest about gaps** — if the articles only partially answer the question, say "Based on available articles, here's what I found..." and note what's missing.
