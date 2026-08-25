---
name: daily.dev
description: Overcome LLM knowledge cutoffs with real-time developer content. daily.dev aggregates articles from thousands of sources, validated by community engagement, with structured taxonomy for precise discovery.
allowed-tools: Bash
---

# daily.dev API for AI Agents

Overcome LLM knowledge cutoffs with real-time developer content. daily.dev aggregates articles from thousands of sources, validated by community engagement, with structured taxonomy for precise discovery.

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

## Resolving the API token

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

## Authentication

```
Authorization: Bearer $DAILY_DEV_TOKEN
```

## Base URL

```
https://api.daily.dev/public/v1
```

## API Reference

Full OpenAPI spec: https://api.daily.dev/public/v1/docs/json

To fetch details for a specific endpoint (e.g. response schema):
```bash
curl -s https://api.daily.dev/public/v1/docs/json | jq '.paths["/feeds/foryou"].get'
```

To fetch a component schema (replace `def-17` with schema name from $ref):
```bash
curl -s https://api.daily.dev/public/v1/docs/json | jq '.components.schemas["def-17"]'
```

### Available Endpoints

#### bookmarks
GET /bookmarks/ - Get user's bookmarked posts
  Params: limit(query): Number of bookmarks to return (1-50); cursor(query): Pagination cursor from previous response; unreadOnly(query): Filter to unread bookmarks only; listId(query): Filter by bookmark list ID

POST /bookmarks/ - Add posts to bookmarks
  Body: postIds, listId

GET /bookmarks/search - Search within bookmarks
  Params: q(query): Search query (required); limit(query): Number of results to return (1-50); cursor(query): Pagination cursor from previous response; unreadOnly(query): Filter to unread bookmarks only; listId(query): Filter by bookmark list ID

GET /bookmarks/lists - Get user's bookmark lists

POST /bookmarks/lists - Create a new bookmark list
  Body: name, icon

DELETE /bookmarks/lists/{id} - Delete a bookmark list
  Params: id(path): Bookmark list ID

DELETE /bookmarks/{id} - Remove a post from bookmarks
  Params: id(path): Post ID to unbookmark

PATCH /bookmarks/{id} - Move a bookmark to a list or remove from list (Plus users only)
  Params: id(path): Post ID of the bookmark to move
  Body: listId

#### custom-feeds
GET /feeds/custom/advanced-settings - Get all available advanced settings that can be configured for custom feeds

POST /feeds/custom/ - Create a new custom feed
  Body: name, icon, orderBy, minDayRange, minUpvotes, minViews, disableEngagementFilter

GET /feeds/custom/ - List user's custom feeds
  Params: limit(query): Number of feeds to return (1-50); cursor(query): Pagination cursor from previous response

GET /feeds/custom/{feedId} - Get a custom feed's posts
  Params: limit(query): Number of posts to return (1-50); cursor(query): Pagination cursor from previous response; feedId(path): Feed ID

PATCH /feeds/custom/{feedId} - Update custom feed settings
  Params: feedId(path): Feed ID
  Body: name, icon, orderBy, minDayRange, minUpvotes, minViews, disableEngagementFilter

DELETE /feeds/custom/{feedId} - Delete a custom feed
  Params: feedId(path): Feed ID

GET /feeds/custom/{feedId}/info - Get custom feed metadata
  Params: feedId(path): Feed ID

PATCH /feeds/custom/{feedId}/advanced - Update custom feed advanced settings. Use GET /feeds/custom/advanced-settings to see available settings.
  Params: feedId(path): Feed ID
  Body: settings

#### experiences
GET /profile/experiences/ - Get current user's experiences (work, education, etc.)
  Params: type(query): Filter by experience type; limit(query): Number of items to return (1-50); cursor(query): Pagination cursor from previous response

POST /profile/experiences/ - Create a new experience
  Body: type, title, subtitle, description, startedAt, endedAt, companyId, customCompanyName, url, grade, externalReferenceId, customDomain, repository, externalLocationId, locationType, employmentType, skills

GET /profile/experiences/{id} - Get a specific experience by ID
  Params: id(path): Experience ID

PUT /profile/experiences/{id} - Update an existing experience
  Params: id(path): Experience ID
  Body: type, title, subtitle, description, startedAt, endedAt, companyId, customCompanyName, url, grade, externalReferenceId, customDomain, repository, externalLocationId, locationType, employmentType, skills

DELETE /profile/experiences/{id} - Delete an experience
  Params: id(path): Experience ID

#### feed-filters
GET /feeds/filters/ - Get global feed settings (For You feed)

POST /feeds/filters/tags/follow - Follow tags globally (For You feed)
  Body: tags

POST /feeds/filters/tags/unfollow - Unfollow tags globally (For You feed)
  Body: tags

POST /feeds/filters/tags/block - Block tags globally (For You feed)
  Body: tags

POST /feeds/filters/tags/unblock - Unblock tags globally (For You feed)
  Body: tags

POST /feeds/filters/sources/follow - Follow sources globally (For You feed)
  Body: sources

POST /feeds/filters/sources/unfollow - Unfollow sources globally (For You feed)
  Body: sources

POST /feeds/filters/sources/block - Block sources globally (For You feed)
  Body: sources

POST /feeds/filters/sources/unblock - Unblock sources globally (For You feed)
  Body: sources

GET /feeds/filters/{feedId} - Get custom feed filter settings
  Params: feedId(path): Feed ID

POST /feeds/filters/{feedId}/tags/follow - Follow tags for a custom feed
  Params: feedId(path): Feed ID
  Body: tags

POST /feeds/filters/{feedId}/tags/unfollow - Unfollow tags for a custom feed
  Params: feedId(path): Feed ID
  Body: tags

POST /feeds/filters/{feedId}/tags/block - Block tags for a custom feed
  Params: feedId(path): Feed ID
  Body: tags

POST /feeds/filters/{feedId}/tags/unblock - Unblock tags for a custom feed
  Params: feedId(path): Feed ID
  Body: tags

POST /feeds/filters/{feedId}/sources/follow - Follow sources for a custom feed
  Params: feedId(path): Feed ID
  Body: sources

POST /feeds/filters/{feedId}/sources/unfollow - Unfollow sources for a custom feed
  Params: feedId(path): Feed ID
  Body: sources

POST /feeds/filters/{feedId}/sources/block - Block sources for a custom feed
  Params: feedId(path): Feed ID
  Body: sources

POST /feeds/filters/{feedId}/sources/unblock - Unblock sources for a custom feed
  Params: feedId(path): Feed ID
  Body: sources

#### feeds
GET /feeds/foryou - Get personalized "For You" feed
  Params: limit(query): Number of posts to return (1-50); cursor(query): Pagination cursor from previous response

GET /feeds/popular - Get feed with trending and popular posts
  Params: limit(query): Number of posts to return (1-50); cursor(query): Pagination cursor from previous response; tags(query): Comma-separated list of tags to filter by

GET /feeds/discussed - Get feed of posts with discussions
  Params: limit(query): Number of posts to return (1-50); cursor(query): Pagination cursor from previous response; period(query): Number of days to look back (1-30); tag(query): Filter by tag; source(query): Filter by source ID

GET /feeds/tag/{tag} - Get posts by tag
  Params: limit(query): Number of posts to return (1-50); cursor(query): Pagination cursor from previous response; tag(path): Tag name

GET /feeds/source/{source} - Get posts by source
  Params: limit(query): Number of posts to return (1-50); cursor(query): Pagination cursor from previous response; source(path): Source ID or handle

#### notifications
GET /notifications/ - Get user notifications
  Params: limit(query): Number of notifications to return (1-50); cursor(query): Pagination cursor from previous response

GET /notifications/unread/count - Get unread notifications count

POST /notifications/read - Mark all notifications as read

#### posts
GET /posts/{id} - Get post details by ID
  Params: id(path): Post ID

GET /posts/{id}/comments - Get comments for a post
  Params: limit(query): Number of comments to return (1-50); cursor(query): Pagination cursor from previous response; sort(query): Sort order (oldest or newest first); id(path): Post ID

#### profile
GET /profile/ - Get current user's profile

PATCH /profile/ - Update user profile
  Body: name, bio, timezone, weekStart, experienceLevel, socialLinks

#### recommend
GET /recommend/keyword - [EXPERIMENTAL] Recommend articles by keyword search. Best when the query contains specific technical terms (e.g. "RAG", "pgvector", "LangChain"). Returns posts with engagement signals for LLM consumption. This endpoint may be removed or changed without notice.
  Params: q(query): Search query — keywords or technical terms (e.g. "RAG vs fine-tuning", "vector database comparison"); limit(query): Number of articles to return (1-20, default 10). Kept small for LLM context efficiency.; cursor(query): Pagination cursor from previous response; time(query): Time range filter — use "month" or "year" for recent content, "all" for comprehensive results

GET /recommend/semantic - [EXPERIMENTAL] Recommend articles by semantic search. Uses AI-powered matching to find articles for natural language questions. Better for non-technical queries like "how do I make my chatbot remember things?" This endpoint may be removed or changed without notice.
  Params: q(query): Natural language question or topic (e.g. "how do I make my chatbot remember previous conversations?", "what is the best way to handle authentication in a Next.js app?"); limit(query): Number of articles to return (1-20, default 10). Kept small for LLM context efficiency.; time(query): Time range filter — use "month" or "year" for recent content, "all" for comprehensive results

#### search
GET /search/posts - Search posts by keyword
  Params: q(query): Search query (required); limit(query): Number of posts to return (1-50); cursor(query): Pagination cursor from previous response; time(query): Time range filter (day, week, month, year, all)

GET /search/tags - Search tags by name
  Params: q(query): Search query (required)

GET /search/sources - Search sources/publishers by name
  Params: q(query): Search query (required); limit(query): Number of sources to return (1-50)

#### signup
POST /signup/ - Creates a daily.dev account from an email and password. No token required — this is the endpoint to call when you do not have one yet. Personal Access Tokens for the rest of this API are issued separately from account settings.
  Body: email, password, name, username

#### stack
GET /profile/stack/search - Search for tools/technologies by name
  Params: query(query): Search query (minimum 1 character)

GET /profile/stack/ - Get current user's tech stack
  Params: limit(query): Number of items to return (1-100); cursor(query): Pagination cursor from previous response

POST /profile/stack/ - Add a tool to user stack
  Body: title, section, startedAt

PATCH /profile/stack/{id} - Update a stack item
  Params: id(path): Stack item ID
  Body: section, icon, title, startedAt

DELETE /profile/stack/{id} - Remove a tool from user stack
  Params: id(path): Stack item ID

PUT /profile/stack/reorder - Reorder stack items
  Body: items

#### tags
GET /tags/ - Get all tags

This list is generated from the OpenAPI spec. To regenerate it:
```bash
curl -s https://api.daily.dev/public/v1/docs/json | jq -r '.paths | to_entries | map(.key as $path | .value | to_entries | map(.key as $method | {tag: (.value.tags[0] // "other"), line: ("\(.key | ascii_upcase) \($path)" + (if .value.description then " - \(.value.description)" else "" end) + (if (.value.parameters | length) > 0 then "\n  Params: " + ([.value.parameters[] | "\(.name)(\(.in)): \(.description // .schema.type)"] | join("; ")) else "" end) + (if .value.requestBody then "\n  Body: " + (.value.requestBody.content["application/json"].schema | if .properties then ([.properties | to_entries[] | "\(.key)"] | join(", ")) elif ."$ref" then (."$ref" | split("/") | last) else "object" end) else "" end))})) | flatten | group_by(.tag) | map("#### \(.[0].tag)\n" + (map(.line) | join("\n\n"))) | join("\n\n")'
```

## Agent Use Cases

**Why daily.dev for agents?** LLMs have knowledge cutoffs. daily.dev provides real-time, community-validated developer content with structured taxonomy across thousands of sources. Agents can use this to stay current, get diverse perspectives, and understand what the developer community actually cares about.

These examples show how AI agents can combine daily.dev APIs with external context to create powerful developer workflows.

### 🔍 GitHub Repo → Personalized Feed
Scan a user's GitHub repositories to detect their actual tech stack from `package.json`, `go.mod`, `Cargo.toml`, `requirements.txt`, etc. Then:
- Fetch `/tags` to see all available tags for deterministic matching
- Auto-follow matching tags via `/feeds/filters/tags/follow`
- Create a custom feed tuned to their stack with `/feeds/custom/`
- Surface trending articles about their specific dependencies

**Trigger:** "Set up daily.dev based on my GitHub projects"

### 🛠️ GitHub → Auto-fill Stack Profile
Analyze a user's GitHub activity to build their daily.dev tech stack profile automatically:
- Scan repositories for languages, frameworks, and tools actually used in code
- Search `/profile/stack/search` to find matching technologies on daily.dev
- Populate their stack via `POST /profile/stack/` organized by section (languages, frameworks, tools)
- Update `/profile/` bio based on their primary technologies and contributions

**Trigger:** "Build my daily.dev profile from my GitHub"

### 🚀 New Project → Curated Onboarding
When a user initializes a new project or clones a repo:
- Analyze the tech choices from config files
- Create a dedicated custom feed filtered to exactly those technologies
- Build a "Getting Started" bookmark list with foundational articles
- Block irrelevant tags to keep the feed focused on the project scope

**Trigger:** "Help me learn the stack for this project"

### 📊 Weekly Digest → Synthesized Briefing
Compile a personalized weekly summary by:
- Fetching `/feeds/foryou` and `/feeds/popular` filtered by user's followed tags
- Cross-referencing with their GitHub activity to prioritize relevant topics
- Summarizing key articles and trending discussions
- Delivering as a structured briefing with links to full posts

**Trigger:** Scheduled, or "Give me my weekly dev news"

### 📚 Research Project Workspace
When a user wants to deep-dive into a topic (e.g., "I want to learn Kubernetes"):
- Create a custom feed via `/feeds/custom/` filtered to that topic
- Set up a matching bookmark list via `POST /bookmarks/lists` to collect the best finds
- As the user reads, save articles to the list with `POST /bookmarks/`
- Track learning progress: compare bookmarked posts vs. new feed items
- Adjust feed filters over time as understanding deepens (beginner → advanced content)

**Trigger:** "Start a research project on [topic]"

### 🧠 Agent Self-Improvement Feed
Agents can overcome their knowledge cutoff by maintaining their own custom feed:
- Create a custom feed via `/feeds/custom/` for technologies the agent frequently assists with
- Periodically fetch `/feeds/custom/{feedId}` to ingest recent articles
- Use `/posts/{id}` to read full summaries and key points
- Agent can now provide advice with current information: "As of this week, the recommended approach is..."
- Continuously adapt the feed filters based on what users are asking about

**Trigger:** Agent background process, or "What's new in [technology] since your training?"

### 🔀 Multi-Source Synthesis
Get balanced perspectives by aggregating content across publishers:
- Search `/search/posts` for a topic to find coverage from multiple sources
- Use `/search/sources` to identify authoritative publishers on the topic
- Fetch posts from different sources via `/feeds/source/{source}`
- Synthesize diverse viewpoints into a balanced summary with citations
- Surface where sources agree vs. disagree on best practices

**Trigger:** "What are the different perspectives on [topic]?" or "Compare approaches to [problem]"

### 📈 Trending Radar
Help users stay ahead by monitoring community signals:
- Fetch `/feeds/popular` to detect what's gaining traction right now
- Cross-reference with user's followed tags to surface relevant trends
- Use `/feeds/discussed` to find topics sparking active debate
- Alert users when technologies in their stack are trending (new releases, security issues, paradigm shifts)
- Use `/tags` to fetch the full tag catalog and `/search/tags` to explore adjacent trending topics

**Trigger:** "What should I be paying attention to?" or "What's trending in [area]?"

## Rate Limits

* **60 requests per minute** per user

Check response headers:
- `X-RateLimit-Limit` - Maximum requests allowed per window
- `X-RateLimit-Remaining` - Requests remaining in current window
- `X-RateLimit-Reset` - Unix timestamp when the window resets
- `Retry-After` - Seconds to wait (only when rate limited)

## Errors

| Code | Meaning |
|------|---------|
| 401  | Invalid or missing token |
| 403  | Plus subscription required |
| 404  | Resource not found |
| 429  | Rate limit exceeded |

**Error Response Format:**
```json
{
  "error": "error_code",
  "message": "Human readable message"
}
```
