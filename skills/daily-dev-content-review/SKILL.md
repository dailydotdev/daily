---
name: daily-dev-content-review
description: Review a draft post, article or video script for a daily.dev for Startups company against the squad's weekly intel from daily.dev. Says what works, what's missing and how to improve it for developers who read daily.dev. Use when the user asks for feedback on a draft, a title or a script.
argument-hint: "[path or URL of the draft]"
allowed-tools: Bash
---

# daily.dev content review

Review the user's draft against what developers on daily.dev read, using the squad's weekly intel. Say what is good, what is missing and what would make the biggest difference. Then help the user revise until the draft is ready.

## The draft

$ARGUMENTS

## Step 1: Get the intel

Always start here. Do not review the draft before you have read the intel.

Use the daily.dev MCP server (`https://api.daily.dev/mcp`):

1. Find the squad with `getSquads`. Use the squad where the user holds a paid seat. If there are several, ask the user which company this is for.
2. Call `getSquadsByIdIntel` with the squad's ID or handle and read its `markdown`.

If the daily.dev MCP tools are not available, ask the user to add `https://api.daily.dev/mcp` as a remote MCP server (setup: https://docs.daily.dev/mcp-server/). If they prefer an API token, use the REST endpoint as the daily.dev skill describes: `GET https://api.daily.dev/public/v1/squads/{id}/intel` with `Authorization: Bearer $DAILY_DEV_TOKEN`.

When the intel is not there:
- `403`: the intel is only for paid seats on a daily.dev for Startups plan. Tell the user, and suggest asking a squad admin for a seat.
- `data` is null: there is no intel yet. Call `getSquadsByIdIntelSettings`. If no tags are set, offer to choose tags with the user and save them with `putSquadsByIdIntelSettings` (confirm the tags first); the first intel is ready within about an hour. If tags are set, the intel is still being built.
- In both cases, offer a general review instead, and say that it isn't backed by audience data.

## How to read the intel

The intel covers last week on daily.dev, for the squad's tags and target readers:

- **Your topics**: how the audience's reads split across the squad's tags, the change from the week before, and Competition. Open means few new posts compete for the attention the topic gets. Crowded means many do. The last column shows how much of a topic's reads go to its top 10% of posts.
- **What else your audience reads**: tags the topic readers read more than the rest of the audience.
- **Top posts and What your audience discussed**: what landed and what readers argued about. The comment quotes show what readers care about.
- **Formats, Titles, What the post is like, Length and Timing**: indexes for format, title type, intent, length and publish time.

Most numbers are indexes where 100 is the average post. Quote them as they are, and never turn them into reader counts. When a number you rely on comes from a small number of posts (under about 40), add the count in brackets, like "(12 posts)". Don't base feedback on a "-" cell.

## Step 2: Read the draft

The draft can be a file, pasted text or a URL. If the user hasn't given one, ask for it. Work out what kind of draft it is (an article, a video script, a short post with a link) from the draft itself. If an idea card from the daily-dev-content-ideas skill is in the conversation, use it as the intent behind the draft.

## Step 3: Review it against the intel

Check:

- **Topic**: which of the squad's topics the draft would land in, and how those topics do (share, change, Competition). If it lands in a Crowded topic, say whether a narrower angle would help.
- **Title**: its title type and length, and how they do in the intel. Does the title promise what the draft delivers? What the post is like shows how titles that oversell do with this audience.
- **Format and length**: the format, and whether its length fits what works for that format.
- **What the post is like**: its intent (teaches, solves a specific problem, opens a discussion, promotes, informs) and how specific it is, compared with what does well.
- **Value for the reader**: what a developer takes away. Look for missing specifics: code, numbers, the steps, what went wrong, the trade-offs.
- **Audience interests**: whether the draft could connect to something in What else your audience reads or What your audience discussed.
- **Timing**: when to publish it.

Back each point with the intel number behind it, or with a clear reason for the reader.

## Step 4: Give the review

```markdown
## Review: <draft title>

**Overall:** <two or three sentences: how the draft is likely to do with this audience, and the main reason>

**What works**
- <point, with the intel signal or reason>

**What's missing**
- <what a reader would look for and not find>

**What to improve**, most important first
1. <change>: <why, with the intel number>. <how, with a concrete example>

**Title options**
1. <title> (<title type>, index <n>)
2. <title> (<title type>, index <n>)

**Publish:** <day and time, from the intel>
```

If the draft is a video script, add one line saying that the intel measures posts on daily.dev, so it informs the topic, title and angle, but says nothing about pacing, on-screen length or visuals.

Offer to rewrite a part of the draft, or to review it again after the user revises it.

## Step 5: Review again

When the user sends a revised draft, review it against the last review: say what improved, what is still open and anything new. When the draft is ready, say so.
