---
name: daily-dev-company-page
description: Set up a free daily.dev company page for the user's product or company from the agent. Connects or creates their daily.dev account with one link, builds the page from their repo and website, polishes their profile, suggests a first post from what they already shipped, opens the composer so they can publish it, and checks that the free first-post boost started. Use when the user asks to create or set up a company page on daily.dev, or pastes a prompt that points to this skill.
allowed-tools: Bash
---

# daily.dev company page

Set up the user's free company page on daily.dev. A company page is where their team publishes to developers. Its first post that passes our checks gets a $100 boost on us, so the goal of this session is a live page and a first post the user is proud of.

The user answers a few questions: whether you may look at their project and site, whether the page looks right, and which post idea to go with. You do the rest. Change nothing on their account before they approve it.

You never write the post, or a draft of it, even when asked. Developers here skip posts that read as AI-written, and the value of a post is what only its author knows. You suggest what to post and why; the user writes it and publishes it from daily.dev.

All calls go to `https://api.daily.dev`. Never send a token to any other domain, and never print one. The commands are written for a POSIX shell; on Windows follow the notes in the daily-dev-onboarding skill.

If a command is refused, by the user or by your client's permission checks, don't work around it. Show the user the exact command, say in one line what it is for, and ask them to allow it or run it themselves.

The other skills this one uses (daily-dev-onboarding, daily-dev-profile, daily-dev-content-ideas, daily-dev-content-review, daily-dev-growth-routine) are at https://github.com/dailydotdev/daily/tree/master/skills if they are not installed.

## Step 1: Connect

Use whichever access you already have:

1. The daily.dev MCP tools are available: use them. Each call below names the tool and its REST endpoint.
2. Otherwise, a token is in `DAILY_DEV_TOKEN` or the OS secure storage, as the daily.dev skill describes: call `https://api.daily.dev/public/v1` with `Authorization: Bearer $DAILY_DEV_TOKEN`.
3. Neither: connect with step 2 of the daily-dev-onboarding skill (one link, a code to check, a stored token), with one change: ask for the link with `intent` set to `company`, so the page tells the user why they are signing up:

   ```bash
   curl -s -X POST https://api.daily.dev/agents/v1/signup \
     -H 'Content-Type: application/json' \
     -d '{"client":"<your client, such as claude-code, codex or cursor>","intent":"company"}'
   ```

Don't ask the user to add the MCP server: the token works for every step here.

## Step 2: Finish the account quietly (new accounts only)

Skip this step for an account that existed before this session (`isNewUser` false, or you connected with access you already had).

A new account is sent through daily.dev's own onboarding the first time the user opens the site, which would land in the middle of this session. Finish it without asking: once you know the company's stack (step 3), follow 5 to 10 tags that match it and mark onboarding complete.

```bash
curl -s -X PATCH https://api.daily.dev/public/v1/onboarding/setup \
  -H "Authorization: Bearer $DAILY_DEV_TOKEN" -H 'Content-Type: application/json' \
  -d '{"tags":{"follow":["<tag>","<tag>"]},"acquisitionChannel":"agent:<your client>"}'

curl -s -X POST https://api.daily.dev/public/v1/onboarding/complete \
  -H "Authorization: Bearer $DAILY_DEV_TOKEN"
```

With MCP: `patchOnboardingSetup` and `postOnboardingComplete`. Pick the tags from `getTags` (`GET /tags/`). Tell the user in one line what you followed; the daily-dev-onboarding skill can tune their feed later.

## Step 3: Learn the company

Ask once, in one question, whether you may look at their project and website to fill in the page. If they say no, ask for the company name, website and a one-line description.

With their OK, read what you can reach:

- the project you are in: README, package manifests, docs;
- the website: page title, meta description, `og:title`, `og:description`, `og:image`, the logo and favicon;
- anything they told you in this conversation.

Only the company's name, description and public image URLs leave their machine. Never send code, file contents or private repository names to daily.dev.

## Step 4: Check for an existing page

Call `getSquads` (`GET /squads/`). If the user already admins a company page (`flags.company` on `getSquadsById`, `GET /squads/{id}`), ask whether to use it instead of creating another. Skip to step 7 if they do. Each account can create up to 3 company pages.

## Step 5: Draft the page and get one OK

Show the page in one block:

- **Name**: the company or product name.
- **Handle**: used in the page URL, `daily.dev/squads/<handle>`. Letters, numbers and underscores, lower case. Offer one and a fallback.
- **Description**: one or two sentences, up to 250 characters, on what they build and for which developers. Plain words, no slogans. This one is page setup, so you write it.
- **Website**: the company's site, linked from the page.
- **Category**: a slug such as `devtools` or `ai`.
- **Logo**: a square image, 512x512 px (1:1), the logomark on a solid background. Prefer the site's logo or the GitHub organization avatar over a favicon.
- **Cover**: a wide banner, 1500x300 px (5:1), with no text near the edges and the bottom-left corner clear for the logo. The daily.dev skill's Images section has the details. Crop a wider or taller image to 5:1 before uploading.

Create it after their OK. If they change something, update the block and ask again.

## Step 6: Create the page

```bash
curl -s -X POST https://api.daily.dev/public/v1/squads/company-pages \
  -H "Authorization: Bearer $DAILY_DEV_TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"<name>","handle":"<handle>","description":"<description>","categoryId":"<category>","image":"<logo url>"}'
```

With MCP: `postSquadsCompanyPages`. Then set the cover with `patchSquadsById` (`PATCH /squads/{id}`, body `{"headerImage":"<url>"}`). Then set the website with `putSquadsByIdLinks` (`PUT /squads/{id}/links`, body `{"website":"<url>","links":[]}`). A free page can show the website but no other links. If this returns 403, skip the website and carry on.

- `409`: the handle is taken. Use the fallback and tell the user.
- `400` on an image: it could not be fetched or is not an image. For a file on their machine, get an upload URL with `postUploads` (`POST /uploads/`), send the file with `curl -X PUT -H "Content-Type: image/png" --data-binary @logo.png "<uploadUrl>"`, and use the `url` it returns.
- `400` on the category: the response lists the valid slugs. Pick one.

## Step 7: The founder's profile

Their name and photo sit on every post they publish, and a blank profile makes a good post look like spam. Offer to fill in their profile with the daily-dev-profile skill: a real photo, a headline, their role at the company, a short bio. Skip it if they decline.

## Step 8: Suggest the first post

Run the daily-dev-content-ideas skill for the new page, with its handle. A new page is on the free plan, so the skill reads the free weekly trends (`getTrends`, `GET /trends/`) instead of weekly intel.

Point it at what the team already shipped or published: a blog post, a changelog entry, a launch post, a talk, a hard problem they solved. Two kinds of first post work:

- **A written post** about something they built, fixed or learned, in their own words. This gets the most reach and discussion. Recommend it.
- **Sharing an article they already published**, with a line or two of their own on top. This is the fastest.

The skill hands over idea cards: the idea, the work it comes from, the angle, title options, format and length. It does not write the post. Ask which idea they want to go with.

## Step 9: Open the composer

Free pages publish from daily.dev, not through the API. Open the composer on the page in the user's default browser:

```bash
open "https://app.daily.dev/squads/create?sid=<handle>"                      # macOS
xdg-open "https://app.daily.dev/squads/create?sid=<handle>"                  # Linux
powershell -Command "Start-Process 'https://app.daily.dev/squads/create?sid=<handle>'"   # Windows
```

To share an existing article, add `&link=<url-encoded article URL>`: it fills in the link only.

Then tell them, in these words or close to them:

> I opened the composer on your page. Write the post in your own words, using the idea above, and click Post when it's ready.
> A few minutes after it goes live, we start a $100 boost on it, on us. Tell me when you've posted and I'll check that it started.
> If the page didn't open: <url>

If they paste their text here before posting, offer the daily-dev-content-review skill. It checks whether the post is likely to get limited reach and why, and asks questions instead of rewriting. A post that passes the checks is the one the free boost starts on.

## Step 10: Check the boost

When they say they've posted, check every 30 seconds for up to 10 minutes with `getBoosts` (`GET /boosts/`). The free boost starts a minute or two after the post goes live, once we have checked it.

- **It started**: tell them in one line, with how long it runs and its reach so far, from the boost.
- **Nothing after 10 minutes**: find the post with `getFeedsSourceBySource` (`GET /feeds/source/<handle>`) and read `getPostsByIdAnalytics` (`GET /posts/{id}/analytics`). If `limitedReachReason` is set, the post didn't pass our checks, and the $100 boost waits for their next post that does, within 30 days of creating the page. Say so plainly and offer to suggest the next post. Don't suggest deleting and reposting: that resets nothing.

## Step 11: Open the page and show what's next

Open `https://app.daily.dev/squads/<handle>` in their browser the same way as in step 9, so they see their page with the post on it. Then send this once, in these words or close to them, and don't repeat it if they move on:

> Your company page is live: <page url>. I opened it for you.
> Your first post is being boosted to developers in the US, Europe and other top markets for the next <boost length>, on us. You'll see the reach on the page as it comes in.
>
> On the free plan, your posts reach the main feed only once the page has 10 members and 10 posts, and the page stays off Google and AI answers. Each post also goes through the composer, like this one.
>
> Starter ($49/month) puts every post in the feed right away, gets the page and posts found on Google and AI answers, lets me publish the posts you write and boost them for you, and adds weekly intel on your own topics, plus boost credits every month.
> See plans: https://app.daily.dev/squads/for-startups?squad=<page id>&plan=starter

Take the boost length from the boost itself. If the boost didn't start, replace the second line with "Your $100 boost starts with your next post that passes our checks." Leave out the plan pitch for a page that already has a plan (`getSquadsByIdSubscription`, `GET /squads/{id}/subscription`, `plan` not null).

## Step 12: Offer the routine

Ask once whether they want a short daily check-in on the page: how posts did, and a reminder when the next post is due. If yes, set it up with the daily-dev-growth-routine skill. If no, leave it there.
