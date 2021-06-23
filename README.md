<div align="center">
  <img src="/assets/logo.png" alt="Daily Logo" width="150">
  <h1>Welcome to the daily.dev repository</h1>
  <strong>The latest dev news delivered to your new tab 👩🏽‍💻</strong>
  <h6>Made with ❤️ by developers for developers</h6>
</div>
<br>


<p align="center">
  <a href="https://chrome.google.com/webstore/detail/daily-20-source-for-busy/jlmpjdjjbgclbocgajdjefcidcncaied">
    <img src="https://img.shields.io/chrome-web-store/users/jlmpjdjjbgclbocgajdjefcidcncaied?color=EA4335&logo=google-chrome&logoColor=white" alt="Chrome Web Store users">
  </a>

  <a href="https://addons.mozilla.org/en-US/firefox/addon/daily/">
    <img src="https://img.shields.io/amo/users/daily?color=orange&logo=mozilla" alt="Mozilla Web Store users">
  </a>

  <a href="https://twitter.com/dailydotdev">
    <img src="https://img.shields.io/twitter/follow/dailydotdev?color=26A0ED&label=Follow&logo=twitter&logoColor=white&style=flat" alt="Twitter">
  </a>

  <a href="https://storybook.daily.dev">
    <img src="https://img.shields.io/badge/%20-storybook-502ab0?logo=storybook&logoColor=white" alt="Storybook">
  </a>

</p>




## 🗞 daily.dev

> daily.dev is an open-source browser extension that helps developers stay updated with the latest programming news 👩‍💻

It collects and ranks articles from hundreds of unique publications to help developers stay updated with the latest tech news. You can bookmark posts, sync your data across devices, and read later whenever you want. It works offline and has a progressive web app (PWA) for mobile.

At daily.dev we care about:

* 🌟 **Maintenance**: We are working continuously to introduce new features, fix bugs, and improve user experience — 40+ releases on average in a year.
* ♾ **Being relevant**: daily.dev's article feed is constantly updated. Discover brand-new content as soon as it is published.
* 🧵 **Open-source**: daily.dev is completely open-source. We believe in transparency and giving back to the community, so we decided to publish the source code to GitHub. Suggest a feature, report a bug, or even contribute. Everyone is welcome!

<p align="center">
    <img src="/assets/daily-cover-photo.png" alt="daily.dev" width="550">
    <br>
    <a href="https://www.youtube.com/watch?v=Oso6dYXw5lc"><strong>📺 Watch Intro Video → </strong></a>
</p>

## 📌 Get daily.dev

daily.dev is currently available for Google Chrome, Microsoft Edge, and Firefox. There's also a progressive web app (PWA) for mobile devices. Get it now on:

<p align="center">
    <a href="https://r.daily.dev/chrome">
    <img src="https://img.shields.io/badge/%20-Chrome-red?logo=google-chrome&logoColor=white" alt="Download for Chrome" />
    </a>
    <a href="https://microsoftedge.microsoft.com/addons/detail/dailydev-news-for-busy/cbdhgldgiancdheindpekpcbkccpjaeb">
    <img src="https://img.shields.io/badge/%20-Edge-blue?logo=microsoft-edge&logoColor=white" alt="Download for Edge" />
    </a>
    <a href="https://addons.mozilla.org/en-US/firefox/addon/daily/">
    <img src="https://img.shields.io/badge/%20-Firefox-orange?logo=mozilla&logoColor=white" alt="Download for Firefox" />
    </a>
    <a href="http://go.daily.dev/">
    <img src="https://img.shields.io/badge/%20-Mobile-502ab0" alt="Download for Mobile" />
    </a>
</p>

## 📯 Philosophy

We, as developers, spend a lot of time looking for valuable articles and blog posts. We believe that searching for content isn't a thing developers should do anymore. It's hard to catch up with all the latest happenings — coz it's spread on so many blogs and consumes tons of time.

That's why built daily.dev, to help you:

* 👨‍💻 Stay up-to-date
* ⏳Save time
* 📰 Discover articles in one click

## 🌲 daily.dev Projects

daily.dev might look simple on the surface but actually, it is powered by a complex and robust system of different applications. It contains several services, some are big, others are micro and easy to maintain. Below is the list of different projects that we maintain under daily.dev.

### 🙌 Community & Docs

*  [daily](https://github.com/dailydotdev/daily) - This is the repository you are currently at. It serves as a central place for all the projects. It contains documentation, community ideas, suggestions, and whatnot.


### 🎨 Frontend

* [apps](https://github.com/dailydotdev/apps) - Monorepo with all the frontend related projects since daily.dev 3.0. This includes both the extension and the webapp.

### 🏗 Backend

* [daily-api](https://github.com/dailydotdev/daily-api) - A monolith API service, being slowly split apart to different services. It manages content-related data such as posts, feeds, tags, etc.
* [daily-gateway](https://github.com/dailydotdev/daily-gateway) - API gateway which receives all traffic and forwards it to the relevant services after authenticating and authorizing the request.
* [daily-monetization](https://github.com/dailydotdev/daily-monetization) - Serving ads from different providers including CodeFund, BuySellAds and self-hosted campaigns.
* [daily-scraper](https://github.com/dailydotdev/daily-scraper) - Scraping webpages for relevant information.
* [daily-functions](https://github.com/dailydotdev/daily-functions) - Monorepo with Cloud Functions which mostly take care of ingesting new content but also web push and others.



## 🏛 Architecture

<p align="center">
    <img src="/assets/architecture/overview.svg" alt="Daily architecture" width="700">
</p>


## 🗂 Tech Stack

Below is a list of technologies we use at daily.dev.

*  🎨 **Frontend:** Preact
* 🌳 **Services:** Node.js & Golang
* ☁️ **Cloud:** Google Cloud Platform Pub/Sub | SQL | Serverless
* ♾ **CI/CD:** CircleCI
* 🎩 **Deployment:** Pulumi
* 🎛 **Data Feed:** Superfeedr
* 📨 **Email Service:** SendGrid
* 🚨 **Push Notifications:** OneSignal


## 🚀 Running daily.dev Locally

Let's setup daily.dev locally. First you need to setup the services required to run the daily.dev applications, then you can run the application you want. Follow up the setups below to quickly get started.

## ⚙️ Setting Up Daily Services

### → STEP #0

* Go through the [projects description](#-daily-projects) and [the architecture](#-architecture) to familiarize yourself with the system and its components.
* Make sure docker-compose is installed on your machine. Take a look at the [official guide](https://docs.docker.com/compose/install/) for installation. After installation, run the following command in your terminal for a double check.

```sh
docker-compose -v
# docker-compose version 1.29.2, build 5becea4c     // Expected result
```

### → STEP #1

Clone the [apps](https://github.com/dailydotdev/apps) repo.

### → STEP #2

> Daily services are fully dockerized and publicly available on a Google Cloud Registry (GCR) repository. We are going to use them!

The first step is to **pull and run the docker images**, thanks to docker-compose network and environment variables are preconfigured and ready-to-go.

Navigate to the cloned repository and make sure Docker is running on your machine. After that run the following command to run all daily services:

```sh
docker-compose pull && docker-compose up
```

The command will take a while depending upon your internet speed.

### → STEP #3

Now we need to apply the migrations on our databases so they will have the latest schema:

```sh
docker exec apps_daily-api_1 node ./node_modules/typeorm/cli.js migration:run

# ... // Expected result
# Migration PostToc1623847855158 has been executed successfully.
# query: COMMIT

docker exec apps_daily-gateway_1 yarn run db:migrate:latest

# Using environment: development   // Expected result
# Batch 1 run: 23 migrations
# Done in 1.57s.
```

### → STEP #4

The last step is to populate your database using the seed data. All you need to do is, run the following command in your terminal:

```sh
docker exec apps_daily-api_1 node bin/import.js

# importing Source              // Expected result
# importing Post
# importing Keyword
# importing PostKeyword
# done
```


That's it! 🥂

Now you have all the required services running. Each project's repo explains what services are needed and how to get started with them.

> Note that currently, not all services are ready (or needed) for local environment so Daily Redirector and Daily Monetization services are not available for you.
>
> It means that if you click on an article you will get error 404 and that you will not see ads on your local environment.

## 🎨 Setting Up Daily Apps

Now, let's quickly set up daily.dev apps.

### → STEP #1

Run the following commands in your terminal to bootstrap.

Yes, we use `lerna` for this purpose.

```sh
npm i -g lerna
lerna bootstrap

# ...     // Expected result
# lerna success Bootstrapped 5 packages
```
### → STEP #2

Go to `packages/webapp` in the `apps` folder. Run the following command to start the webapp in development mode. It will watch for all the file changes.

```sh
npm run dev
```
### → STEP #3

Go to `packages/extension` in the `apps` folder. Run the following command to start the extension in development mode. It will watch for all the file changes and generate the output in `dist` folder.

```sh
npm run dev:chrome
```
### → STEP #4

By now, you will have unpacked daily.dev extension in your `dist` folder. Follow the steps listed below to load the extension.

1. Go to `chrome://extensions` path in your Chrome browser.
2. Enable `Developer mode` from the top right section.
3. Click on `Load Unpack` button and select your `dist` folder.

That's it! Your extension has been loaded in your browser. Happy hacking! ✌️

## 🙌 Want to Contribute?

We are open to all kinds of contributions. If you want to:
* 🤔 Suggest a feature
* 🐛 Report an issue
* 📖 Improve documentation
* 👨‍💻 Contribute to the code

You are more than welcome. Before contributing, kindly check our [guidelines](https://github.com/dailydotdev/.github/blob/master/CONTRIBUTING.md).

## 🤔 FAQs

We have compiled a list of FAQs. You can find it [here](https://daily.dev/support).

## 🎩 Core Team

Meet the core team of daily.dev:
* [@idoshamun](https://twitter.com/idoshamun)
* [@nimrodkramer](https://twitter.com/NimrodKramer)
* [@tsahimatsliah](https://twitter.com/TsahiMatsliah)

Feel free to reach us out and say hi 👋.


## 💬 What Do You Think of daily.dev?

<div align="left">
    <p><a href="https://twitter.com/dailydotdev/"><img alt="Twitter @dailydotdev" align="center" src="https://img.shields.io/badge/twitter-%231DA1F2.svg?&style=for-the-badge&logo=twitter&logoColor=white" /></a>&nbsp; Tweet us @dailydotdev to share your thoughts and stay up-to-date. </p>
    <p><a href="https://facebook.com/dailydotdev/"><img alt="Facebook @dailydotdev" align="center" src="https://img.shields.io/badge/facebook-%231877F2.svg?&style=for-the-badge&logo=facebook&logoColor=white" /></a>&nbsp; Like us to know what's happening at daily.dev and share your reviews.</p>
    <p><a href="https://www.producthunt.com/posts/daily-dev"><img alt="daily.dev at ProductHunt" align="center" src="https://img.shields.io/badge/producthunt-%23DA552F.svg?&style=for-the-badge&logo=product-hunt&logoColor=white" /></a>&nbsp; Checkout our ProductHunt page and let us know what you think.</p>
    <p><a href="https://daily.dev"><img alt="daily.dev Website" align="center" src="https://img.shields.io/badge/Daily Website-%233693F3.svg?&style=for-the-badge&logo=icloud&logoColor=white" /></a>&nbsp; Visit our home for all useful links.</p>
    <p><a href="https://chrome.google.com/webstore/detail/daily-20-source-for-busy/jlmpjdjjbgclbocgajdjefcidcncaied"><img alt="daily.dev at ChomeStore" align="center" src="https://img.shields.io/badge/Chrome Web Store-%234285F4.svg?&style=for-the-badge&logo=google-chrome&logoColor=white" /></a>&nbsp; See our Chrome Store page to grab the extension or share your feedback.</p>
      <p><a href="https://microsoftedge.microsoft.com/addons/detail/dailydev-news-for-busy/cbdhgldgiancdheindpekpcbkccpjaeb"><img alt="daily.dev at EdgeAddons" align="center" src="https://img.shields.io/badge/Edge Addons-%230078D7.svg?&style=for-the-badge&logo=microsoft-edge&logoColor=white" /></a>&nbsp; Check us out on Microsoft Edge Addons and let us know your thoughts.</p>
    <p><a href="https://addons.mozilla.org/en-US/firefox/addon/daily/"><img alt="daily.dev at Firefox" align="center" src="https://img.shields.io/badge/Firefox Addons-%23FF7139.svg?&style=for-the-badge&logo=firefox-browser&logoColor=white" /></a>&nbsp; Check our Firefox Add-on and share your thoughts.</p>
</div>


## 📑 License
Licensed under [AGPL-3.0](https://github.com/dailydotdev/daily/blob/master/LICENSE).
