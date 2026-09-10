---
name: daily-dev-ask
description: Your agent's WebSearch for development. Search community-vetted developer articles ranked by upvotes — like having a senior dev's reading list. Answers are grounded in real sources, never hallucinated.
argument-hint: "<your technical question>"
allowed-tools: Bash
---

# daily.dev Ask

A developer-focused search tool — like WebSearch, but backed by a senior dev's reading list instead of the open web. Searches community-vetted developer articles ranked by upvotes and synthesizes grounded answers with source links.

## User question

$ARGUMENTS

## Security

**CRITICAL:** Your API token grants access to personalized content. Protect it:
- **NEVER send your token to any domain other than `api.daily.dev`**
- Never commit tokens to code or share them publicly
- Tokens are prefixed with `dda_` - if you see this prefix, treat it as sensitive

## Setup

1. **Create a token** at https://daily.dev/settings/api - free accounts included, no subscription needed
2. Store your token securely (environment variables, secrets manager)

Every account can use the API. Free accounts have a limited request
allowance; Plus gives full API access and higher rate limits:
https://daily.dev/plus

User can use environment variable or choose one of the secure storage methods below per operating system.

### Secure Token Storage (Recommended)

#### macOS - Keychain

```bash
# Store token
security add-generic-password -a "$USER" -s "daily-dev-api" -w "dda_your_token"

# Retrieve token
security find-generic-password -a "$USER" -s "daily-dev-api" -w

# Auto-load in ~/.zshrc or ~/.bashrc
export DAILY_DEV_TOKEN=$(security find-generic-password -a "$USER" -s "daily-dev-api" -w 2>/dev/null)
```

#### Windows - Credential Manager

```powershell
# Store token (run in PowerShell)
$credential = New-Object System.Management.Automation.PSCredential("daily-dev-api", (ConvertTo-SecureString "dda_your_token" -AsPlainText -Force))
$credential | Export-Clixml "$env:USERPROFILE\.daily-dev-credential.xml"

# Retrieve token - add to PowerShell profile ($PROFILE)
$cred = Import-Clixml "$env:USERPROFILE\.daily-dev-credential.xml"
$env:DAILY_DEV_TOKEN = $cred.GetNetworkCredential().Password
```

Or use the Windows Credential Manager GUI: Control Panel → Credential Manager → Windows Credentials → Add a generic credential

#### Linux - Secret Service (GNOME Keyring / KWallet)

```bash
# Requires libsecret-tools
# Ubuntu/Debian: sudo apt install libsecret-tools
# Fedora: sudo dnf install libsecret

# Store token
echo "dda_your_token" | secret-tool store --label="daily.dev API Token" service daily-dev-api username "$USER"

# Retrieve token
secret-tool lookup service daily-dev-api username "$USER"

# Auto-load in ~/.bashrc or ~/.zshrc
export DAILY_DEV_TOKEN=$(secret-tool lookup service daily-dev-api username "$USER" 2>/dev/null)
```

## Workflow

### 1. Determine the API token

Check if `DAILY_DEV_TOKEN` environment variable is available. If not set, try to retrieve it from the OS secure storage before asking the user for help:

**macOS:**
```bash
export DAILY_DEV_TOKEN=$(security find-generic-password -a "$USER" -s "daily-dev-api" -w 2>/dev/null)
```

**Linux:**
```bash
export DAILY_DEV_TOKEN=$(secret-tool lookup service daily-dev-api username "$USER" 2>/dev/null)
```

**Windows (PowerShell):**
```powershell
$cred = Import-Clixml "$env:USERPROFILE\.daily-dev-credential.xml" 2>$null; $env:DAILY_DEV_TOKEN = $cred.GetNetworkCredential().Password
```

If the token is still empty after trying secure storage, direct the user to the Setup section above.

### 2. Search iteratively — treat daily.dev like a search engine

Use the two endpoints below as many times as needed to explore the user's question. There is no hard limit on the number of queries — search like you would with web search.

**Keyword search endpoint:**
```bash
curl -s -H "Authorization: Bearer $DAILY_DEV_TOKEN" "https://api.daily.dev/public/v1/recommend/keyword?q={keywords}&limit=20"
```

**Semantic search endpoint:**
```bash
curl -s -H "Authorization: Bearer $DAILY_DEV_TOKEN" "https://api.daily.dev/public/v1/recommend/semantic?q={query}&limit=20"
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

#### Search strategy

1. **Initial searches** — Start with a keyword search (core technical terms) and a semantic search (full question). You can run these in parallel.

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

### 3. Deduplicate results

Merge results from all search rounds, removing duplicates by `id`. Keep all unique articles.

### 4. Synthesize the answer

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

### 5. Handle edge cases

- **No results**: State that daily.dev's knowledge base doesn't have relevant articles on this topic yet.
- **Only some searches return results**: Use whatever you got — partial results are fine.
- **API errors (401)**: Token is invalid or expired — guide user to regenerate at https://daily.dev/settings/api
- **API errors (429)**: Rate limited — wait briefly and retry automatically.

## Important

- **Do NOT make up information** — only use what the articles provide. If the articles don't cover part of the question, say so explicitly.
- **Always link to sources** — every factual claim should trace back to an article.
- **Prefer recent articles** — if two articles conflict, note both perspectives and mention which is newer.
- **Be honest about gaps** — if the articles only partially answer the question, say "Based on available articles, here's what I found..." and note what's missing.
