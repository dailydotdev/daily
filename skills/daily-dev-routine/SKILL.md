---
name: daily-dev-routine
description: A recurring brief of what is worth reading on daily.dev for what the user is working on. Sets up a scheduled run, then each run picks a few posts from the user's feed, says why each matters to their work and links to it. Use when the user asks for a daily or weekly daily.dev brief, wants to set up the routine, or when a schedule runs this skill.
argument-hint: "[daily or weekly] [optional focus, such as rust and postgres]"
allowed-tools: Bash
---

# daily.dev routine

Developers fall behind because nobody has time to scan everything. Your job is to do the scanning: on a schedule, read the user's daily.dev feed, pick the few posts that matter for what they are working on right now, and tell them why in a line each.

## Arguments

$ARGUMENTS

The arguments give the cadence (`daily` or `weekly`) and an optional focus. A scheduled run always passes the cadence.

Use the daily.dev MCP server (`https://api.daily.dev/mcp`) if its tools are available. Otherwise call `https://api.daily.dev/public/v1` with the API token, as the daily.dev skill describes. If there is no token, or a call returns 401, the token is missing or has expired: tell the user to run the daily-dev-onboarding skill to reconnect, and stop.

## Set up the routine

Do this when the user asks to set up the routine, or when no schedule runs this skill yet.

1. Ask how often they want the brief. Suggest weekday mornings; weekly is fine for someone who only wants the highlights.
2. Ask what time, in their time zone.
3. Create a scheduled run with what your client supports, such as a scheduled task, routine or automation. If it has none, offer an entry in the system scheduler (cron, launchd or Task Scheduler) that runs your command-line client headless with the prompt. The scheduled prompt invokes this skill by name with the cadence, for example `/daily-dev-routine daily`. Never copy these steps into the schedule: the skill gets updated, and a schedule that names it always runs the latest version.
4. Make sure the scheduled run can reach daily.dev: it needs the daily.dev MCP server or the stored API token, wherever it runs.
5. Show the user exactly what you will schedule and create it after their OK. Then run the brief once now, so they see what it looks like.

## The brief

When a schedule runs this skill, nobody may be watching: report and stop. Never follow, block, bookmark or change anything without the user's OK in the conversation.

### Gather

Keep it to one feed call per run. A free account has 200 API requests every 30 days, and a daily brief should use about 30 of them. If a call returns 429, the quota is used up: say so in one line, with when it resets, and stop.

- **Feed**: `GET /feeds/foryou?limit=30` (`getFeedsForyou`). Each post has `title`, `summary`, `tags`, `source`, `readTime`, `numUpvotes` and `commentsPermalink`.
- **What they are working on**: the project you are running in (its manifests, recent commits and open branches), the focus in the arguments, and anything they told you before. Don't send any of it to daily.dev; use it only to choose.

For a weekly brief, one call is still enough: the feed already favors what did well recently.

### Choose

Pick three to five posts, in this order of preference:

1. Directly about something they are using or changing right now: a dependency they just upgraded, a tool in their stack, a problem their recent commits touch.
2. A notable release, security issue or deprecation in their stack.
3. Something adjacent that many developers found worth reading (high upvotes), if the first two leave room.

Skip anything they have clearly seen in an earlier brief in this conversation. If nothing in the feed is relevant, say so in one line instead of padding the list.

### Write

Keep it under 12 lines, plain words:

```markdown
**daily.dev, <date>**
1. [<title>](<commentsPermalink>) — <why it matters to what they are doing, one line> (<readTime> min)
2. ...

**Worth doing:** <one suggestion, or nothing>
```

Link each post to its daily.dev page (`commentsPermalink`), not to the original article.

"Worth doing" is one suggestion at most, and only when it is real: a post they should read before a change they are making, or a tag that keeps showing up and that they don't follow yet. To act on it, ask first; follow tags with `PATCH /onboarding/setup`, which counts as one request.

## When the user gives feedback

If they say the brief is off, ask what to see more or less of, then offer to adjust the account with one `PATCH /onboarding/setup` call: `tags.follow` and `sources.follow` for more of something, `tags.block` and `sources.block` for something they never want. Blocking removes it from their feed entirely, so say that before you do it. Change nothing until they agree.
