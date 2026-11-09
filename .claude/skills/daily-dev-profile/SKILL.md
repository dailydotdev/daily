---
name: daily-dev-profile
description: Make the user's daily.dev profile look credible to developers: a real photo, a clear headline, their current role, an About me, links and stack. Reads the profile first, fills what is empty or weak, and saves only after the user approves. Use when the user asks to set up, improve or complete their daily.dev profile, or when a daily.dev for Startups setup asks for it.
allowed-tools: Bash
---

# daily.dev profile

Make the user's daily.dev profile one that developers trust. Their name and photo sit on every post and comment they publish, so a blank profile makes a good post look like spam. Fill what is empty or weak, keep what the user already wrote, and save nothing without their OK.

Use the daily.dev MCP server (`https://api.daily.dev/mcp`). If its tools are not available, ask the user to add `https://api.daily.dev/mcp` as a remote MCP server (setup: https://docs.daily.dev/mcp-server/). With an API token instead, call the same endpoints under `https://api.daily.dev/public/v1` as the daily.dev skill describes.

## Step 1: Read the profile

Call `getProfile` and `getProfileExperiences`, and `getProfileStack`. Note which of the fields below are empty, generic or out of date. A default avatar, an empty headline or no current job are the most important gaps.

## Step 2: Gather what you need

Use what you already know about the user and their work: the project you are in, its README and website, their git identity, and their GitHub, X or LinkedIn pages if you can read them. Ask the user only for what you can't find, in one short list.

Fields, most important first:

1. **Photo** (`image` on `patchProfile`). Their face, never the company logo: the logo belongs on the company page. A good source is their GitHub avatar (`https://github.com/<username>.png`) when it is a real photo. If the photo is a file on their machine, get an upload URL with `postUploads`, send the file with `curl -X PUT -H "Content-Type: image/jpeg" --data-binary @photo.jpg "<uploadUrl>"`, and use the `url` it returns. Best size: square, 400x400 px or larger, with the face centred. It shows as a rounded square, so a non-square photo is cropped to its centre.
2. **Headline** (`bio`). One line under 100 characters: role, company and what they build, in plain words. For example: "Co-founder & CTO at Acme. Building open-source feature flags for backend teams."
3. **Current role** (`postProfileExperiences`, type work). Their title at the company with a start date and no end date. The profile header shows this company. Don't add one that already exists; update it with `putProfileExperiencesById` if the title changed.
4. **Name** (`name`). Their real name. Change it only if it is a handle or empty.
5. **Experience level** (`experienceLevel`). From their years of experience; ask if unclear.
6. **About me** (`readme`, markdown). Three to six short lines in first person: what they build and for whom, their background, and what they write about. No buzzwords, no lists of adjectives.
7. **Links** (`socialLinks`). GitHub, X, LinkedIn, personal site and the company site. This replaces all links, so send the existing ones too.
8. **Cover** (`cover`). A wide image at the top of the profile. The company's cover or a wide image from its site works well. Upload a file the same way as the photo. Best size: 1024x256 px (4:1). It shows as a strip 144 px tall, about 5:1 on desktop and cropped to about 2.3:1 on phones, and the photo covers its bottom-left corner. Use a decorative image with the subject in the middle and no text: words near the edges get cut off. Crop a wider or taller image to 4:1 before uploading.
9. **Tech stack** (`getProfileStackSearch`, then `postProfileStack`). The main languages, frameworks and tools they use, from the project and their GitHub. Five to ten items is enough.
10. **Education** (`postProfileExperiences`, type education). Optional: ask once, skip if they decline.

## Step 3: Show the changes, then save

Show every change in one list, with the current value next to the new one. Never overwrite a field the user filled without asking about that field. Save after one OK from the user, then call `getProfile` to check what was saved.

If an image URL is rejected (400), it could not be fetched or is not an image: ask for another one.

## Step 4: Finish

Give the user their profile link (`permalink` from `getProfile`) and list anything still empty, with one line on why it matters.
