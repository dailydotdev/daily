---
name: daily-dev-onboarding
description: Set up a daily.dev account from the agent. Connects the agent to a new or existing account with one link the user opens, learns what the user works on, then follows the right tags, sources and squads, sets their preferences and marks onboarding complete. Use when the user asks to set up, join, connect or personalize daily.dev, or pastes a prompt that points to this skill.
allowed-tools: Bash
---

# daily.dev onboarding

Set up the user's daily.dev account for them. They do one thing in a browser: sign in, or create the account. You do the rest: work out what they care about, follow the right tags, sources and squads, apply their preferences and mark onboarding complete. Change nothing on the account before they approve the plan.

Everything goes through the daily.dev MCP tools this plugin provides. There is no token to handle: never ask the user for one, and never look for one in their environment, files or OS secure storage.

If a tool call or command is refused, by the user or by your client's permission checks, don't work around it and don't switch to another way of connecting. Say in one line what it is for, and ask them to allow it or do it themselves. Nothing here runs without their say.

## Step 1: Check for access you already have

If the daily.dev tools are available and `getOnboardingSetup` answers, the account is connected. Skip to step 3.

## Step 2: Connect

If the daily.dev tools are missing, or only an authentication tool is listed for the `daily-dev` server, the user needs to sign in. Tell them, in these words or close to them:

> Run `/mcp`, pick `daily-dev` and choose to authenticate. daily.dev opens in your browser: create your account there, or sign in to the one you have, and approve access. Come back here when it says you're done.

If your client lets you start the sign-in yourself through an authentication tool, do that instead and tell them a daily.dev page is opening.

Once they are back, call `getOnboardingSetup`. If it still fails, ask them to try `/mcp` again.

## Step 3: Read the account

Call `getOnboardingSetup`. It returns what the account follows and how it is set, plus `completed`.

- **New account** (`completed` false with nothing followed): do the full setup below.
- **Existing account**: tune it up. Suggest additions only. Don't touch the username, settings or digest unless the user asks, and never unfollow or block anything they chose.

## Step 4: Learn what the user works on

Ask once before you look, in one question: may you look at their projects and GitHub to work out what to follow? If they say no, ask them for their main languages, frameworks and interests instead.

With their OK, use what you can reach:

- the project you are in: manifests (`package.json`, `go.mod`, `Cargo.toml`, `pyproject.toml`, `Gemfile`), frameworks, infrastructure files;
- their GitHub, if you have access: main languages, starred repositories, topics;
- anything they already told you in this conversation.

Only the names of technologies and topics leave their machine. Never send code, file contents, private repository names or company details to daily.dev.

## Step 5: Draft the setup

Most important first. Followed tags decide almost everything a new account sees, so spend your effort there.

1. **Tags.** Fetch the real tag list once (`getTags`) and pick from it; a tag that does not exist is skipped. Aim for 10 to 20 that match what they actually use, plus a few adjacent interests they named. Don't pad the list with generic tags.
2. **Sources.** Only publishers they named or clearly read. Look each one up with `getSearchSources` and use its `id`. Skip this if you have nothing to go on.
3. **Squads.** `getSquadsDiscover` lists public squads, largest first; `category` narrows it. Suggest up to five that match their stack.
4. **People.** Only people they ask to follow, by username.
5. **Username.** A new account gets a generated one. Suggest their GitHub handle, and ask.
6. **Settings.** `theme` (`dark`, `light`, `auto`), `density` (`eco`, `roomy`, `cozy`), `layout` (`grid`, `list`), `openLinksInNewTab`. Ask; don't guess. Leaving them out keeps the defaults.
7. **Digest.** New accounts get the email digest by default. Change it only if they ask, with `{"enabled": false}` or a preferred `hour` and `day`.
8. **Content types and blocks.** Leave them alone unless the user asks. Blocking a tag or source removes it from their feed entirely.

Each lookup other than the onboarding tools counts against the free quota of 200 requests a month, so fetch the tag list once and keep searches to what you need.

## Step 6: Show the plan and get one OK

Show everything you are about to apply in one list, grouped by section. For an existing account, show only what is new. Apply it after one OK; if they change something, update the list and ask again.

## Step 7: Apply

Send one `patchOnboardingSetup` call with only the sections you have:

```json
{
  "tags": { "follow": ["typescript", "react", "postgresql"] },
  "sources": { "follow": ["<source id>"] },
  "squads": { "join": ["<squad handle>"] },
  "users": { "follow": ["<username>"] },
  "username": "<handle>",
  "settings": { "theme": "dark" },
  "acquisitionChannel": "agent:<your client>"
}
```

Send `acquisitionChannel` for a new account only.

The response has one result per section: `applied`, or `failed` with a `message`. `skipped` lists the values that do not exist or could not be applied. Report it plainly. If the username is taken, offer another and send just that section again. The call is safe to repeat.

## Step 8: Profile

Offer to fill in their profile (photo, headline, current role, stack) with the daily-dev-profile skill. Skip it if they decline. Experience level lives there too: a high level hides beginner content, so set it only from what they tell you.

## Step 9: Complete

For an account where `completed` was false, call `postOnboardingComplete`.

Until this is called, daily.dev sends the user through its own onboarding when they open the feed. If you stop before this step, tell them so.

## Step 10: Browser extension

The extension puts the feed you just set up on every new tab, so they see it without having to remember to visit. It is the difference between an account that gets used and one that doesn't, so don't leave it as a link at the end of a list.

Tell them in one line what it does and that you are opening the install page, then open it in their default browser:

```bash
open "https://r.daily.dev/extension"                      # macOS
xdg-open "https://r.daily.dev/extension"                  # Linux
powershell -Command "Start-Process 'https://r.daily.dev/extension'"   # Windows
powershell.exe -Command "Start-Process 'https://r.daily.dev/extension'"   # WSL
```

The page picks the right store for their browser. Installing is their click and their choice: you can't install it for them, and don't ask twice. Print the link as well in case the page didn't open. Skip this step if they told you they already have the extension.

## Step 11: Hand over

Tell the user, in a few lines:

- what you set up, in numbers (tags, sources, squads);
- their feed: https://daily.dev
- that the other daily.dev skills now work through the same sign-in, and that they can disconnect it from Settings > API.

## Step 12: Offer the routine

Ask once whether they want a regular brief of what is worth reading for their work, daily or weekly. If yes, set it up with the daily-dev-routine skill. If no, leave it there.
