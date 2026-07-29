---
name: statusline
description: Set up (or remove) the daily.dev headlines statusline in Claude Code. Use when the user wants daily.dev headlines in their statusline, asks to enable/disable the daily.dev statusline, or the statusline is not showing after installing the plugin.
---

Wire the daily.dev headlines statusline into the user's Claude Code settings. Claude Code does not activate a statusline from plugin settings automatically, so this skill writes the `statusLine` config for the user.

This plugin's statusline script lives at `${CLAUDE_PLUGIN_ROOT}/statusline/statusline.mjs`. That path is version-pinned (it changes on every plugin update), so DO NOT write it into settings literally. Instead, derive the version-independent parent directory (strip the trailing `/<version>` segment from `${CLAUDE_PLUGIN_ROOT}`) and use a shell glob that always resolves the most recently installed version.

## Enable

1. Read `~/.claude/settings.json` (create it as `{}` if missing).
2. If a `statusLine` key already exists and is not the daily.dev one, show it to the user and ask before replacing it.
3. Set the `statusLine` key, substituting `<PLUGIN_PARENT_DIR>` with the version-stripped parent of `${CLAUDE_PLUGIN_ROOT}`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node \"$(ls -td \"<PLUGIN_PARENT_DIR>\"/*/ | head -1)statusline/statusline.mjs\"",
    "refreshInterval": 10
  }
}
```

4. Verify it renders by piping an empty JSON object to the resolved command, e.g. `echo '{}' | node "$(ls -td "<PLUGIN_PARENT_DIR>"/*/ | head -1)statusline/statusline.mjs"`. It should print a line starting with `daily.dev`.
5. Tell the user to restart Claude Code (or start a new session) to see it, and mention headlines rotate about once a minute and are clickable in terminals with hyperlink support.

## Disable

Remove the `statusLine` key from `~/.claude/settings.json` if its command references this plugin's statusline script. If it points somewhere else, leave it alone and tell the user.

## Notes

- Requires `node` on PATH.
- Anonymous impression telemetry can be disabled with `DAILY_DEV_TELEMETRY=0` in the environment; mention this if the user asks about privacy (full details in the plugin README).
