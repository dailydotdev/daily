<div align="center">
  <img src="assets/Logo - Black (1).jpg" alt="daily.dev Logo" width="320">
  <h1>Welcome to the daily.dev repository</h1>
  <h3><strong>The professional network for developers</strong></h3>
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

</p>

<p align="center">
  <a href="https://gitpod.io/#https://github.com/dailydotdev/apps/">
    <img src="https://gitpod.io/button/open-in-gitpod.svg" alt="Open in Gitpod">
  </a>
</p>


## 💜 About daily.dev

> daily.dev is a professional network for developers to learn, collaborate, and grow together
 👩‍💻

With daily.dev you can discover a wide variety of professional knowledge, create groups where you can collaborate with other developers you appreciate, and discuss the latest trends in the developer ecosystem. It works offline and is available both as a browser extension and as a Progressive Web App (PWA). 

<p align="center">
    <img src="/assets/cover.png" alt="daily.dev cover" width="550">
    <br>
    <a href="https://youtu.be/igZCEr3HwCg"><strong>👀 Watch it in action → </strong></a>
</p>

## 📌 Get daily.dev

daily.dev is currently available for Google Chrome, Microsoft Edge, and Mozilla Firefox. There's also a PWA for mobile devices. 

Get it now on:

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

We recognize that developers today have the greatest power as a professional group to drive change and affect lives of billions. There are many platforms that provide developers with tools that serve to their success, or the goals of their workplace, but daily.dev is by-design for developers themselves. 

We, as developers, know how challenging it is to grow professionally with so much going on, and that's why we built daily.dev - to make it easy for us to navigate abundance of content and discover all the knowledge they need with zero effort.

You can use daily.dev to:

* 👨‍💻 Learn and stay up-to-date
* 🙌 Interact based on the latest trends in our ecosystem
* 🚀 Collaborate with other developers you know and appreciate

## 🌲 daily.dev projects

daily.dev might look simple on the surface but actually, it is powered by a complex and robust system of different applications. It contains several services, some are big, others are micro and easy to maintain. Below is the list of different projects that we maintain under daily.dev.

### 🙌 Community & Docs

*  [daily](https://github.com/dailydotdev/daily) - This is the repository you are currently at. It serves as a central place for all the projects. It contains documentation, community ideas, suggestions, and whatnot.

*  [docs](https://github.com/dailydotdev/docs) - This is the repository for official product documentation of daily.dev.


### 🎨 Frontend

* [apps](https://github.com/dailydotdev/apps) - Monorepo with all the frontend related projects since daily.dev 3.0. This includes both the extension and the webapp.

### 🎈 Others

* [action-devcard](https://github.com/dailydotdev/action-devcard) - GitHub Actions for adding daily DevCard to GitHub profile. Read [the guide](https://daily.dev/blog/adding-the-daily-devcard-to-your-github-profile) to set it up.

## 🚀 Running daily.dev locally

Let's setup daily.dev locally. First, you need to setup the services required to run the daily.dev applications, then you can run the application you want. Follow up the setups below to quickly get started.

## ⚙️ Setting Up Daily Services

You can go the easy way by using [Gitpod](https://gitpod.io/#https://github.com/dailydotdev/apps/) or follow the instructions below.

### → STEP #0

* Make sure docker-compose is installed on your machine. Take a look at the [official guide](https://docs.docker.com/compose/install/) for installation. After installation, run the following command in your terminal for a double check.

```sh
docker compose version
# Docker Compose version v2.10.0 // Expected result
```

### → STEP #1

Clone the [apps](https://github.com/dailydotdev/apps) repo.

### → STEP #2

> daily.dev services are fully dockerized and publicly available on a Google Cloud Registry (GCR) repository. We are going to use them!

The first step is to **pull and run the docker images**. Thanks to docker-compose, network and environment variables are preconfigured and ready to go.

Navigate to the cloned repository and make sure Docker is running on your machine. After that run the following command to run all daily services:

```sh
docker compose pull && docker compose up
```

The command will take a while depending on your internet speed.

> This might throw an error on MacOS Monterey and MacOS Ventura saying that the port is already in use, this is due to the "AirPlay Receiver" in "Sharing" being on by default in that port, but can be turned off in the System Preferences.



### → STEP #3

Now we need to apply the migrations on our databases so they will have the latest schema:

```sh
docker exec apps-daily-api-1 node ./node_modules/typeorm/cli.js migration:run -d src/data-source.js

# ... // Expected result
# Migration PostToc1623847855158 has been executed successfully.
# query: COMMIT
```

### → STEP #4

The last step is to populate your database using the seed data. All you need to do is, run the following command in your terminal:

```sh
docker exec apps-daily-api-1 node bin/import.js

# importing Source              // Expected result
# importing Post
# importing Keyword
# importing PostKeyword
# done
```


That's it! 🍻

Now, you have all the required services running. Each project's repo explains what services are needed and how to get started with them.

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

## 🙌 Want to contribute?

We are open to all kinds of contributions. If you want to:
* 🤔 Suggest a feature
* 🐛 Report an issue
* 📖 Improve documentation
* 👨‍💻 Contribute to the code

You are more than welcome. Before contributing, kindly check our [guidelines](https://github.com/dailydotdev/.github/blob/master/CONTRIBUTING.md).

## 🧳 Careers

We are always looking for talent. You can find all open positions [here](https://daily.dev/careers)


## 💬 What do you think of daily.dev?

<div align="left">
    <p><a href="https://twitter.com/dailydotdev/"><img alt="Twitter @dailydotdev" align="center" src="https://img.shields.io/badge/twitter-%231DA1F2.svg?&style=for-the-badge&logo=twitter&logoColor=white" /></a>&nbsp; Tweet us @dailydotdev to share your thoughts and stay up-to-date. </p>
    <p><a href="https://www.producthunt.com/products/daily-dev"><img alt="daily.dev at ProductHunt" align="center" src="https://img.shields.io/badge/producthunt-%23DA552F.svg?&style=for-the-badge&logo=product-hunt&logoColor=white" /></a>&nbsp; Check out our Product Hunt page.</p>
    <p><a href="https://daily.dev"><img alt="daily.dev Website" align="center" src="https://img.shields.io/badge/Daily Website-%233693F3.svg?&style=for-the-badge&logo=icloud&logoColor=white" /></a>&nbsp; Visit our home for a bunch of useful links.</p>
    <p><a href="https://chrome.google.com/webstore/detail/daily-20-source-for-busy/jlmpjdjjbgclbocgajdjefcidcncaied"><img alt="daily.dev at ChomeStore" align="center" src="https://img.shields.io/badge/Chrome Web Store-%234285F4.svg?&style=for-the-badge&logo=google-chrome&logoColor=white" /></a>&nbsp; See our Chrome Store page to grab the extension or share your feedback.</p>
    <p><a href="https://addons.mozilla.org/en-US/firefox/addon/daily/"><img alt="daily.dev at Firefox" align="center" src="https://img.shields.io/badge/Firefox Addons-%23FF7139.svg?&style=for-the-badge&logo=firefox-browser&logoColor=white" /></a>&nbsp; Check our Firefox Add-on and share your thoughts.</p>
    <p><a href="https://microsoftedge.microsoft.com/addons/detail/dailydev-news-for-busy/cbdhgldgiancdheindpekpcbkccpjaeb"><img alt="daily.dev at EdgeAddons" align="center" src="https://img.shields.io/badge/Edge Addons-%230078D7.svg?&style=for-the-badge&logo=microsoft-edge&logoColor=white" /></a>&nbsp; Check us out on Microsoft Edge Addons and let us know your thoughts.</p>
</div>


## 📑 License
Licensed under [AGPL-3.0](https://github.com/dailydotdev/daily/blob/master/LICENSE).
