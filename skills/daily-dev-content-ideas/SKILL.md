---
name: daily-dev-content-ideas
description: Find what a daily.dev for Startups company should publish next. Fetches the squad's weekly intel from daily.dev, looks at the team's recent work and shapes a post or video idea that developers will read. Use when the user asks what to write, post or make a video about, or wants help with a content idea.
argument-hint: "[an idea you already have]"
allowed-tools: Bash
---

# daily.dev content ideas

Help the user find and shape their next post or video for daily.dev. The idea comes from the user's own work: what they built, fixed, measured or learned. The weekly intel shapes how to present it: the topic it lands in, the angle, the format, the title, the length and when to publish. Never steer the user toward a popular topic that has nothing to do with their product.

## The user's idea

$ARGUMENTS

## Step 1: Get the intel

Always start here. Do not suggest ideas before you have read the intel.

Use the daily.dev MCP server (`https://api.daily.dev/mcp`):

1. Find the squad with `getSquads`. Use the squad where the user holds a paid seat. If there are several, ask the user which company this is for.
2. Call `getSquadsByIdIntel` with the squad's ID or handle and read its `markdown`.

If the daily.dev MCP tools are not available, ask the user to add `https://api.daily.dev/mcp` as a remote MCP server (setup: https://docs.daily.dev/mcp-server/). If they prefer an API token, use the REST endpoint as the daily.dev skill describes: `GET https://api.daily.dev/public/v1/squads/{id}/intel` with `Authorization: Bearer $DAILY_DEV_TOKEN`.

When the intel is not there:
- `403`: the intel is only for paid seats on a daily.dev for Startups plan. Tell the user, and suggest asking a squad admin for a seat.
- `data` is null: there is no intel yet. Call `getSquadsByIdIntelSettings`. If no tags are set, offer to choose tags with the user and save them with `putSquadsByIdIntelSettings` (confirm the tags first); the first intel is ready within about an hour. If tags are set, the intel is still being built.
- In both cases, offer to carry on with the user's work alone, and say that the suggestions won't be backed by audience data.

## How to read the intel

The intel covers last week on daily.dev, for the squad's tags and target readers:

- **Your topics**: how the audience's reads split across the squad's tags, the change from the week before, and Competition. Open means few new posts compete for the attention the topic gets. Crowded means many do. The last column shows how much of a topic's reads go to its top 10% of posts.
- **What else your audience reads**: tags the topic readers read more than the rest of the audience. Use these to find an angle that connects the user's topic to something the same readers already care about.
- **Top posts and What your audience discussed**: what landed and what readers argued about. The comment quotes show what readers care about.
- **Formats, Titles, What the post is like, Length and Timing**: indexes for format, title type, intent, length and publish time.

Most numbers are indexes where 100 is the average post. Quote them as they are, and never turn them into reader counts. When a number you rely on comes from a small number of posts (under about 40), add the count in brackets, like "(12 posts)". Don't base a suggestion on a "-" cell.

## Step 2: Ask whether they have an idea

If the user gave an idea above, go to step 4.

Otherwise, open with two or three short openings from this week's intel, such as an Open topic with a high reads-per-post index, or a title type that does well. Then ask whether they already have something in mind.

## Step 3: Find ideas in their work

If they don't have an idea, look at what the team did over the last 2 to 4 weeks, wherever you know their work lives: commits and pull requests in the repositories you know about, releases, changelogs, docs and issues. Look for things worth telling other developers:

- A feature or product that shipped
- A hard problem they solved, a bug that took days, or a migration
- Numbers: benchmarks, costs, performance before and after
- A decision they made and why, or a tool they dropped
- Something that surprised them

Suggest 3 ideas. For each, give one line on the idea, the work it comes from, the intel signal that supports it (with the number), and the format that fits it. Ask which one to develop, or whether they'd like other ideas.

## Step 4: Interview the user

Ask questions one at a time, usually 3 to 5, to get the details only the user has. Change the questions to fit the idea, for example:

- What was the hardest part, and what did you try first?
- Do you have numbers: before and after, cost, time saved?
- What would you tell a developer about to do the same thing?
- What did you get wrong, or what surprised you?
- Who is this for: what do they work on, and how senior are they?

Stop when you have enough to shape the idea.

## Step 5: Shape the idea with the intel

Adjust the idea to give it the best chance with this audience:

- **Topic**: which of the squad's topics it fits best. Prefer topics that are Open and get many reads per post. If the best fit is Crowded, say so and suggest a narrower angle.
- **Angle**: a link to something in What else your audience reads, if one fits the idea.
- **Format**: the format that fits the idea and does well in the intel.
- **Title**: 2 or 3 options using different title types that work in the intel. Name the type and its index for each.
- **Length**: the length that works for the chosen format.
- **What to include**: based on What the post is like, for example teaching something specific, and delivering what the title promises.
- **When to publish**: from Timing.

Then give the idea card:

```markdown
## Idea: <working title>

**What it is:** <two or three sentences>
**Based on:** <the work it comes from>
**Topic:** #tag (<why, with the intel numbers>)
**Angle:** <the angle, and the audience interest it connects to>
**Format and length:** <format>, <length>
**Title options:**
1. <title> (<title type>, index <n>)
2. <title> (<title type>, index <n>)
**Must include:** <the details from the interview that make it worth reading>
**Publish:** <day and time, from the intel>
```

If the idea is a video, add one line saying that the intel measures posts on daily.dev, so it informs the topic, title and angle, but says nothing about pacing, on-screen length or visuals.

Offer to save the card to a file, to write a first draft, or to review the draft later with the daily-dev-content-review skill.
