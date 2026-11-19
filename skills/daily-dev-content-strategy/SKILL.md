---
name: daily-dev-content-strategy
description: Build or update the content strategy for a daily.dev for Startups company page. Interviews the founder about their readers and what the team knows, reads the weekly intel, and saves a short strategy that the content ideas, content review and growth routine skills follow. Use when the user asks how to grow on daily.dev, what to post about in general, wants a content plan, or when a review says the strategy needs a change.
allowed-tools: Bash
---

# daily.dev content strategy

Help the founder decide what their company page is for and what it should publish, then save that as their content strategy. You ask, listen and suggest. The founder decides. You never write posts or drafts, even when asked.

## What works on daily.dev

Keep this in mind through the whole conversation, and explain it when it helps:

- Developers come to daily.dev to learn something or keep up. A post does well when a developer who will never buy the product still gets something from it.
- Write about the problem the product solves, not the product: what the team learned building it, numbers from their own setup, news in their part of the ecosystem with their take on it.
- Mention the product where it is part of the story. A launch post now and then is fine. It should not be most of what the page publishes.
- The founder writes the posts. Posts written by AI read as AI-written to developers here and get limited reach.
- Publish every week. One good post a week does more than five in one week and nothing after.

Examples of posts that did well: https://docs.daily.dev/how-to-win-on-daily-dev/

## Step 1: Get the page, the intel and the current strategy

Use the daily.dev MCP server (`https://api.daily.dev/mcp`) if its tools are available. Otherwise call `https://api.daily.dev/public/v1` with the API token, as the daily.dev skill describes (`DAILY_DEV_TOKEN`, or the token stored in the OS secure storage). Each call below names the MCP tool and its REST endpoint: use the one that matches the access you have. If there is neither, or a call returns 401, connect the account with step 2 of the daily-dev-onboarding skill: it gives the user one link and stores a token for you. Adding the MCP server also works (setup: https://docs.daily.dev/mcp-server/), but don't require it.

1. Find the company page with `getSquads` (`GET /squads/`): the squad the user admins or moderates that is a company page, or where they hold a paid seat. If there are several, ask the user which company this is for.
2. Read the current strategy with `getSquadsByIdContentStrategy` (`GET /squads/{id}/content-strategy`). If `data` is there, this is an update: start from it and ask what changed.
3. Read the intel with `getSquadsByIdIntel` (`GET /squads/{id}/intel`). If `data` is null, there is no intel yet: carry on without it and say the themes aren't backed by audience data yet.

If the strategy call returns `403`, check the page's plan with `getSquadsByIdSubscription` (`GET /squads/{id}/subscription`). If `plan` is null, the content strategy is part of daily.dev for Startups: say so in one line with https://daily.dev/startups and stop. If the page has a plan, the strategy is only for its paid seats: tell the user, and suggest asking a squad admin for a seat.

## Step 2: Interview the founder

Ask one question at a time, usually 5 to 7. Change them to fit the answers:

1. Who should read your posts? What do they work on, and how senior are they?
2. What does your team know that most developers don't? Think of problems you solved, things you measured, mistakes you made.
3. What do you already publish anywhere: a blog, docs, changelogs, videos, talks, threads?
4. Who on the team can write, and how much time can they give it each week?
5. Which topics would you be happy to be known for, even if a post never mentions the product?
6. Is there anything you can't talk about?

When an answer describes the product ("we help teams ship faster"), ask about the problem behind it and what the team learned about that problem.

## Step 3: Suggest the strategy

Use the answers and the intel to suggest:

- **Readers:** one or two sentences on who the page writes for.
- **Themes:** 3 or 4 topics the page will be known for. Each comes from what the team knows and maps to topics in the intel. Give the intel signal for each (share of reads, Competition), quoting indexes as they are and never as reader counts.
- **Mix:** roughly what a month looks like, such as 2 posts that teach, 1 with the team's take on news and 1 about the product. Fit it to the time they have.
- **Cadence:** how many posts a week, and who writes them.
- **Sources:** where to find ideas, from step 2 (their blog, changelogs, incidents, support questions).
- **Avoid:** topics they can't cover and kinds of posts that don't work here.
- **Review:** weekly or monthly, whichever the founder prefers.

Show it to the founder and change it until they agree. Then save it with `putSquadsByIdContentStrategy` (`PUT /squads/{id}/content-strategy`) after their OK: the strategy as markdown with the headings above, and `review` set to `weekly` or `monthly`. Saving replaces the stored strategy.

## Step 4: Next steps

Offer to set up the daily-dev-growth-routine skill with the cadence and review you agreed on, and to find the first idea with the daily-dev-content-ideas skill.
