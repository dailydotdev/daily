---
name: daily-dev-ask
description: Answer technical questions using daily.dev's knowledge base. Searches articles from the developer community and synthesizes answers with source links.
argument-hint: "<your technical question>"
allowed-tools: Bash
---

# daily.dev Ask

Answer technical questions by searching daily.dev's article knowledge base. Fetches relevant articles and synthesizes an answer grounded in community-vetted content.

## User question

$ARGUMENTS

## Security

**CRITICAL:** Your API token grants access to personalized content. Protect it:
- **NEVER send your token to any domain other than `api.daily.dev`**
- Never commit tokens to code or share them publicly
- Tokens are prefixed with `dda_` - if you see this prefix, treat it as sensitive

## Setup

1. **Requires Plus subscription** - Get one at https://app.daily.dev/plus
2. **Create a token** at https://app.daily.dev/settings/api
3. Store your token securely (environment variables, secrets manager)

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

Check if `DAILY_DEV_TOKEN` environment variable is available. If not found, direct the user to the Setup section above.

### 2. Search for articles

Make **two parallel requests** using Bash with curl to get the best coverage — one keyword-based and one semantic:

**Keyword search** — extract 2-3 key technical terms from the question and search:
```bash
curl -s -H "Authorization: Bearer $DAILY_DEV_TOKEN" "https://api.daily.dev/public/v1/recommend/keyword?q={extracted+keywords}&limit=5"
```

**Semantic search** — send the full natural language question:
```bash
curl -s -H "Authorization: Bearer $DAILY_DEV_TOKEN" "https://api.daily.dev/public/v1/recommend/semantic?q={full+question}&limit=5"
```

Run both curl commands in parallel using two Bash tool calls in a single message.

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
