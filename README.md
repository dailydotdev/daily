<div align="center">
  <img src="/assets/logo.png" alt="Daily Logo" width="150">
  <h1>Daily</h1>
  <strong>Curated dev news delivered to your new tab 👩🏽‍💻</strong>
  <h6>Made by developers for developers</h6>
</div>
<br>


<p align="center">
  <a href="#contributors"><img src="https://img.shields.io/badge/all_contributors-30-dca82a.svg?style=flat&label=contributors" alt="All Contributors"></a>

  <a href="https://chrome.google.com/webstore/detail/daily-20-source-for-busy/jlmpjdjjbgclbocgajdjefcidcncaied">
    <img src="https://img.shields.io/chrome-web-store/users/jlmpjdjjbgclbocgajdjefcidcncaied?color=EA4335&logo=google-chrome&logoColor=white" alt="Chrome Web Store users">
  </a>

  <a href="https://addons.mozilla.org/en-US/firefox/addon/daily/">
    <img src="https://img.shields.io/amo/users/daily?color=orange&logo=mozilla" alt="Mozilla Web Store users">
  </a>

  <a href="https://chrome.google.com/webstore/detail/daily-20-source-for-busy/jlmpjdjjbgclbocgajdjefcidcncaied">
    <img src="https://img.shields.io/chrome-web-store/rating/jlmpjdjjbgclbocgajdjefcidcncaied?color=91cf25&label=rating" alt="Chrome Web Store rating">
  </a>

  <a href="https://twitter.com/dailynowco">
    <img src="https://img.shields.io/twitter/follow/dailynowco?color=26A0ED&label=Follow&logo=twitter&logoColor=white&style=flat" alt="Twitter">
  </a>

  <a href="https://storybook.dailynow.co">
    <img src="https://img.shields.io/badge/%20-storybook-502ab0?logo=storybook&logoColor=white" alt="Storybook">
  </a>

</p>




## 🧶 Daily

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
    <a href="http://go.dailynow.co/">
    <img src="https://img.shields.io/badge/%20-Mobile-502ab0" alt="Download for Mobile" />
    </a>
</p>

## 📯 Philosophy

We, as developers, spend a lot of time looking for valuable articles and blog posts. It's hard to catch up with all the latest happenings — coz it's frustrating and consumes a ton of time.

That's why built Daily to help you:

* 👨‍💻 Stay up-to-date
* ⏳Save time
* 📱Read anywhere
* 🔖 Read when you want

## 🌲 Daily Projects

Daily might look simple on the surface but actually it is powered by a complex and robust system of different applications. It contains several services, some are big, others are micro and easy to maintain. Below is the list of different projects that we maintain under Daily.

### 🙌 Community & Docs

*  [daily](https://github.com/dailynowco/daily) - This is the repository you are currently at. It serves as a central place for all the projects. It contains documentation, community ideas, suggestions, and whatnot.


### 🎨 Frontend

* [daily-apps](https://github.com/dailynowco/daily-apps) - Monorepo with all the frontend related projects since Daily 2.0 — Vue components library, API encapsulation library, Daily extension and everything related to frontend.

* [daily-go](https://github.com/dailynowco/daily-go) - Progressive web app (PWA) called **Daily Go** for mobile devices.  It comes with a story like interface, called **toilet mode**. You can also manage

### 🏗 Backend

* [daily-api](https://github.com/dailynowco/daily-api) - A monolith API service, being slowly split apart to different services. It manages content related data such as posts, feeds, tags, etc.
* [daily-redirector](https://github.com/dailynowco/daily-redirector) - Service for redirecting visitors from Daily custom links to the original link.
* [daily-gateway](https://github.com/dailynowco/daily-gateway) - API gateway which receives all traffic and forward it to the relevant services after authenticating and authorizing the request.
* [daily-monetization](https://github.com/dailynowco/daily-monetization) - Serving ads from different providers including CodeFund, BuySellAds and self-hosted campaigns.
* [daily-functions](https://github.com/dailynowco/daily-functions) - Monorepo with Cloud Functions which mostly take care of ingesting new content but also web push and others.



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

## ⚙️ Setting Up Daily Service

### → STEP #0

* Go through the [projects description](#-daily-projects) and [the architecture](#-architecture) to familiarize yourself with the system and its components.
* Make sure Docker is installed on your machine. Take a look at the [official guide](https://docs.docker.com/install/#desktop) for installation. After installation, run the following command in your terminal for a double check.

```sh
docker -v
# Docker version 18.09.2, build 6247962     // Expected result
```

### → STEP #1

The first step is to **create a network**, so the different services of Daily can communicate with each other.

> Daily services are fully dockerized and publicly available on a Google Cloud Registry (GCR) repository. We are going to use them to complete the setup.

Run the following command to create a network. It will be instant. We will use the name of the network, `daily` in this case, to connect our services.

```sh
docker network create daily

# 465691b49f0ba36020f0533e174c019382e82c4a827432132d0e045282dfc995     // Expected result
```

### → STEP #2

Second step in this process is to start a MySQL instance with appropriate databases. We are going to use our database service for this purpose.

We will grab the image from GCR, run it, and connect to our network `daily`. It exposes port `3306` so you can use any MySQL client to connect and inspect the data. The root user is `root` and password is `12345`.

Run the following command to accomplish this task:

```sh
docker run -d --name daily-mysql -p 3306:3306 --network daily gcr.io/daily-ops/mysql
```
The command will take a while depending upon your internet speed. See the GIF to follow up.

![Setting up MySQL](/assets/setting&#32;up&#32;/starting&#32;sql&#32;server.gif)

### → STEP #3

The next step is to run the Daily Gateway service and connect it with our `daily` network. This service exposes port `4000 ` when your run it.

To start Daily Gateway service, run the following command in your terminal. Again, depending upon your internet connection, it may take a while.

```sh
docker run -d --name daily-gateway -p 4000:4000 --network daily -e MYSQL_USER=root -e MYSQL_PASSWORD=12345 -e MYSQL_DATABASE=gateway -e MYSQL_HOST=daily-mysql -e COOKIES_DOMAIN=localhost -e COOKIES_KEY=topsecret -e GITHUB_CLIENT_ID=7b514cee17923d0acedc -e GITHUB_CLIENT_SECRET=064d875c7b370d271be839242538c87ab8bb6f92 -e GOOGLE_CLIENT_ID=750405661228-fmeg35uuaopbcnc4c6m6g51755s355bm.apps.googleusercontent.com -e GOOGLE_CLIENT_SECRET=MMv_wZAS6Etoleg-sn__BlDC -e URL_PREFIX=http://localhost:4000 -e JWT_SECRET='|r+.2!!!.Qf_-|63*%.D' -e JWT_AUDIENCE='Daily Staging' -e JWT_ISSUER='Daily API Staging' -e CORS_ORIGIN='http://,chrome-extension://,moz-extension://' -e PORT=4000 -e API_URL=http://daily-api:5000 -e API_SECRET=topsecret gcr.io/daily-ops/daily-gateway
```

> The OAuth credentials are for our staging environment and don't provide any real Daily user information.

Yes, we have a GIF for you showing how it should go ideally.

![Setting up Daily Gateway](/assets/setting&#32;up&#32;/setting&#32;gateway&#32;service.gif)

### → STEP #4

We have MySQL service in running with Daily gateway service. Next, we need to run the Daily API Service and connect it to our network. It exposes port `5000`.

Run the following command your terminal to start it.

```sh
docker run -d --name daily-api -p 5000:5000 --network daily -e DEFAULT_IMAGE_URL=https://storage.cloud.google.com/devkit-assets/placeholder.jpg -e DEFAULT_IMAGE_PLACEHOLDER='data:image/jpg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QCYRXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAIdpAAQAAAABAAAATgAAAAAAAABIAAAAAQAAAEgAAAABAAWQAAAHAAAABDAyMTCgAAAHAAAABDAxMDCgAQADAAAAAQABAACgAgAEAAAAAQAAAAqgAwAEAAAAAQAAAAYAAAAA/+ECz2h0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiB4bWxuczpleGlmPSdodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyc+CiAgPGV4aWY6WFJlc29sdXRpb24+NzI8L2V4aWY6WFJlc29sdXRpb24+CiAgPGV4aWY6WVJlc29sdXRpb24+NzI8L2V4aWY6WVJlc29sdXRpb24+CiAgPGV4aWY6UmVzb2x1dGlvblVuaXQ+SW5jaDwvZXhpZjpSZXNvbHV0aW9uVW5pdD4KICA8ZXhpZjpFeGlmVmVyc2lvbj5FeGlmIFZlcnNpb24gMi4xPC9leGlmOkV4aWZWZXJzaW9uPgogIDxleGlmOkZsYXNoUGl4VmVyc2lvbj5GbGFzaFBpeCBWZXJzaW9uIDEuMDwvZXhpZjpGbGFzaFBpeFZlcnNpb24+CiAgPGV4aWY6Q29sb3JTcGFjZT5zUkdCPC9leGlmOkNvbG9yU3BhY2U+CiAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjEwMjQ8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogIDxleGlmOlBpeGVsWURpbWVuc2lvbj42MDA8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogPC9yZGY6RGVzY3JpcHRpb24+Cgo8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSdyJz8+Cv/bAEMAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/bAEMBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/CABEIAAYACgMBEQACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAEBv/EABYBAQEBAAAAAAAAAAAAAAAAAAgDBP/aAAwDAQACEAMQAAABuW6Vha4f/8QAFxAAAwEAAAAAAAAAAAAAAAAAAAIDAf/aAAgBAQABBQJHjkz/xAAcEQEBAQACAwEAAAAAAAAAAAACAwEREgAEEyH/2gAIAQMBAT8BFIGNA/W+llu9LbahyZ08fkhxiZeFFNaOm0Ckkp0j5//EABwRAAMBAAIDAAAAAAAAAAAAAAECAwQAExESIf/aAAgBAgEBPwGsdL6JUnsMc6Admdc8nNnD+ft6ezJJplldJoKdgjRLoqWjp5//xAAdEAACAQQDAAAAAAAAAAAAAAABAgMREiEjABMi/9oACAEBAAY/AirQXybKSdrrQNHanhcExSbAThqlHUi0rz//xAAXEAEBAQEAAAAAAAAAAAAAAAABERAx/9oACAEBAAE/IRRs0xVxiFhHGC//2gAMAwEAAgADAAAAEGP/xAAWEQEBAQAAAAAAAAAAAAAAAAABEBH/2gAIAQMBAT8QNAUSVjBHQudd/8QAFhEBAQEAAAAAAAAAAAAAAAAAARAh/9oACAECAQE/EEkCGWNRJa8Ww//EABcQAQADAAAAAAAAAAAAAAAAAAEQESH/2gAIAQEAAT8QpeTsA40GpPBD/9k=' -e DEFAULT_IMAGE_RATIO=1.7 -e MYSQL_USER=root -e MYSQL_PASSWORD=12345 -e MYSQL_DATABASE=devkit -e MYSQL_HOST=daily-mysql -e URL_PREFIX=http://localhost:4000 -e PORT=5000 -e GATEWAY_URL=http://daily-gateway:4000 -e GATEWAY_SECRET=topsecret gcr.io/daily-ops/daily-api
```

Ideally, this is how it should work:

![Setting up Daily API](/assets/setting&#32;up&#32;/setting&#32;daily&#32;api&#32;service.gif)

### → STEP #5

Last step is to populate your database using the seed data. We use `knex.js` for this purpose. All you need to do is, run the following command in your terminal:

```sh
docker exec daily-api npx knex seed:run

# npx: installed 160 in 10.92s     // Expected result
# Using environment: development
# Ran 1 seed files
```


That's it! 🥂

Now you have all the required services running. Each project' repo explains what services are needed and how to get started with them.

> Note that currently not all services are ready (or needed) for local environment so Daily Redirector and Daily Monetization services are not available for you.
>
> It means that if you click on an article you will get error 404 and that you will not see ads on your local environment.

## 🎨 Setting Up Daily Apps

Now, let's quickly setup Daily chrome extension to elaborate how you can setup each Daily application.

### → STEP #1

Clone the [daily-apps](https://github.com/dailynowco/daily-apps) repo and run the following commands in your terminal to bootstrap.

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
* 📖 Improve doc
* 👨‍💻 Contribute to the code

You are more than welcome. Before contributing, kindly check our [guidelines](https://github.com/dailynowco/daily/blob/master/CONTRIBUTING.md).


## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table>
  <tr>
    <td align="center"><a href="https://shamun.dev"><img src="https://avatars2.githubusercontent.com/u/1993245?v=4" width="100px;" alt="Ido Shamun"/><br /><sub><b>Ido Shamun</b></sub></a><br /><a href="#ideas-idoshamun" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/dailynowco/daily/commits?author=idoshamun" title="Code">💻</a> <a href="https://github.com/dailynowco/daily/commits?author=idoshamun" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/tsahimatsliah"><img src="https://avatars1.githubusercontent.com/u/41912669?v=4" width="100px;" alt="Tsahi Matsliah"/><br /><sub><b>Tsahi Matsliah</b></sub></a><br /><a href="#ideas-tsahimatsliah" title="Ideas, Planning, & Feedback">🤔</a> <a href="#design-tsahimatsliah" title="Design">🎨</a></td>
    <td align="center"><a href="https://github.com/ram-mar"><img src="https://avatars1.githubusercontent.com/u/23351306?v=4" width="100px;" alt="Ram Subramanian"/><br /><sub><b>Ram Subramanian</b></sub></a><br /><a href="#ideas-ram-mar" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://sigfriedseldeslachts.be"><img src="https://avatars2.githubusercontent.com/u/15171357?v=4" width="100px;" alt="Sigfried Seldeslachts"/><br /><sub><b>Sigfried Seldeslachts</b></sub></a><br /><a href="https://github.com/dailynowco/daily/issues?q=author%3Asigfriedseldeslachts" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/Ornataweaver"><img src="https://avatars1.githubusercontent.com/u/27126408?v=4" width="100px;" alt="Ornataweaver"/><br /><sub><b>Ornataweaver</b></sub></a><br /><a href="#ideas-Ornataweaver" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://twitter.com/ja_alwan"><img src="https://avatars3.githubusercontent.com/u/7735122?v=4" width="100px;" alt="Jundi Alwan"/><br /><sub><b>Jundi Alwan</b></sub></a><br /><a href="#ideas-jundialwan" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="http://www.gianlucamangiapelo.com"><img src="https://avatars2.githubusercontent.com/u/5846287?v=4" width="100px;" alt="Glub0t"/><br /><sub><b>Glub0t</b></sub></a><br /><a href="https://github.com/dailynowco/daily/issues?q=author%3Agian8" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/isthatcentered"><img src="https://avatars0.githubusercontent.com/u/10481124?v=4" width="100px;" alt="Edouard"/><br /><sub><b>Edouard</b></sub></a><br /><a href="#ideas-isthatcentered" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://sevketyalcin.com/"><img src="https://avatars1.githubusercontent.com/u/17293211?v=4" width="100px;" alt="Sevket Yalcin"/><br /><sub><b>Sevket Yalcin</b></sub></a><br /><a href="https://github.com/dailynowco/daily/issues?q=author%3ASevketYALCIN" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/teja463"><img src="https://avatars3.githubusercontent.com/u/4502488?v=4" width="100px;" alt="Brahma Teja Ponnuru"/><br /><sub><b>Brahma Teja Ponnuru</b></sub></a><br /><a href="https://github.com/dailynowco/daily/issues?q=author%3Ateja463" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/Jaydelyn"><img src="https://avatars0.githubusercontent.com/u/24854453?v=4" width="100px;" alt="Mia Durand"/><br /><sub><b>Mia Durand</b></sub></a><br /><a href="#ideas-Jaydelyn" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/vishalksuthar"><img src="https://avatars2.githubusercontent.com/u/43471370?v=4" width="100px;" alt="Vishal Sutnar"/><br /><sub><b>Vishal Sutnar</b></sub></a><br /><a href="#ideas-vishalksuthar" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/dailynowco/daily/issues?q=author%3Avishalksuthar" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/itaiterner"><img src="https://avatars2.githubusercontent.com/u/7588919?v=4" width="100px;" alt="Itai Terner"/><br /><sub><b>Itai Terner</b></sub></a><br /><a href="https://github.com/dailynowco/daily/commits?author=itaiterner" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/jtan743"><img src="https://avatars3.githubusercontent.com/u/7684140?v=4" width="100px;" alt="Justin Tan"/><br /><sub><b>Justin Tan</b></sub></a><br /><a href="https://github.com/dailynowco/daily/commits?author=jtan743" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/Andrei0872"><img src="https://avatars2.githubusercontent.com/u/36248290?v=4" width="100px;" alt="Gatej Andrei"/><br /><sub><b>Gatej Andrei</b></sub></a><br /><a href="https://github.com/dailynowco/daily/commits?author=Andrei0872" title="Code">💻</a></td>
    <td align="center"><a href="https://zd-zero.github.io"><img src="https://avatars0.githubusercontent.com/u/21978370?v=4" width="100px;" alt="Zaerald Denze Lungos"/><br /><sub><b>Zaerald Denze Lungos</b></sub></a><br /><a href="https://github.com/dailynowco/daily/commits?author=zd-zero" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/justnewbee"><img src="https://avatars0.githubusercontent.com/u/2276086?v=4" width="100px;" alt="Jianchun Wang"/><br /><sub><b>Jianchun Wang</b></sub></a><br /><a href="https://github.com/dailynowco/daily/issues?q=author%3Ajustnewbee" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://randalvance.net"><img src="https://avatars0.githubusercontent.com/u/3318476?v=4" width="100px;" alt="Randal Vance Cunanan"/><br /><sub><b>Randal Vance Cunanan</b></sub></a><br /><a href="https://github.com/dailynowco/daily/commits?author=randalvance" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/wtfua92"><img src="https://avatars2.githubusercontent.com/u/14012934?v=4" width="100px;" alt="Andrii Tynok"/><br /><sub><b>Andrii Tynok</b></sub></a><br /><a href="https://github.com/dailynowco/daily/commits?author=wtfua92" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/DarkMannn"><img src="https://avatars1.githubusercontent.com/u/29717360?v=4" width="100px;" alt="Darko"/><br /><sub><b>Darko</b></sub></a><br /><a href="https://github.com/dailynowco/daily/issues?q=author%3ADarkMannn" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://sergiofaya.github.io"><img src="https://avatars1.githubusercontent.com/u/15983833?v=4" width="100px;" alt="Sergio Faya Fernández"/><br /><sub><b>Sergio Faya Fernández</b></sub></a><br /><a href="https://github.com/dailynowco/daily/issues?q=author%3ASergioFaya" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/231293"><img src="https://avatars3.githubusercontent.com/u/27280585?v=4" width="100px;" alt="N D"/><br /><sub><b>N D</b></sub></a><br /><a href="https://github.com/dailynowco/daily/commits?author=231293" title="Documentation">📖</a></td>
    <td align="center"><a href="http://thatrobot.dev"><img src="https://avatars0.githubusercontent.com/u/18013689?v=4" width="100px;" alt="James Kerrane"/><br /><sub><b>James Kerrane</b></sub></a><br /><a href="https://github.com/dailynowco/daily/commits?author=thatrobotdev" title="Documentation">📖</a> <a href="https://github.com/dailynowco/daily/issues?q=author%3Athatrobotdev" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://vatu.co.uk"><img src="https://avatars2.githubusercontent.com/u/4732147?v=4" width="100px;" alt="Darren Pinder"/><br /><sub><b>Darren Pinder</b></sub></a><br /><a href="#ideas-dmpinder" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="http://zektec.com"><img src="https://avatars2.githubusercontent.com/u/13397207?v=4" width="100px;" alt="zvikarp"/><br /><sub><b>zvikarp</b></sub></a><br /><a href="#ideas-zvikarp" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/wowkanwowka"><img src="https://avatars3.githubusercontent.com/u/16153753?v=4" width="100px;" alt="wowkanwowka"/><br /><sub><b>wowkanwowka</b></sub></a><br /><a href="https://github.com/dailynowco/daily/issues?q=author%3Awowkanwowka" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/JohannesBe"><img src="https://avatars3.githubusercontent.com/u/21303311?v=4" width="100px;" alt="JohannesBe"/><br /><sub><b>JohannesBe</b></sub></a><br /><a href="https://github.com/dailynowco/daily/issues?q=author%3AJohannesBe" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://txsadamwest.github.io/portfolio"><img src="https://avatars3.githubusercontent.com/u/16004559?v=4" width="100px;" alt="Adan Huerta"/><br /><sub><b>Adan Huerta</b></sub></a><br /><a href="#ideas-TxsAdamWest" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/paulz1"><img src="https://avatars0.githubusercontent.com/u/6814620?v=4" width="100px;" alt="paulz1"/><br /><sub><b>paulz1</b></sub></a><br /><a href="#ideas-paulz1" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://saqib.dev"><img src="https://avatars1.githubusercontent.com/u/31374163?v=4" width="100px;" alt="Saqib Ameen"/><br /><sub><b>Saqib Ameen</b></sub></a><br /><a href="https://github.com/dailynowco/daily/commits?author=saqibameen" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
