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

1. **Create a token** at https://daily.dev/settings/api - every account can create one, no subscription needed
2. Store your token securely (environment variables, secrets manager)

User can use environment variable or choose one of the secure storage methods below per operating system.

### MCP instead of a token

If your agent speaks MCP, you don't need a token or any of the curl calls below. Add `https://api.daily.dev/mcp` as a remote MCP server (streamable HTTP). Authentication is OAuth: the client registers itself and opens the daily.dev sign-in and consent screens, where the user approves `read` or `read write` access and can disconnect later from Settings > API. Almost every endpoint in this file is a tool named after its `operationId`, for example `getFeedsForyou` for `GET /feeds/foryou`; deprecated endpoints are REST only and are not exposed as tools. Clients that can't run OAuth can send the token as `Authorization: Bearer dda_...` instead. Setup for Claude Code, Cursor, Codex and VS Code: https://docs.daily.dev/mcp-server/

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
  Params: limit(query): Number of bookmarks to return (1-50); cursor(query): Pagination cursor from previous response; unreadOnly(query): Filter to unread bookmarks only; status(query): Read status to return: ALL (default, everything that is not archived), UNREAD, READ or ARCHIVED. Archived bookmarks only show up when asked for.; listId(query): Filter by bookmark list ID

POST /bookmarks/ - Add posts to bookmarks. Saving a post that is already bookmarked overwrites which folder it sits in.
  Body: postIds, listId

GET /bookmarks/search - Search within bookmarks
  Params: q(query): Search query (required); limit(query): Number of results to return (1-50); cursor(query): Pagination cursor from previous response; unreadOnly(query): Filter to unread bookmarks only; status(query): Read status to return: ALL (default, everything that is not archived), UNREAD, READ or ARCHIVED. Archived bookmarks only show up when asked for.; listId(query): Filter by bookmark list ID

GET /bookmarks/lists - Get user's bookmark lists

POST /bookmarks/lists - Create a new bookmark list
  Body: name, icon

DELETE /bookmarks/lists/{id} - Delete a bookmark list
  Params: id(path): Bookmark list ID

DELETE /bookmarks/{id} - Remove a post from bookmarks
  Params: id(path): Post ID to unbookmark

PATCH /bookmarks/{id} - Move a bookmark into a folder, or remove it from its folder. Only available on accounts with bookmark folders enabled.
  Params: id(path): Post ID of the bookmark to move
  Body: listId

#### boosts
GET /boosts/ - Boosts you started, active ones first, then newest. A boost promotes a post or squad in the feed for Cores.
  Params: limit(query): Number of boosts to return (1-50); cursor(query): Pagination cursor from previous response; targetId(query): Only boosts of this post or squad, by ID (the targetId of a boost)

POST /boosts/ - Promote a post or squad in the feed. Charges budget × duration Cores up front: confirm the cost with the user first, and check the reach with getBoostsEstimate. A post or squad can have one active boost at a time. 402 when the balance is too low, with a link to buy Cores.
  Body: type, targetId, budget, duration, wallet

GET /boosts/estimate - Estimated impressions per day a boost would get at a daily budget, as a range. Spends nothing.
  Params: type(query): post: a post you authored or submitted. squad: a squad you moderate or admin.; targetId(query): Post ID, or squad ID or handle; budget(query): Cores to spend per day, 1000 to 100000 in steps of 1000

GET /boosts/{id} - Get one of your boosts by ID
  Params: id(path): Boost ID

DELETE /boosts/{id} - Cancel an active boost and refund the Cores it has not spent. 400 when the boost is no longer active.
  Params: id(path): Boost ID

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

POST /feeds/filters/tags/follow - Follow tags globally (For You feed). Following a tag that is currently blocked removes the block.
  Body: tags

POST /feeds/filters/tags/unfollow - Unfollow tags globally (For You feed)
  Body: tags

POST /feeds/filters/tags/block - Block tags globally (For You feed). Blocking a tag that is currently followed removes the follow.
  Body: tags

POST /feeds/filters/tags/unblock - Unblock tags globally (For You feed)
  Body: tags

POST /feeds/filters/sources/follow - Follow sources globally (For You feed). Following a source that is currently blocked removes the block.
  Body: sources

POST /feeds/filters/sources/unfollow - Unfollow sources globally (For You feed)
  Body: sources

POST /feeds/filters/sources/block - Block sources globally (For You feed). Blocking a source that is currently followed removes the follow.
  Body: sources

POST /feeds/filters/sources/unblock - Unblock sources globally (For You feed)
  Body: sources

GET /feeds/filters/{feedId} - Get custom feed filter settings
  Params: feedId(path): Feed ID

POST /feeds/filters/{feedId}/tags/follow - Follow tags for a custom feed. Following a tag that is currently blocked removes the block.
  Params: feedId(path): Feed ID
  Body: tags

POST /feeds/filters/{feedId}/tags/unfollow - Unfollow tags for a custom feed
  Params: feedId(path): Feed ID
  Body: tags

POST /feeds/filters/{feedId}/tags/block - Block tags for a custom feed. Blocking a tag that is currently followed removes the follow.
  Params: feedId(path): Feed ID
  Body: tags

POST /feeds/filters/{feedId}/tags/unblock - Unblock tags for a custom feed
  Params: feedId(path): Feed ID
  Body: tags

POST /feeds/filters/{feedId}/sources/follow - Follow sources for a custom feed. Following a source that is currently blocked removes the block.
  Params: feedId(path): Feed ID
  Body: sources

POST /feeds/filters/{feedId}/sources/unfollow - Unfollow sources for a custom feed
  Params: feedId(path): Feed ID
  Body: sources

POST /feeds/filters/{feedId}/sources/block - Block sources for a custom feed. Blocking a source that is currently followed removes the follow.
  Params: feedId(path): Feed ID
  Body: sources

POST /feeds/filters/{feedId}/sources/unblock - Unblock sources for a custom feed
  Params: feedId(path): Feed ID
  Body: sources

#### feeds
GET /feeds/foryou - Get personalized "For You" feed. With explain=true, every post also says why For You ranked it where it did.
  Params: limit(query): Number of posts to return (1-50); cursor(query): Pagination cursor from previous response; explain(query): Add explain to every post: why For You ranked it where it did, with the score's factors (engagement, topic match, follow, freshness, seen before, variety) and the reader's controls that applied. Only posts from the personalized ranking (explain.lane chal) carry more than the lane. If For You served the first page in the last few minutes, the first page with explain is that same page, so it explains what the reader just got.

GET /feeds/popular - Get feed with trending and popular posts
  Params: limit(query): Number of posts to return (1-50); cursor(query): Pagination cursor from previous response; tags(query): Comma-separated list of tags to filter by (up to 20)

GET /feeds/discussed - Get feed of posts with discussions
  Params: limit(query): Number of posts to return (1-50); cursor(query): Pagination cursor from previous response; period(query): Days since publication to look back: 7 (default), 30 or 365. Posts are ranked by comment count within that window.; tag(query): Filter by tag; source(query): Filter by source ID

GET /feeds/tag/{tag} - Get posts by tag
  Params: limit(query): Number of posts to return (1-50); cursor(query): Pagination cursor from previous response; tag(path): Tag name

GET /feeds/source/{source} - Get posts by source
  Params: limit(query): Number of posts to return (1-50); cursor(query): Pagination cursor from previous response; source(path): Source ID or handle

#### for-you
GET /feeds/foryou/profile - Read the reader's For You interest profile: every topic For You ranks on with its origin (declared: followed, inferred: learned from reading, set: added by the reader's control), how much reading backs it, its weight before the reader's control (computedWeight) and after it (weight), and the control itself. Also the topics turned off (muted) and blocked, and whether For You learns from reading. When cohort is false, a notice says the controls are saved but have no effect yet.

GET /feeds/foryou/controls - Read what the reader changed in For You: every topic, source and author set to anything but auto with its mode or exact weight and when a timed change ends, whether For You learns from their reading, and whether popular posts fill it once the personalized ones run out. getFeedsForyouProfile says whether these apply yet.

GET /feeds/foryou/left-out - Read what For You leaves out: generates the reader's first page fresh and returns the best posts it left out, up to 20, each with explain.reasons naming why (codes such as hidden, blocked_tag, no_interest_or_follow, older_than_max_age or shown_too_often_without_action), and how often each reason applied across everything left out. Nothing is saved. When cohort is false, a notice says the reader is not on the ranking these reasons come from.

GET /feeds/foryou/posts/{id}/explanation - Explain why a post is in the reader's For You, as getFeedsForyou with explain=true would, for a post an earlier getFeedsForyou call returned. It is read from the page For You served, so send the limit that call used and the pagination.cursor it returned. explain is null, with a notice, when that page did not have the post or For You no longer keeps it (a day at most).
  Params: cursor(query): The pagination.cursor of the getFeedsForyou response the post came in; limit(query): The limit that getFeedsForyou call was sent with; id(path): Post ID

POST /feeds/foryou/topics/mode - Set how much the reader's For You shows a topic. Follows, blocks and other feeds stay as they are. Setting a duration is not available on every account.
  Body: tag, mode, duration

POST /feeds/foryou/topics/weight - Set an exact weight (Exact boost) for a topic in For You. Not available on every account. Take it back with postFeedsForyouTopicsMode and mode auto.
  Body: tag, weight, duration

POST /feeds/foryou/sources/mode - Set how much the reader's For You shows a source or squad. To stop seeing it everywhere, block it with postFeedsFiltersSourcesBlock instead. Setting a duration is not available on every account.
  Body: source, mode, duration

POST /feeds/foryou/sources/weight - Set an exact weight (Exact boost) for a source or squad in For You. Not available on every account. Take it back with postFeedsForyouSourcesMode and mode auto.
  Body: source, weight, duration

POST /feeds/foryou/authors/mode - Set how much the reader's For You shows an author's posts. Setting a duration is not available on every account.
  Body: author, mode, duration

POST /feeds/foryou/authors/weight - Set an exact weight (Exact boost) for an author's posts in For You. Not available on every account. Take it back with postFeedsForyouAuthorsMode and mode auto.
  Body: author, weight, duration

DELETE /feeds/foryou/levels - Take every topic, source and author the reader set in For You back to auto: modes, exact weights and timed changes. Follows and blocks stay. getFeedsForyouControls lists what this clears. At most 10 resets an hour, counted across deleteFeedsForyouLearned, deleteFeedsForyouSeen, deleteFeedsForyouLevels and deleteFeedsForyouPersonalization.

POST /feeds/foryou/learning - Turn For You's learning from the reader's reading on or off. Off ranks on their follows and controls alone. On by default.
  Body: enabled

POST /feeds/foryou/fill-ins - Turn popular fill-ins on or off: whether popular posts fill For You once the personalized ones run out. On by default.
  Body: enabled

DELETE /feeds/foryou/learned - Make For You forget what it learned from the reader's reading, so it starts over from their follows. Follows, blocks and controls stay. Cannot be undone. At most 10 resets an hour, counted across deleteFeedsForyouLearned, deleteFeedsForyouSeen, deleteFeedsForyouLevels and deleteFeedsForyouPersonalization.

DELETE /feeds/foryou/seen - Make For You forget which posts the reader scrolled past, so posts they skipped can show up again. Cannot be undone. At most 10 resets an hour, counted across deleteFeedsForyouLearned, deleteFeedsForyouSeen, deleteFeedsForyouLevels and deleteFeedsForyouPersonalization.

DELETE /feeds/foryou/personalization - Start For You over in one call: forget what it learned from the reader's reading and which posts they scrolled past, and take every topic, source and author back to auto. Follows, blocks and the learning and fill-ins switches stay. Cannot be undone. At most 10 resets an hour, counted across deleteFeedsForyouLearned, deleteFeedsForyouSeen, deleteFeedsForyouLevels and deleteFeedsForyouPersonalization.

#### notifications
GET /notifications/ - Get user notifications
  Params: limit(query): Number of notifications to return (1-50); cursor(query): Pagination cursor from previous response

GET /notifications/unread/count - Get unread notifications count

POST /notifications/read - Mark all notifications as read

#### plugins
GET /plugins/ - List approved plugins from the daily.dev marketplace, most upvoted first. A plugin has an about page plus agent instructions (SKILL.md), a link, or both.
  Params: q(query): Search in plugin names and descriptions; limit(query): Number of plugins to return (1-50); cursor(query): Pagination cursor from previous response

POST /plugins/ - Submit a plugin to the daily.dev marketplace for review. Provide agent instructions (SKILL.md), a link, or both. Links may point to third-party sites and repositories hosted outside daily.dev. The plugin becomes publicly visible to everyone in the marketplace once the daily.dev team approves it.
  Body: name, description, about, skillMd, url, repositoryUrl

GET /plugins/{id} - Get an approved plugin by id, including its about page. The SKILL.md is served separately at skillMdUrl.
  Params: id(path): Plugin id

PUT /plugins/{id} - Submit an update to one of your approved plugins for review. Send the full plugin content, it replaces the publicly listed version once the daily.dev team approves it. Links may point to third-party sites and repositories hosted outside daily.dev. The current version stays live until then, and a newer update replaces one still in review.
  Params: id(path): Plugin id
  Body: name, description, about, skillMd, url, repositoryUrl

#### posts
GET /posts/{id} - Get post details by ID
  Params: id(path): Post ID

GET /posts/{id}/comments - Get comments for a post
  Params: limit(query): Number of comments to return (1-50); cursor(query): Pagination cursor from previous response; sort(query): Sort order (oldest or newest first); id(path): Post ID

GET /posts/{id}/analytics - Lifetime analytics of a post you authored, refreshed periodically rather than live. 403 when you are not the author, 404 when the post does not exist or has no analytics yet.
  Params: id(path): Post ID

GET /posts/{id}/analytics/history - Daily impressions of a post you authored, newest first. Only days with recorded impressions are listed. 403 when you are not the author.
  Params: limit(query): Number of days to return (1-50); cursor(query): Pagination cursor from previous response; id(path): Post ID

PATCH /posts/{id} - Change the title or markdown content of a written post you published. Shared links keep their article; only written posts can be edited.
  Params: id(path): Post ID
  Body: title, content

DELETE /posts/{id} - Delete a post you published, or one in a squad you moderate. Permanent.
  Params: id(path): Post ID

#### profile
GET /profile/ - Get current user's profile

PATCH /profile/ - Update your profile. Only the fields you send change. Show the user every change before saving.
  Body: name, bio, timezone, weekStart, experienceLevel, socialLinks, image, cover, readme

GET /profile/analytics/ - Performance of the posts you authored over the period, compared with the window before it, plus lifetime totals. Each headline metric says whether it is scoped to the period (PERIOD) or a running total (LIFETIME); coverage says which days the period numbers are built from.
  Params: period(query): The last 30 or 90 whole days, ending yesterday in UTC since today is still being counted

GET /profile/analytics/history - Daily impressions across the posts you authored over the period, oldest first. Only days with recorded impressions are listed: a day missing between coverage.coveredStartDate and coverage.endDate had zero impressions, while a day before coveredStartDate was never measured and must not be read as zero.
  Params: period(query): The last 30 or 90 whole days, ending yesterday in UTC since today is still being counted

GET /profile/analytics/posts - The posts you authored with their performance over the period, sorted and paginated.
  Params: period(query): The last 30 or 90 whole days, ending yesterday in UTC since today is still being counted; sort(query): Column to sort on. createdAt is when the post went up on daily.dev.; order(query): Sort direction; limit(query): Number of posts to return (1-50); cursor(query): Pagination cursor from previous response

#### recommend
GET /recommend/keyword - [EXPERIMENTAL] Recommend articles by keyword search. Best when the query contains specific technical terms (e.g. "RAG", "pgvector", "LangChain"). Returns posts with engagement signals for LLM consumption. Natural-language questions and long phrases usually match nothing and return an empty list; use GET /search/posts with two or three keywords for those. This endpoint may be removed or changed without notice.
  Params: q(query): Search query — keywords or technical terms (e.g. "RAG vs fine-tuning", "vector database comparison"); limit(query): Number of articles to return (1-20, default 10). Kept small for LLM context efficiency.; cursor(query): Pagination cursor from previous response; time(query): Time range filter — use "month" or "year" for recent content, "all" for comprehensive results

GET /recommend/semantic - [DEPRECATED] Use /recommend/keyword instead, which this endpoint now answers from. Kept for older clients and scheduled for removal.
  Params: q(query): Natural language question or topic (e.g. "how do I make my chatbot remember previous conversations?", "what is the best way to handle authentication in a Next.js app?"); limit(query): Number of articles to return (1-20, default 10). Kept small for LLM context efficiency.; time(query): Time range filter — use "month" or "year" for recent content, "all" for comprehensive results

#### search
GET /search/posts - Search posts by keyword
  Params: q(query): Search query (required); limit(query): Number of posts to return (1-50); cursor(query): Pagination cursor from previous response; time(query): Time range filter (day, week, month, year, all)

GET /search/tags - Search tags by name
  Params: q(query): Search query (required). Tags are lowercase hyphenated slugs such as "claude-code"; spaces in the query are treated as hyphens.

GET /search/sources - Search sources/publishers by name
  Params: q(query): Search query (required); limit(query): Number of sources to return (1-50)

#### squads
GET /squads/ - Squads you belong to, with your role, whether you hold a paid seat and the invite link to share with teammates. Use it to find your company page.
  Params: limit(query): integer; cursor(query): endCursor from the previous page

GET /squads/{id}/analytics - Lifetime analytics across the posts of a squad you moderate or admin. 403 for other members.
  Params: id(path): Squad ID or handle

GET /squads/{id}/analytics/history - Daily impressions across the posts of a squad you moderate or admin, for the last 45 days, newest first. Only days with recorded impressions are listed.
  Params: id(path): Squad ID or handle

GET /squads/{id} - A squad with its settings, paid features, rules, links and branding. Check features before calling the paid endpoints.
  Params: id(path): Squad ID or handle

PATCH /squads/{id} - Change the settings, logo or cover of a squad you admin or moderate. Send only the fields to change.
  Params: id(path): Squad ID or handle
  Body: name, handle, description, memberPostingRole, memberInviteRole, moderationRequired, postingMinReputation, private, categoryId, image, headerImage (image and headerImage are http(s) image URLs that daily.dev downloads and stores; 400 when one cannot be fetched or is not an image)

PUT /squads/{id}/rules - Replace the rules of a squad you admin or moderate. An empty list removes them.
  Params: id(path): Squad ID or handle
  Body: rules

PUT /squads/{id}/links - Replace the website and links shown on the squad page. Needs the links feature (any squad plan). 403 without it.
  Params: id(path): Squad ID or handle
  Body: website, links

PUT /squads/{id}/branding - Set the header button members see in place of Join, and the brand color. The button needs the cta feature (Team plan) or a verified squad; the color needs a verified squad (Enterprise). Both values are replaced: omit one to clear it.
  Params: id(path): Squad ID or handle
  Body: color, button

GET /squads/{id}/products - Products shown on the squad page, in display order. Empty while the products feature is off.
  Params: id(path): Squad ID or handle

POST /squads/{id}/products - Add a product to the squad page, linking the catalog tool with that name or creating it. Needs the products feature. Plan squads show one product, verified squads up to 20; 400 past the limit.
  Params: id(path): Squad ID or handle
  Body: name, tagline, description, pricingModel, links, url

PATCH /squads/products/{productId} - Change a product on your squad's page. The name cannot be changed. Send only the fields to change.
  Params: productId(path): Product ID
  Body: tagline, description, pricingModel, links, url

DELETE /squads/products/{productId} - Remove a product from its squad page. The catalog tool stays.
  Params: productId(path): Product ID

PUT /squads/{id}/products/order - Set the display order of the squad's products.
  Params: id(path): Squad ID or handle
  Body: ids

GET /squads/{id}/members - Members of a squad with their role and whether they hold a paid seat.
  Params: limit(query): integer; cursor(query): endCursor from the previous page; role(query): Only this role. blocked lists blocked users and needs moderator access.; query(query): Search members by name or username; id(path): Squad ID or handle

PUT /squads/{id}/members/{userId}/role - Set a member role in a squad you admin. blocked removes the member and stops them from joining again; moderators can block members too.
  Params: id(path): Squad ID or handle; userId(path): The member's user ID
  Body: role

POST /squads/{id}/members/{userId}/unblock - Let a blocked user join the squad again.
  Params: id(path): Squad ID or handle; userId(path): The member's user ID

GET /squads/{id}/subscription - The daily.dev for Startups plan of a squad you admin or moderate, with its paid seats (starter 1, team 5, enterprise per contract) and the Cores its wallet holds for boosts. plan is null without an active subscription.
  Params: id(path): Squad ID or handle

PUT /squads/{id}/seats/{userId} - Give an admin or moderator one of the plan paid seats, which includes API posting for the squad. Squad admins only. 409 when every seat is taken.
  Params: id(path): Squad ID or handle; userId(path): The member's user ID

DELETE /squads/{id}/seats/{userId} - Free a member's paid seat. Squad admins only. The subscription owner keeps theirs.
  Params: id(path): Squad ID or handle; userId(path): The member's user ID

GET /squads/{id}/intel - The latest weekly intel for the squad: what developers read in its tags last week, which topics and titles work, and when to publish. Use it as context for content ideas and reviews. Numbers are shares, indexes (100 is average) and changes, never raw counts. New intel is built every Monday; data is null until the first is ready, within about an hour of setting the tags. For the paid seats of a squad on a daily.dev for Startups plan.
  Params: id(path): Squad ID or handle

GET /squads/{id}/intel/settings - The tags the weekly intel follows, the readers it targets and what the plan allows (starter up to 5 tags, team up to 20 tags with seniority, enterprise up to 40 tags with seniority and region). Paid seats only.
  Params: id(path): Squad ID or handle

PUT /squads/{id}/intel/settings - Choose the tags the weekly intel follows and, where the plan allows, the readers it targets (starter up to 5 tags, team up to 20 tags with seniority, enterprise up to 40 tags with seniority and region). Replaces the stored settings. Tags are daily.dev tags such as kubernetes; synonyms are mapped to their tag. Changes show from the next weekly intel; a squad without intel yet gets last week's within the hour. Paid seats only.
  Params: id(path): Squad ID or handle
  Body: tags, seniority, regions

POST /squads/{id}/posts - Publish to a squad as yourself: send url (and optional commentary) to share a link, or title (and optional content and imageUrl) for a written post. Needs the apiPosting feature and, on a squad with a plan, a paid seat. On a squad that moderates posts, status is pending until a moderator approves it. Public: confirm the text with the user first.
  Params: id(path): Squad ID or handle
  Body: url, commentary, title, content, imageUrl

GET /squads/{id}/pending-posts - Posts waiting for approval in a squad that moderates posts. Moderators and admins see every pending post, members only their own.
  Params: limit(query): integer; cursor(query): endCursor from the previous page; id(path): Squad ID or handle

POST /squads/{id}/pending-posts/moderate - Approve pending posts so they publish, or reject them with a reason. Squad moderators and admins only.
  Params: id(path): Squad ID or handle
  Body: ids, status (approved or rejected), rejectionReason (required when rejecting), message

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

#### uploads
POST /uploads/ - Upload an image file from the user's machine, such as a profile photo or a cover you made. Returns a one-time URL valid for 15 minutes: send the file to it with `curl -X PUT -H "Content-Type: image/png" --data-binary @file.png "<uploadUrl>"` (png, jpeg, webp or gif, up to 5 MB; a gif shows as its first frame). The response has the hosted image url to pass as a profile image or cover, a squad image or headerImage, or a written post imageUrl. Size the image for its slot first: profile image 400x400, profile cover 1024x256, squad image 512x512, squad headerImage 1500x300, post imageUrl 1200x630. Each field's description has the details.

PUT /uploads/{token} - Send the image file as the raw request body to the uploadUrl from POST /uploads. Needs no Authorization header.
  Params: token(path): string

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

### 🎛️ Tune the For You Feed
Explain and adjust what the user's For You feed shows:
- Read `/feeds/foryou/profile` for the topics For You ranks on and why, and `/feeds/foryou/left-out` for the posts it left out and why
- Fetch `/feeds/foryou?explain=true` to see why each post is where it is, or `/feeds/foryou/posts/{id}/explanation` for one post from an earlier `/feeds/foryou` page
- Show more or less of a topic, source or author with the `/feeds/foryou/*/mode` endpoints, or set `mode` to `auto` to undo a change
- Exact weights (`/feeds/foryou/*/weight`) and changes that end after a `duration` are not available on every account
- Check `/feeds/foryou/controls` for everything the user changed so far
- Take every topic, source and author change back to auto with `DELETE /feeds/foryou/levels`, or start For You over with `DELETE /feeds/foryou/personalization`. Confirm with the user before calling either one
- Every response with a `notice` says why in plain words. On the profile and left-out endpoints it means the user's For You is not on the personalized ranking yet, so changes are saved and apply later

**Trigger:** "Why don't I see [topic] in my feed?", "Show me less [topic]" or "Reset my feed"

### 📣 Measure and Boost Your Content
Report how the user's posts and squads perform, and promote them:
- `/profile/analytics?period=30d` (or `90d`) for headline numbers against the window before, `/profile/analytics/posts?sort=impressions` to see which posts worked, `/posts/{id}/analytics` and `/squads/{id}/analytics` for one post or squad
- A metric whose `semantics` is `LIFETIME` is a running total, not the period's number, and `previous` is null when a comparison would mislead
- Check `/boosts/estimate` before `POST /boosts`. A boost charges `budget × duration` Cores up front, so confirm the total with the user first. `DELETE /boosts/{id}` stops it and refunds what it has not spent
- A 402 means the balance is too low: share the `buyCoresUrl` from the response with the user

**Trigger:** "How did my last post do?", "Which of my posts reached the most people?" or "Boost my post"

### 🏠 Manage Your Squad
Run a squad the user admins or moderates, such as their company page on daily.dev for Startups:
- Find it with `GET /squads/` when the user doesn't name it: each row has their role, seat and the squad's invite link. Then `GET /squads/{id}` (ID or handle): `features` says which paid endpoints the squad's plan unlocks, and `currentMember.role` says what the user can change
- `PATCH /squads/{id}` sends only the fields to change, including the logo (`image`) and cover (`headerImage`) as image URLs. Rules, links and branding are replaced whole, so read them first and send the full list
- Size the logo and cover before sending them (see [Images](#images)): the cover is a wide 5:1 banner, not a 16:9 or 2:1 image, or its top and bottom get cut off
- Links need `features.links`, the header button needs `features.cta` (or a verified squad), the brand color needs a verified squad, and products need `features.products`. A plan caps products, and adding past the cap returns 400
- `GET /squads/{id}/subscription` shows the plan, its paid seats and the wallet's Cores. Seats go to admins or moderators with `PUT /squads/{id}/seats/{userId}`, and a full plan returns 409. A teammate who isn't a member yet joins through the invite link first
- `POST /squads/{id}/posts` publishes as the user: a link with commentary, or a written post. It needs `features.apiPosting` and, on a plan, a seat. Show the user the exact text before posting. On a moderated squad the post waits in `GET /squads/{id}/pending-posts` until approved with `POST /squads/{id}/pending-posts/moderate`
- The weekly intel (`GET /squads/{id}/intel`) is grounded context for content ideas and post reviews: which of the squad's topics get read, what else the same readers read, which title types work and when to publish. It comes as `markdown` and as structured `numbers`. It is for the plan's paid seats. Choose its tags with `PUT /squads/{id}/intel/settings` (read `GET /squads/{id}/intel/settings` first for the plan's limits); a change shows from the next week's intel. Numbers are shares and indexes, so quote them as they are rather than turning them into reader counts
- Changing a role, removing a product or freeing a seat takes effect at once, so confirm with the user first

**Trigger:** "Add our new product to the squad page", "Post our launch to our daily.dev page", "Give my cofounder a seat", "What should we write about this week?" or "Update the squad rules"

## Images

Every image field takes an http(s) URL that daily.dev downloads, resizes and stores. For a file on the user's machine, get a URL from `POST /uploads` first. PNG, JPEG, WebP or GIF, up to 5 MB; a GIF shows as its first frame. A URL that cannot be fetched or is not an image returns 400.

daily.dev crops each image to fill its slot, so an image with the wrong shape loses its edges. Make or crop it to the size below before uploading. When you generate an image, ask for this aspect ratio, then crop and resize the result to the exact size.

| Image | Field | Upload | How it shows | Stored at |
|---|---|---|---|---|
| Profile photo | `image` on `PATCH /profile` | 400x400 (1:1) | Rounded square, up to 120 px | 400 px wide |
| Profile cover | `cover` on `PATCH /profile` | 1024x256 (4:1) | Strip 144 px tall: about 5:1 on desktop, cropped to about 2.3:1 on phones | 1024 px wide |
| Squad logo | `image` on `PATCH /squads/{id}` | 512x512 (1:1) | Circle, up to 104 px | 512 px |
| Squad cover | `headerImage` on `PATCH /squads/{id}` | 1500x300 (5:1) | Strip 144 px tall: about 5.4:1 on desktop, up to 7:1 on tablets, cropped at the sides on phones; also behind the squad on Squads directory cards | 924 px wide |
| Written post image | `imageUrl` on `POST /squads/{id}/posts` | 1200x630 (1.91:1) | Cropped to about 1.9:1 on feed cards, whole on the post page | 800 px wide |

Bigger is fine as long as the shape matches: daily.dev scales it down. Smaller looks blurry.

Best practices:
- **Profile photo:** the person's face, centred and filling most of the frame. Never a company logo.
- **Profile cover:** decorative, with no text. The profile photo covers the bottom-left corner and phones keep only the middle half, so keep the subject in the centre.
- **Squad logo:** the logomark, not the full wordmark, inside the middle 70% so the circle does not clip it. Use a solid background: a transparent logo can vanish on the dark or light theme.
- **Squad cover:** run the background to every edge, with no border or frame. Keep text to one short line, and keep text and logos inside the middle 60% of the width and 70% of the height. Leave the bottom-left corner clear: the squad logo sits over it. A 16:9 or 2:1 image loses its top and bottom, which cuts through text.
- **Written post image:** the standard link preview size. Keep text large and centred, because feed cards are small.

## Rate Limits

Requests are rate limited per user and per IP, with a monthly allowance that varies by account. MCP tool calls and OAuth requests count against the same per-user quota as the token.

Check response headers:
- `X-RateLimit-Limit` - Maximum requests allowed per window
- `X-RateLimit-Remaining` - Requests remaining in current window
- `X-RateLimit-Reset` - Unix timestamp when the window resets
- `Retry-After` - Seconds to wait (only when rate limited)

## Errors

| Code | Meaning |
|------|---------|
| 401  | Invalid or missing token |
| 402  | Not enough Cores to start a boost. `buyCoresUrl` links to buying more |
| 400  | Invalid input, or a squad plan limit such as the product cap |
| 403  | A capability this account does not have (bookmark folders, For You exact weights and timed changes, a squad role or a paid squad feature), account not confirmed, or OAuth token missing the required scope |
| 404  | Resource not found |
| 409  | Conflict, such as a squad with every paid seat taken or a product already on the page |
| 429  | Rate limit exceeded. Without Plus, `upgradeUrl` links to daily.dev Plus |

**Error Response Format:**
```json
{
  "error": "error_code",
  "message": "Human readable message"
}
```
