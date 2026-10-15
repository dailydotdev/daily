# daily.dev community plugins for Claude Code

Agent skills built by the community on the daily.dev API and approved on the
[daily.dev plugin marketplace](https://daily.dev/marketplace). Each plugin is
reviewed by the daily.dev team before it lands here.

## Install

```bash
claude plugin marketplace add https://raw.githubusercontent.com/dailydotdev/daily/master/community/.claude-plugin/marketplace.json
claude plugin install <plugin-name>@daily-dev-community
```

Most plugins need a daily.dev API token: create one at https://daily.dev/settings/api.

## How plugins get here

Approved marketplace plugins that ship a SKILL.md are synced automatically:
`community/plugins/<name>/` holds the plugin manifest and the skill, and
`community/.claude-plugin/marketplace.json` lists them. Changes go through a PR.
To change a plugin, update it on daily.dev/marketplace; the approved update is
synced the same way.

These plugins are written by community members, not by daily.dev. Read a
plugin's SKILL.md before installing it.
