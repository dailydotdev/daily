---
name: daily.dev
description: Access personalized developer content feeds from daily.dev - the professional network for developers. Surface relevant articles, tutorials, and discussions based on user interests.
---

# daily.dev API for AI Agents

> Version: 0.2.0

Access personalized developer content feeds from daily.dev - the professional network for developers. Surface relevant articles, tutorials, and discussions based on user interests.

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

## Authentication

```
Authorization: Bearer dda_your_token_here
```

## Base URL

```
https://api.daily.dev/public/v1
```

## Endpoints

### Get Your Feed

```
GET /feeds/foryou?limit=20&cursor=<optional>
```

Returns your personalized feed of developer content.

**Parameters:**
- `limit` (1-50, default 20) - Number of posts to return
- `cursor` (optional) - From previous response for pagination

**Example Response:**
```json
{
  "data": [
    {
      "id": "abc123",
      "title": "Understanding React Server Components",
      "url": "https://example.com/article",
      "image": "https://...",
      "summary": "A deep dive into React Server Components...",
      "type": "article",
      "publishedAt": "2024-01-15T10:00:00Z",
      "createdAt": "2024-01-15T10:00:00Z",
      "commentsPermalink": "https://app.daily.dev/posts/abc123",
      "source": {"id": "devto", "name": "Dev.to", "handle": "devto", "image": "..."},
      "tags": ["react", "javascript"],
      "readTime": 5,
      "numUpvotes": 142,
      "numComments": 23,
      "author": {"name": "Jane Doe", "image": "..."}
    }
  ],
  "pagination": {"hasNextPage": true, "cursor": "xyz"}
}
```

### Get Post Details

```
GET /posts/:id
```

Returns full details for a specific post, including your interaction state.

**Example Response:**
```json
{
  "data": {
    "id": "abc123",
    "title": "Understanding React Server Components",
    "url": "https://example.com/article",
    "image": "https://...",
    "summary": "A deep dive into RSC...",
    "type": "article",
    "publishedAt": "2024-01-15T10:00:00Z",
    "createdAt": "2024-01-15T10:00:00Z",
    "commentsPermalink": "https://app.daily.dev/posts/abc123",
    "source": {"id": "devto", "name": "Dev.to", "handle": "devto", "image": "..."},
    "author": {"id": "u1", "name": "Jane Doe", "image": "...", "username": "janedoe"},
    "tags": ["react", "javascript"],
    "readTime": 5,
    "numUpvotes": 142,
    "numComments": 23,
    "bookmarked": false,
    "userState": {"vote": 1}
  }
}
```

## Agent Use Cases

- **Content research** - Fetch relevant articles when users ask about technologies
- **Stay current** - Surface trending posts in specific programming domains
- **Deep dives** - Get full post details including summaries for context
- **Track interests** - Check user's interaction state (upvotes, bookmarks)

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

## OpenAPI Documentation

* JSON: https://api.daily.dev/public/v1/docs/json
* YAML: https://api.daily.dev/public/v1/docs/yaml
