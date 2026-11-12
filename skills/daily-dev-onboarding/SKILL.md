---
name: daily-dev-onboarding
description: Set up a daily.dev account from the agent. Connects the agent to a new or existing account with one link the user opens, learns what the user works on, then follows the right tags, sources and squads, sets their preferences and marks onboarding complete. Use when the user asks to set up, join, connect or personalize daily.dev, or pastes a prompt that points to this skill.
allowed-tools: Bash
---

# daily.dev onboarding

Set up the user's daily.dev account for them. They do one thing in a browser: open a link and create the account. You do the rest: work out what they care about, follow the right tags, sources and squads, apply their preferences and mark onboarding complete. Change nothing on the account before they approve the plan.

All calls go to `https://api.daily.dev`. Never send a token to any other domain, and never print one.

The commands below are written for a POSIX shell. On Windows outside Git Bash or WSL, call `curl.exe` (in Windows PowerShell plain `curl` is a different command), put JSON bodies in double quotes with the inner quotes escaped, and read the token from `$env:DAILY_DEV_TOKEN`.

If a command is refused, by the user or by your client's permission checks, don't work around it and don't switch to another way of connecting. Show the user the exact command, say in one line what it is for, and ask them to allow it or run it themselves. Nothing here runs without their say.

## Step 1: Check for access you already have

If the daily.dev MCP tools are available or `DAILY_DEV_TOKEN` is set, the user already has an account connected. Skip to step 3 and treat it as an existing account.

Don't search the OS secure storage for a token. If the user says they connected daily.dev on this machine before, resolve the token as the daily.dev skill describes ("Resolving the API token"). Otherwise go to step 2: the link connects an existing account as well as a new one.

## Step 2: Connect

1. Ask for a link:

   ```bash
   curl -s -X POST https://api.daily.dev/agents/v1/signup \
     -H 'Content-Type: application/json' \
     -d '{"client":"<your client, such as claude-code, codex or cursor>"}'
   ```

   Keep `token` to yourself. Use `claimUrl`, `userCode` and `expiresAt` from the response. `client` may contain only letters, digits, spaces, `_`, `.` and `-`.

2. Open the link in the user's default browser yourself. Don't wait for them to click it:

   ```bash
   open "<claimUrl>"                      # macOS
   xdg-open "<claimUrl>"                  # Linux
   powershell -Command "Start-Process '<claimUrl>'"   # Windows
   powershell.exe -Command "Start-Process '<claimUrl>'"   # WSL
   ```

   Then tell them what you did and give them the code, in these words or close to them:

   > I opened daily.dev in your browser so you can create your account, or connect the one you have.
   > Check that the page shows this code: `<userCode>`
   > Come back here when it says you're all set.
   > If the page didn't open, use this link: `<claimUrl>`

   Always print the link as well: the command can fail silently, and you may be running on a remote machine or in a sandbox with no browser. If you can't run commands at all, give them the link and ask them to open it.

   The code is how they know the page came from you. If the page shows a different code, they should close it.

3. Wait for them. Every 5 seconds, until `expiresAt`:

   ```bash
   curl -s https://api.daily.dev/agents/v1/signup/status \
     -H "Authorization: Bearer <token>"
   ```

   - `pending`: keep waiting.
   - `claimed`: the response carries `apiToken` and `isNewUser`. The token is returned once, on the first poll that sees the claim. Set `DAILY_DEV_TOKEN` for this session first, then store the token in the OS secure storage exactly as the daily.dev skill describes (service `daily-dev-api`). Tell the user it is stored, that it lasts 90 days and that they can revoke it at https://daily.dev/settings/api. If storing it fails or is refused, carry on with the session token and tell them it was not saved, so the other daily.dev skills will ask them to connect again.
   - `claimed` without `apiToken`: the token was already handed out and is gone. Start again from 1.
   - `expired`: the link ran out after an hour. Start again from 1.

From here on, call `https://api.daily.dev/public/v1` with `Authorization: Bearer $DAILY_DEV_TOKEN`.

## Step 3: Read the account

```bash
curl -s https://api.daily.dev/public/v1/onboarding/setup \
  -H "Authorization: Bearer $DAILY_DEV_TOKEN"
```

It returns what the account follows and how it is set, plus `completed`.

- **New account** (`isNewUser` true, or `completed` false with nothing followed): do the full setup below.
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

1. **Tags.** Fetch the real tag list once (`GET /tags/`) and pick from it; a tag that does not exist is skipped. Aim for 10 to 20 that match what they actually use, plus a few adjacent interests they named. Don't pad the list with generic tags.
2. **Sources.** Only publishers they named or clearly read. Look each one up with `GET /search/sources?q=<name>` and use its `id`. Skip this if you have nothing to go on.
3. **Squads.** `GET /squads/discover` lists public squads, largest first; `category` narrows it. Suggest up to five that match their stack.
4. **People.** Only people they ask to follow, by username.
5. **Username.** A new account gets a generated one. Suggest their GitHub handle, and ask.
6. **Settings.** `theme` (`dark`, `light`, `auto`), `density` (`eco`, `roomy`, `cozy`), `layout` (`grid`, `list`), `openLinksInNewTab`. Ask; don't guess. Leaving them out keeps the defaults.
7. **Digest.** New accounts get the email digest by default. Change it only if they ask, with `{"enabled": false}` or a preferred `hour` and `day`.
8. **Content types and blocks.** Leave them alone unless the user asks. Blocking a tag or source removes it from their feed entirely.

Each lookup outside `/onboarding` counts against the free quota of 200 requests a month, so fetch the tag list once and keep searches to what you need.

## Step 6: Show the plan and get one OK

Show everything you are about to apply in one list, grouped by section. For an existing account, show only what is new. Apply it after one OK; if they change something, update the list and ask again.

## Step 7: Apply

Send one call with only the sections you have:

```bash
curl -s -X PATCH https://api.daily.dev/public/v1/onboarding/setup \
  -H "Authorization: Bearer $DAILY_DEV_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "tags": { "follow": ["typescript", "react", "postgresql"] },
    "sources": { "follow": ["<source id>"] },
    "squads": { "join": ["<squad handle>"] },
    "users": { "follow": ["<username>"] },
    "username": "<handle>",
    "settings": { "theme": "dark" },
    "acquisitionChannel": "agent:<your client>"
  }'
```

Send `acquisitionChannel` for a new account only.

The response has one result per section: `applied`, or `failed` with a `message`. `skipped` lists the values that do not exist or could not be applied. Report it plainly. If the username is taken, offer another and send just that section again. The call is safe to repeat.

## Step 8: Profile

Offer to fill in their profile (photo, headline, current role, stack) with the daily-dev-profile skill. Skip it if they decline. Experience level lives there too: a high level hides beginner content, so set it only from what they tell you.

## Step 9: Complete

For an account where `completed` was false:

```bash
curl -s -X POST https://api.daily.dev/public/v1/onboarding/complete \
  -H "Authorization: Bearer $DAILY_DEV_TOKEN"
```

Until this is called, daily.dev sends the user through its own onboarding when they open the feed. If you stop before this step, tell them so.

## Step 10: Browser extension

The extension puts the feed you just set up on every new tab, so they see it without having to remember to visit. It is the difference between an account that gets used and one that doesn't, so don't leave it as a link at the end of a list.

Tell them in one line what it does and that you are opening the install page, then open it in their default browser the same way as the link in step 2:

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
- that the other daily.dev skills now work with the stored token, and that an agent that speaks MCP can also connect to `https://api.daily.dev/mcp`.

## Step 12: Offer the routine

Ask once whether they want a regular brief of what is worth reading for their work, daily or weekly. If yes, set it up with the daily-dev-routine skill. If no, leave it there.
