<div align="center">
  <img src="/assets/logo.png" alt="Daily Logo" width="150">
  <h1>Daily</h1>
  <strong>Curated dev news delivered to your new tab 👩🏽‍💻</strong>
  <h6>Made by developers for developers</h6>
</div>
<br>


<p align="center">
  <a href="https://chrome.google.com/webstore/detail/daily-20-source-for-busy/jlmpjdjjbgclbocgajdjefcidcncaied">
    <img src="https://img.shields.io/chrome-web-store/users/jlmpjdjjbgclbocgajdjefcidcncaied?color=EA4335&logo=google-chrome&logoColor=white" alt="Chrome Web Store users">
  </a>

  <a href="https://addons.mozilla.org/en-US/firefox/addon/daily/">
    <img src="https://img.shields.io/amo/users/daily?color=orange&logo=mozilla" alt="Mozilla Web Store users">
  </a>

  <a href="https://chrome.google.com/webstore/detail/daily-20-source-for-busy/jlmpjdjjbgclbocgajdjefcidcncaied">
    <img src="https://img.shields.io/chrome-web-store/rating/jlmpjdjjbgclbocgajdjefcidcncaied?color=91cf25&label=rating" alt="Chrome Web Store rating">
  </a>

  <a href="https://twitter.com/dailydotdev">
    <img src="https://img.shields.io/twitter/follow/dailydotdev?color=26A0ED&label=Follow&logo=twitter&logoColor=white&style=flat" alt="Twitter">
  </a>

  <a href="https://storybook.daily.dev">
    <img src="https://img.shields.io/badge/%20-storybook-502ab0?logo=storybook&logoColor=white" alt="Storybook">
  </a>

</p>




## 🗞 Daily

> Daily is an open source browser extension which provides curated dev news to your new tab.

It gathers and ranks articles from tens of unique sources to help developers stay updated with the most relevant developer news. You can bookmark items, sync your data across devices, and read when you want. It works offline as well and has a progressive web app (PWA) for mobile.

Daily is:

* 🌟 **Well-maintained**: We are working continuously to introduce new features, fix bugs, and improve user experience — 40+ releases on average in a year.
* ♾ **Constantly Updated**: Daily's article feed is constantly updated. As soon as new articles get published, they start appearing in Daily.
* 🧵 **Open Source**: Daily is completely open source. You can see the code to learn how it works, and contribute to help it improve.

<p align="center">
    <img src="/assets/daily-header.jpg" alt="Daily" width="850">
    <br>
    <a href="https://www.youtube.com/watch?v=Oso6dYXw5lc"><strong>📺 Watch Intro Video → </strong></a>
</p>

## 📌 Get Daily

Daily is currently available for Google Chrome, and Firefox. There's also a progressive web app (PWA) for mobile devices. Download for:

<p align="center">
    <a href="https://bit.ly/chromedaily">
    <img src="https://img.shields.io/badge/%20-Chrome-red?logo=google-chrome&logoColor=white" alt="Download for Chrome" />
    </a>
    <a href="https://bit.ly/firefoxdaily">
    <img src="https://img.shields.io/badge/%20-Firefox-orange?logo=mozilla&logoColor=white" alt="Download for Firefox" />
    </a>
    <a href="http://go.daily.dev/">
    <img src="https://img.shields.io/badge/%20-Mobile-502ab0" alt="Download for Mobile" />
    </a>
</p>

## 📯 Philosophy

We, as developers, spend a lot of time looking for valuable articles and blog posts. It's hard to catch up with all the latest happenings — coz it's frustrating and consumes a ton of time.

That's why built Daily to help you:

* 👨‍💻 Stay up-to-date
* ⏳Save time
* 📰 Read articles at one click

## 🌲 Daily Projects

Daily might look simple on the surface but actually it is powered by a complex and robust system of different applications. It contains several services, some are big, others are micro and easy to maintain. Below is the list of different projects that we maintain under Daily.

### 🙌 Community & Docs

*  [daily](https://github.com/dailydotdev/daily) - This is the repository you are currently at. It serves as a central place for all the projects. It contains documentation, community ideas, suggestions, and whatnot.


### 🎨 Frontend

* [daily-apps](https://github.com/dailydotdev/daily-apps) - Monorepo with all the frontend related projects since Daily 2.0 — Vue components library, API encapsulation library, Daily extension and everything related to frontend.

* [daily-go](https://github.com/dailydotdev/daily-go) - Progressive web app (PWA) called **Daily Go** for mobile devices.  It comes with a story like interface, called **toilet mode**. You can also manage your bookmarks on it.

### 🏗 Backend

* [daily-api](https://github.com/dailydotdev/daily-api) - A monolith API service, being slowly split apart to different services. It manages content related data such as posts, feeds, tags, etc.
* [daily-redirector](https://github.com/dailydotdev/daily-redirector) - Service for redirecting visitors from Daily custom links to the original link.
* [daily-gateway](https://github.com/dailydotdev/daily-gateway) - API gateway which receives all traffic and forward it to the relevant services after authenticating and authorizing the request.
* [daily-monetization](https://github.com/dailydotdev/daily-monetization) - Serving ads from different providers including CodeFund, BuySellAds and self-hosted campaigns.
* [daily-functions](https://github.com/dailydotdev/daily-functions) - Monorepo with Cloud Functions which mostly take care of ingesting new content but also web push and others.



## 🏛 Architecture

<p align="center">
    <img src="/assets/arch.png" alt="Daily architecture" width="700">
</p>


## 🗂 Tech Stack

Below is a list of technologies we use at Daily.

*  🎨 **Frontend:** Vue.js
* 🌳 **Services:** Node.js & Golang
* ☁️ **Cloud:** Google Cloud Platform Pub/Sub | SQL | Serverless
* ♾ **CI/CD:** CircleCI
* 🎩 **Deployment:** Kubernetes with Helm charts
* 🔍 **Search:** Algolia
* 🎛 **Data Feed:** Superfeedr
* 📨 **Email Service:** SendGrid
* 🚨 **Push Notifications:** OneSignal


## 🚀 Running Daily Locally

Let's setup Daily locally. First you need to setup the services required to run the Daily applications, then you can run the application you want. Follow up the setups below to quickly get started.

## ⚙️ Setting Up Daily Services

### → STEP #0

* Go through the [projects description](#-daily-projects) and [the architecture](#-architecture) to familiarize yourself with the system and its components.
* Make sure docker-compose is installed on your machine. Take a look at the [official guide](https://docs.docker.com/compose/install/) for installation. After installation, run the following command in your terminal for a double check.

```sh
docker-compose -v
# docker-compose version 1.25.5, build 8a1c60f6     // Expected result
```

### → STEP #1

Clone the [daily-apps](https://github.com/dailydotdev/daily-apps) repo

### → STEP #2

> Daily services are fully dockerized and publicly available on a Google Cloud Registry (GCR) repository. We are going to use them!

The first step is to **pull and run the docker images**, thanks to docker-compose network and environment variables are preconfigured and ready to-go.

Run the following command to accomplish this task:

```sh
docker-compose pull && docker-compose up
```

The command will take a while depending upon your internet speed. See the GIF to follow up.
![Setting up Daily Services](/assets/setting&#32;up/docker-compose-up.gif)

### → STEP #3

Last step is to populate your database using the seed data. All you need to do is, run the following command in your terminal:

```sh
docker exec daily-apps_daily-api_1 node bin/import.js

# importing Source              // Expected result
# importing SourceDisplay
# importing Post
# importing PostTag
# importing TagCount
# importing Notification
# done
```


That's it! 🥂

Now you have all the required services running. Each project's repo explains what services are needed and how to get started with them.

> Note that currently not all services are ready (or needed) for local environment so Daily Redirector and Daily Monetization services are not available for you.
>
> It means that if you click on an article you will get error 404 and that you will not see ads on your local environment.

## 🎨 Setting Up Daily Apps

Now, let's quickly setup Daily chrome extension to elaborate how you can setup each Daily application.

### → STEP #1

Run the following commands in your terminal to bootstrap.

Yes, we use `lerna` for this purpose.

```sh
npx lerna bootstrap

# npx: installed 698 in 89.279s     // Expected result
# ...
# lerna success Bootstrapped 4 packages

npx lerna run build

# Done in 29.19s.     // Expected result
# lerna success run Ran npm script 'build' in 4 packages in 48.5s:
# lerna success - @daily/components
# lerna success - @daily/extension
# lerna success - @daily/moderator
# lerna success - @daily/services
```
### → STEP #2

Go to `packages/extension` in the `daily-apps` folder. Run the following command to start it in development mode. It will watch for all the file changes and generate the output in `dist` folder.

```sh
yarn serve

# ...
# DONE  Build complete. Watching for changes...      // Expected result
```
### → STEP #3

By now, you will have unpacked Daily extension in your `dist` folder. Follow the steps listed below to load the extension.

1. Go to `chrome://extensions` path in your Chrome browser.
2. Enable `Developer mode` from the top right section.
3. Click on `Load Unpack` button and select your `dist` folder.

That's it! Your extension has been loaded in your browser. Happy hacking! ✌️

![Daily in development mode](/assets/setting&#32;up&#32;/daily&#32;in&#32;development&#32;mode.png)


For Firefox, you can follow [this guide](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/). Similarly, you can run all the other Daily apps. Each app has a readme file in its repo to help you get started.

## 🙌 Want to Contribute?

We are open to all kind of contributions. If you want to:
* 🤔 Share an idea
* 🐛 Report an issue
* 📖 Improve documentation
* 👨‍💻 Contribute to the code

You are more than welcome. Before contributing, kindly check our [guidelines](https://github.com/dailydotdev/daily/blob/master/CONTRIBUTING.md).

## 🤔 FAQs

We have compiled a list of FAQs. You can find it [here](https://github.com/dailydotdev/daily/blob/master/FAQs.md).

## 🎩 Core Team

Meet the core team of Daily.
* [@idoshamun](https://twitter.com/idoshamun)
* [@tsahimatsliah](https://twitter.com/TsahiMatsliah)

Feel free to reach us out and say hi 👋.


## 💬 What Do You Think of Daily?

<div align="left">
    <p><a href="https://twitter.com/dailydotdev/"><img alt="Twitter @dailydotdev" align="center" src="https://img.shields.io/badge/%20-Twitter-26A0ED" /></a>&nbsp; Tweet us @dailydotdev to share your thoughts and stay up-to-date. </p>
    <p><a href="https://facebook.com/dailydotdev/"><img alt="Facebook @dailydotdev" align="center" src="https://img.shields.io/badge/%20-Facebook-4267B2" /></a>&nbsp; Like us to know what's happening at Daily and share your reviews.</p>
    <p><a href="https://www.producthunt.com/posts/daily-2-0"><img alt="Daily at ProductHunt" align="center" src="https://img.shields.io/badge/%20-ProdcutHunt-CC4C28" /></a>&nbsp; Checkout our ProductHunt page and let's know what you think.</p>
    <p><a href="https://daily.dev"><img alt="Daily Website" align="center" src="https://img.shields.io/badge/%20-Daily Website-9A9B9D" /></a>&nbsp; Visit our home for all useful links.</p>
    <p><a href="https://chrome.google.com/webstore/detail/daily-20-source-for-busy/jlmpjdjjbgclbocgajdjefcidcncaied"><img alt="Daily at ChomeStore" align="center" src="https://img.shields.io/badge/%20-Chrome Store-Red" /></a>&nbsp; See our Chrome Store page to grab the extension or share your feedback.</p>
    <p><a href="https://addons.mozilla.org/en-US/firefox/addon/daily/"><img alt="Daily at Firefox" align="center" src="https://img.shields.io/badge/%20-Mozilla Addon-Orange" /></a>&nbsp; Check our Firefox Add-on and share your thoughts.</p>
</div>



## 📑 License
Licensed under [AGPL-3.0](https://github.com/dailydotdev/daily/blob/master/LICENSE).
