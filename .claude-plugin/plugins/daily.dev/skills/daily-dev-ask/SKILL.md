---
name: daily-dev-ask
description: Answer technical questions using daily.dev's knowledge base. Searches articles from the developer community and synthesizes answers with source links.
argument-hint: "<your technical question>"
allowed-tools: WebFetch
---

# daily.dev Ask

Answer technical questions by searching daily.dev's article knowledge base. Fetches relevant articles and synthesizes an answer grounded in community-vetted content.

## User question

$ARGUMENTS

## Workflow

### 1. Determine the API token

Check if a daily.dev API token is available:
- Look for `DAILY_DEV_TOKEN` environment variable
- If not found, tell the user:
  > To use this skill, you need a daily.dev Plus API token.
  > 1. Go to https://app.daily.dev/settings/api
  > 2. Create a Personal Access Token
  > 3. Set it as `DAILY_DEV_TOKEN` in your environment or `.env` file

### 2. Search for articles

Make **two parallel requests** to get the best coverage — one keyword-based and one semantic:

**Keyword search** — extract 2-3 key technical terms from the question and search:
```
GET https://api.daily.dev/public/v1/recommend/keyword?q={extracted+keywords}&limit=5
Authorization: Bearer $DAILY_DEV_TOKEN
```

**Semantic search** — send the full natural language question:
```
GET https://api.daily.dev/public/v1/recommend/semantic?q={full+question}&limit=5
Authorization: Bearer $DAILY_DEV_TOKEN
```

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

### 3. Deduplicate results

Merge results from both endpoints, removing duplicates by `id`. Keep all unique articles.

### 4. Synthesize the answer

Using the merged article data, compose a response following this structure:

---

**Answer the question directly** in 2-4 paragraphs, grounding your response in the article content. Reference specific articles when making claims. Use the `summary`, `title`, and `tags` to understand each article's angle.

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

### 5. Handle edge cases

- **No results from both endpoints**: Tell the user you couldn't find relevant articles on daily.dev for this topic. Suggest they try rephrasing or searching directly at https://app.daily.dev
- **Only one endpoint returns results**: Use whatever you got — partial results are fine
- **API errors (401)**: Token is invalid or expired — guide user to regenerate at https://app.daily.dev/settings/api
- **API errors (429)**: Rate limited — tell the user to wait a moment and try again

## Important

- **Do NOT make up information** — only use what the articles provide. If the articles don't cover part of the question, say so explicitly.
- **Always link to sources** — every factual claim should trace back to an article.
- **Prefer recent articles** — if two articles conflict, note both perspectives and mention which is newer.
- **Be honest about gaps** — if the articles only partially answer the question, say "Based on available articles, here's what I found..." and note what's missing.
