---
name: daily-dev-content-review
description: Review a post before it goes on daily.dev for a daily.dev for Startups company. Checks whether developers' feeds are likely to give it limited reach and why, then reviews the draft, link or video script against the squad's weekly intel. Gives suggestions and leaves the writing to the author. Use before publishing any post to a daily.dev squad, and when the user asks for feedback on a draft, a link, a title or a script.
argument-hint: "[path or URL of the draft or the article to share]"
allowed-tools: Bash
---

# daily.dev content review

Review the user's post before they publish it. First check whether developers' feeds are likely to give it limited reach, and why. Then review it against what developers on daily.dev read, using the squad's weekly intel. Say what is good, what is missing and what would make the biggest difference. Then review again as the user revises, until the post is ready.

You point out problems and ask for what only the author knows. You never write the fix.

## The draft

$ARGUMENTS

## Step 1: Get the intel

Use the daily.dev MCP server (`https://api.daily.dev/mcp`):

1. Find the squad with `getSquads`. Use the squad where the user holds a paid seat. If there are several, ask the user which company this is for.
2. Call `getSquadsByIdIntel` with the squad's ID or handle and read its `markdown`.

If the daily.dev MCP tools are not available, ask the user to add `https://api.daily.dev/mcp` as a remote MCP server (setup: https://docs.daily.dev/mcp-server/). If they prefer an API token, use the REST endpoint as the daily.dev skill describes: `GET https://api.daily.dev/public/v1/squads/{id}/intel` with `Authorization: Bearer $DAILY_DEV_TOKEN`.

When the intel is not there:
- `403`: the intel is only for paid seats on a daily.dev for Startups plan. Tell the user, and suggest asking a squad admin for a seat.
- `data` is null: there is no intel yet. Call `getSquadsByIdIntelSettings`. If no tags are set, offer to choose tags with the user and save them with `putSquadsByIdIntelSettings` (confirm the tags first); the first intel is ready within about an hour. If tags are set, the intel is still being built.
- In both cases, still run the reach check in Step 3, and say the rest of the review isn't backed by audience data.

## How to read the intel

The intel covers last week on daily.dev, for the squad's tags and target readers:

- **Your topics**: how the audience's reads split across the squad's tags, the change from the week before, and Competition. Open means few new posts compete for the attention the topic gets. Crowded means many do. The last column shows how much of a topic's reads go to its top 10% of posts.
- **What else your audience reads**: tags the topic readers read more than the rest of the audience.
- **Top posts and What your audience discussed**: what landed and what readers argued about. The comment quotes show what readers care about.
- **Formats, Titles, What the post is like, Length and Timing**: indexes for format, title type, intent, length and publish time.

Most numbers are indexes where 100 is the average post. Quote them as they are, and never turn them into reader counts. When a number you rely on comes from a small number of posts (under about 40), add the count in brackets, like "(12 posts)". Don't base feedback on a "-" cell.

## Step 2: Read the draft

The draft can be a file, pasted text, or a URL of an article the user wants to share. If the user hasn't given one, ask for it. For a URL, fetch the page and read the article itself, plus its page title, description and preview image (`og:title`, `og:description`, `og:image`). Work out what kind of post it is (an article, a video script, a short post with a link) from the draft itself. If an idea card from the daily-dev-content-ideas skill is in the conversation, use it as the intent behind the draft.

## Step 3: Reach check

Check the post against each reason developers' feeds give a post limited reach. The daily.dev docs explain each one: https://docs.daily.dev/what-the-feed-recommends/

- **Reads as AI-written** (`#ai-written`). This is the most common reason. Developers here tend to skip posts that read as AI-written, and that includes AI drafts that were only lightly edited. Look for the patterns readers notice: generic openings and closings, lists of three, the same rhythm in every paragraph, no first-hand detail, no numbers, no code, and no point where the author says what they tried, saw or decided.
- **Mostly about a product** (`#promotional`). The post mostly sells, and a reader learns little they could use without buying.
- **Title promises more than the post** (`#oversold-title`). The title claims more than the post delivers.
- **Not in English** (`#language`). The post reaches only readers who chose its language.
- **Page title and preview** (`#page-metadata`). For a link, check whether the page title is the company name instead of the headline, and whether the description or image is missing. daily.dev shows what the page declares.
- **Shared before** (`#reposting`). Call `getFeedsSourceBySource` with the squad handle and check whether the link is already on the page. If it is, don't share it again. Deleting a post and reposting it doesn't reset anything.

For every reason that applies, quote two or three passages that show it. Then give two or three questions or directions that help the author fix it from their own material. For example: "What went wrong the first time you tried this? Readers here trust posts that show the failed attempt." Or: "Which number from your own setup would back this claim?"

Never write replacement text. That means no rewritten paragraphs, no new intro and no "humanized" version, even when asked. A rewrite by an AI reads as AI-written all over again, and the value of the post is what only the author knows. If the user asks you to rewrite, explain this and ask the questions that get them there.

When the post shares an article that already exists, the fix may be to share a different piece. Say so when another article, release note or video from the team would do better.

## Step 4: Review it against the intel

Check:

- **Topic**: which of the squad's topics the draft would land in, and how those topics do (share, change, Competition). If it lands in a Crowded topic, say whether a narrower angle would help.
- **Title**: its title type and length, and how they do in the intel. What the post is like shows how titles that oversell do with this audience.
- **Format and length**: the format, and whether its length fits what works for that format.
- **What the post is like**: its intent (teaches, solves a specific problem, opens a discussion, promotes, informs) and how specific it is, compared with what does well.
- **Value for the reader**: what a developer takes away. Look for missing specifics: code, numbers, the steps, what went wrong, the trade-offs.
- **Audience interests**: whether the draft could connect to something in What else your audience reads or What your audience discussed.
- **Timing**: when to publish it.

Back each point with the intel number behind it, or with a clear reason for the reader.

## Step 5: Give the review

```markdown
## Review: <draft title>

**Reach check:** Good to go / Limited reach expected

<For each reason that limits reach:>
**<Reason in plain words>** ([what developers here respond to](https://docs.daily.dev/what-the-feed-recommends/#<anchor>))
- "<quoted passage>"
- "<quoted passage>"
Questions to work from:
1. <question that pulls out the author's own experience, numbers or code>
2. <question>

**Overall:** <two or three sentences: how the draft is likely to do with this audience, and the main reason>

**What works**
- <point, with the intel signal or reason>

**What's missing**
- <what a reader would look for and not find>

**What to improve**, most important first
1. <change>: <why, with the intel number>. <what to look for or add, as a direction, not as finished text>

**Title options**
1. <title> (<title type>, index <n>)
2. <title> (<title type>, index <n>)

**Publish:** <day and time, from the intel>
```

Title options are fine to suggest, since a title is a choice for the author and not a rewrite of their work. Keep them true to what the post delivers.

If the draft is a video script, add one line saying that the intel measures posts on daily.dev, so it informs the topic, title and angle, but says nothing about pacing, on-screen length or visuals.

If limited reach is expected, say plainly that the post can still go out: it reaches the squad page and followers, and a boost reaches developers either way. Leave the call to the user.

## Step 6: Review again

When the user sends a revised draft, review it against the last review: say what improved, what is still open and anything new. Run the reach check again. When the post is ready, say so.
