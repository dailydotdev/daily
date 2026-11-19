---
name: daily-dev-growth-routine
description: The daily routine of a daily.dev for Startups company. Sets up a daily scheduled run, then each day reports how the company page and its posts did, how boosts are going and whether a post is due at the cadence the user chose. Use when the user asks for a daily daily.dev report, wants to set up the routine or a content cadence, or when a schedule runs this skill.
argument-hint: "[squad handle] [cadence, such as 2 posts a week]"
allowed-tools: Bash
---

# daily.dev growth routine

Organic reach on daily.dev comes from showing up regularly: posting at a steady cadence, watching what lands and boosting what works. Your job is to be that discipline for the user. Once a day you check the numbers, tell them in a few lines how things are going, and remind them when a post is due.

## Arguments

$ARGUMENTS

The arguments name the company page (squad handle) and the content cadence, such as `acme 2 posts a week`. A scheduled run always passes both.

Use the daily.dev MCP server (`https://api.daily.dev/mcp`) if its tools are available. Otherwise call `https://api.daily.dev/public/v1` with the API token, as the daily.dev skill describes (`DAILY_DEV_TOKEN`, or the token stored in the OS secure storage). The steps name the MCP tools; with the token, call the endpoint the daily.dev skill lists for each (`getBoosts` is `GET /boosts/`, `getSquadsByIdAnalyticsHistory` is `GET /squads/{id}/analytics/history`). If there is neither, or a call returns 401, connect the account with step 2 of the daily-dev-onboarding skill: it gives the user one link and stores a token for you. Adding the MCP server also works (setup: https://docs.daily.dev/mcp-server/), but don't require it.

Find the squad with `getSquads`: the one named in the arguments, or else the company page the user admins or holds a paid seat on (ask if there are several). Check its plan with `getSquadsByIdSubscription`: a page whose `plan` is null is on the free plan.

## Set up the routine

Do this when the user asks to set up the routine, or when the arguments have no cadence and no schedule runs this skill yet.

1. Read the content strategy with `getSquadsByIdContentStrategy` (`GET /squads/{id}/content-strategy`). If there is one, take the cadence and the review period (weekly or monthly) from it and confirm them with the user. If `data` is null on a page with a plan, offer to build one first with the daily-dev-content-strategy skill. Otherwise ask how often they want to publish. Suggest 2 posts a week as a sustainable start; 1 a week is the minimum that keeps a page alive.
2. Ask when they want the daily report, such as 9:00 in their time zone.
3. Create a daily scheduled run with what your client supports, such as a scheduled task, routine or automation. If it has none, offer an entry in the system scheduler (cron, launchd or Task Scheduler) that runs your command-line client headless with the prompt. The scheduled prompt invokes this skill by name with the handle and cadence, for example `/daily-dev-growth-routine acme 2 posts a week`. Never copy these steps into the schedule: the skill gets updated, and a schedule that names it always runs the latest version.
4. Make sure the scheduled run can reach daily.dev: it needs the daily.dev MCP server or an API token, wherever it runs.
5. Show the user exactly what you will schedule and create it after their OK. Then run the daily report once now, so they see what it looks like.

## The daily report

When a schedule runs this skill, nobody may be watching: report, suggest and stop. Never publish, boost or change anything without the user's OK in the conversation.

### Gather

- **Page reach**: `getSquadsByIdAnalyticsHistory`. Compare yesterday with the average of the 7 days before it. A day missing from the list had no recorded impressions.
- **Posts**: `getFeedsSourceBySource` with the squad handle for the latest posts on the page and when each went up. For the user's own posts, `getProfileAnalyticsPosts` (period 30, sorted by createdAt) gives impressions, reads and upvotes.
- **Reach notes**: for the user's posts from the last 7 days, `getPostsByIdAnalytics` returns `limitedReachReason` when we expect limited reach for the post in the wider feed, and why.
- **Boosts**: `getBoosts` for the active ones and any that ended since yesterday, with their reach and spend.
- **Wallet**: `getSquadsByIdSubscription` for the Cores in the page wallet. Free pages have no wallet: leave the line out.
- **Strategy**: `getSquadsByIdContentStrategy` for the themes, mix and review period, when the page has one.
- **Intel**: on Mondays, or when `getSquadsByIdIntel` shows a new week, read it for the changes worth knowing. On a free page, read `getTrends` (the free weekly trends for all of daily.dev) instead.

On the review day the strategy sets (the first workday of the week for a weekly review, of the month for a monthly one), write the strategy review below instead of the daily report.

### Work out what is due

From the cadence, find when the last post went up and when the next one is due. A post is due when the time since the last post reaches the gap the cadence sets (2 posts a week is one every 3 to 4 days).

### Write the report

Keep it under 12 lines, plain words, numbers with their comparison:

```markdown
**daily.dev, <date>**
- Page: <impressions yesterday> impressions (<up or down> vs the 7-day average of <n>)
- Best post: <title>, <impressions> impressions, <upvotes> upvotes
- Boost: <post>, day <n> of <m>, <reach so far>; or none running
- Wallet: <Cores> Cores
- Next post: due <today / in n days / n days overdue> (<cadence>)
- <Only when a post from the last 7 days has one: Reach note: <post>, <reason in plain words>>
- <On Mondays: one or two lines on what changed in the intel>

**Do next:** <one action>
```

Pick one next action, in this order:

1. A post published since the last report has a `limitedReachReason`: say which post and why in one line, link the matching section of https://docs.daily.dev/what-the-feed-recommends/, and suggest running the daily-dev-content-review skill on the next post. Don't suggest deleting and reposting it: that resets nothing.
2. A post is due or overdue: say so and offer to find what to publish with the daily-dev-content-ideas skill. Prefer something the team already wrote or shipped (a blog post, release notes, a video) over writing from scratch. Run the daily-dev-content-review skill on the candidate before publishing. The user writes the post; never write it for them. On a free page, they publish from the composer: give them `https://app.daily.dev/squads/create?sid=<handle>`, adding `&link=<url>` when they are sharing an article. If it expects limited reach, pick another piece of the team's content, or bring the review to the user and let them decide.
3. No boost is running, the wallet holds Cores and a recent post is doing better than the others: suggest boosting it, with the cost and the estimate from `getBoostsEstimate`. The boost targets readers of the post's tags worldwide by default; if the user has said which markets matter to them, offer that country list too, with its own estimate.
4. A post got comments: suggest replying, since answering readers keeps the post alive.
5. Otherwise: nothing to do today, and when the next post is due.

If a number is missing because the page is new, say so in a few words instead of guessing.

## The strategy review

Gather the posts published since the last review with `getProfileAnalyticsPosts` and `getPostsByIdAnalytics`, the page's reach with `getSquadsByIdAnalyticsHistory`, and the latest intel. Read each post's title and content to tell what kind of post it is.

```markdown
**daily.dev review, <period>**
- Posts: <n> published, against <n> planned
- Best post: <title>, <impressions> impressions, <upvotes> upvotes, <comments> comments, and why it likely worked (theme, format, what a reader took away)
- Weakest post: <title>, and the likely reason (nothing a reader could use, reads as AI-written, a crowded topic, timing)
- Mix: <n> posts that teach, <n> takes on news, <n> about the product, against the strategy
- Intel: one line on what changed in the readers' topics

**Keep:** one thing that worked.
**Change:** one suggestion for the next period, such as a theme to drop or a kind of post to try.
```

If the founder agrees to change the strategy, run the daily-dev-content-strategy skill to update it. Never change the saved strategy without their OK in the conversation.
