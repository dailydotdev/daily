---
name: statusline
description: Fix or set up the daily.dev headlines in Claude Code. Use when the user sees the daily.dev headline twice, wants the old statusline entry removed after upgrading, asks to enable/disable the daily.dev statusline, or the headlines are not showing after installing the plugin.
---

Since plugin version 0.7.0 the headlines come from a hooks module (`hooks/register.tsx`) that Claude Code 2.1.275 or later loads automatically: a status line entry under the prompt and a band above it, with no `settings.json` edits. Older plugin versions wired the same script into `statusLine` in `~/.claude/settings.json`. This skill cleans up that old entry, and sets it up only as a fallback on Claude Code versions that cannot load the hooks module.

First, find out which case applies:

1. Run `claude --version` and compare with 2.1.275.
2. Read `~/.claude/settings.json` (treat a missing file as `{}`) and look for a `statusLine` key whose `command` references `statusline/statusline.mjs`. That is the legacy daily.dev entry.

## Claude Code 2.1.275 or later

The hooks module shows the headlines on its own.

- If the legacy entry is present, remove the `statusLine` key and tell the user that was why the headline showed twice. If `statusLine` points somewhere else, leave it alone.
- If no headline is showing at all: check that `node` is on PATH, that the plugin is enabled in `/plugin`, and that the user has started a new session since installing. The band can also be hidden for the session with its **Hide** button; a new session brings it back.
- Do not add a `statusLine` entry on these versions.

## Claude Code before 2.1.275

The hooks module does not load here, so wire the script into settings as before.

This plugin's statusline script lives at `${CLAUDE_PLUGIN_ROOT}/statusline/statusline.mjs`. That path is version-pinned (it changes on every plugin update), so DO NOT write it into settings literally. Instead, derive the version-independent parent directory (strip the trailing `/<version>` segment from `${CLAUDE_PLUGIN_ROOT}`) and use a shell glob that always resolves the most recently installed version.

### Enable

1. If a `statusLine` key already exists and is not the daily.dev one, show it to the user and ask before replacing it.
2. Set the `statusLine` key, substituting `<PLUGIN_PARENT_DIR>` with the version-stripped parent of `${CLAUDE_PLUGIN_ROOT}`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node \"$(ls -td \"<PLUGIN_PARENT_DIR>\"/*/ | head -1)statusline/statusline.mjs\"",
    "refreshInterval": 10
  }
}
```

3. Verify it renders by piping an empty JSON object to the resolved command, e.g. `echo '{}' | node "$(ls -td "<PLUGIN_PARENT_DIR>"/*/ | head -1)statusline/statusline.mjs"`. It should print a line starting with `daily.dev`.
4. Tell the user to restart Claude Code (or start a new session) to see it, and mention headlines rotate about once a minute and are clickable in terminals with hyperlink support.

### Disable

Remove the `statusLine` key from `~/.claude/settings.json` if its command references this plugin's statusline script. If it points somewhere else, leave it alone and tell the user.

## Notes

- Requires `node` on PATH.
- Anonymous impression telemetry can be disabled with `DAILY_DEV_TELEMETRY=0` in the environment; mention this if the user asks about privacy (full details in the plugin README).
