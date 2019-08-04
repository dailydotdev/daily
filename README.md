<div align="center">
  <img src="/assets/logo.png" alt="Daily Logo" width="150">
  <h1>Daily</h1>
  <strong>Curated dev news delivered to your new tab 👩🏽‍💻</strong>
  <h6>Made by developers for developers ❤️</h6>
</div>
<br>
<p align="center">
  <a href="#contributors"><img src="https://img.shields.io/badge/all_contributors-5-orange.svg?style=flat-square" alt="All Contributors"></a>
  <a href="https://chrome.google.com/webstore/detail/daily-20-source-for-busy/jlmpjdjjbgclbocgajdjefcidcncaied">
    <img src="https://img.shields.io/chrome-web-store/users/jlmpjdjjbgclbocgajdjefcidcncaied.svg?style=flat" alt="Chrome Web Store users">
  </a>
  <a href="https://chrome.google.com/webstore/detail/daily-20-source-for-busy/jlmpjdjjbgclbocgajdjefcidcncaied">
    <img src="https://img.shields.io/chrome-web-store/rating/jlmpjdjjbgclbocgajdjefcidcncaied.svg?style=flat" alt="Chrome Web Store rating">
  </a>
  <a href="https://stackshare.io/daily/daily">
    <img src="http://img.shields.io/badge/tech-stack-0690fa.svg?style=flat" alt="StackShare">
  </a>
  <a href="https://storybook.dailynow.co">
    <img src="https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg" alt="Storybook">
  </a>
</p>

Hi there 👋! So you probably here because you want to understand deeper what's going on behind the scenes of Daily... This is exactly the place for you so calm down and keep on reading 📖!

## Don't know Daily!?

Daily is a dev news curator delivering relevant updates to your new tab. It gathers and ranks articles from tens of different sources to help you optimize your time and boost your knowledge.


### Check us out:

- [Website](https://www.dailynow.co)
- [Chrome Web Store](https://bit.ly/chromedaily)
- [Firefox Add-ons](https://bit.ly/firefoxdaily)
- [Product Hunt](https://www.producthunt.com/posts/daily-2-0)

## Projects 

Daily might look pretty simple on the surface but actually it is powered by several services, some might be big and legacy and other micro and easy to maintain. We would like to guide you through the different repositories so you can get by the codebase.

### Community & Docs

* [daily](https://github.com/dailynowco/daily) - This is the repository you are currently at and it is actually the repository with overall documentation, community ideas, suggestions and whatnot.

### Frontend

* [daily-apps](https://github.com/dailynowco/daily-apps) - Monorepo with all the frontend related projects since Daily 2.0, our Vue components library, API encapsulation library, obviously Daily extension and others.
* [daily-go](https://github.com/dailynowco/daily-go) - Our Daily Go webapp, with a story like interface (called toilet mode) and user's bookmarks.

### Backend

* [daily-api](https://github.com/dailynowco/daily-api) - Started as a monolith API service and slowly has been split apart to different services. Currently the target domain is to manage content related data such as posts, feeds, tags, etc.
* [daily-redirector](https://github.com/dailynowco/daily-redirector) - Service for redirecting visitors from Daily custom links to the original link.
* [daily-gateway](https://github.com/dailynowco/daily-gateway) - API gateway which receives all traffic and forward it to the relevant services after authenticating and authorizing the request.
* [daily-monetization](https://github.com/dailynowco/daily-monetization) - Serving ads from different providers including CodeFund, BuySellAds and self-hosted campaigns.
* [daily-functions](https://github.com/dailynowco/daily-functions) - Monorepo with Cloud Functions which mostly take care of ingesting new content but also web push and others.


## Want to help?

Looking to contribute to Daily? Awesome! We are glad to hear it, check out our [guidelines](https://github.com/dailynowco/daily/blob/master/CONTRIBUTING.md).


## Architecture

<p align="center">
    <img src="/assets/arch.png" alt="Daily architecture" width="700">
</p>


## Tech Stack

We use Vue for web application development and Netlify for hosting them.
Backend wise most of the services and cloud functions are written in Node and some minor services are written in Go (wanted to learn Go, perfect chance 😜). Everything is Docker-based and deployed to the almighty Kubernetes cluster with Helm charts.
MySQL is the database which powers everything and Google Pub/Sub is used for inter-service communitcation.
Lastly, we use CircleCI for running the CI/CD pipelines.


## Setting up local environment

Before proceeding to setting up your own Daily environment, make sure to go over the [projects description](#projects) and [the architecture](#architecture) to make sure you understand the system and its components.

Daily services are fully dockerized and publicy available on a `gcr.io` repository. This means that all you need is docker on your system and we are good to go. If you don't have docker already you can [check out this guide](https://docs.docker.com/install/).

Follow the instructions to install everything:
1. Create a network so the services can communicate with each other.<br/>
`docker network create daily`
1. Start a MySQL instance (contains the relevant databases already), it exposes port `3306` so you can use any MySQL client to connect and inspect the data. The root user is `root` and password is `12345`.<br/>
`docker run -d --name daily-mysql -p 3306:3306 --network daily gcr.io/daily-ops/mysql`
1. Run [Daily Gateway](https://github.com/dailynowco/daily-gateway) service, it exposes port `4000`. Obviously, the OAuth credentials are for our staging environment and don't provide any real Daily user information.<br/>
`docker run -d --name daily-gateway -p 4000:4000 --network daily -e MYSQL_USER=root -e MYSQL_PASSWORD=12345 -e MYSQL_DATABASE=gateway -e MYSQL_HOST=daily-mysql -e COOKIES_DOMAIN=localhost -e COOKIES_KEY=topsecret -e GITHUB_CLIENT_ID=7b514cee17923d0acedc -e GITHUB_CLIENT_SECRET=064d875c7b370d271be839242538c87ab8bb6f92 -e GOOGLE_CLIENT_ID=750405661228-fmeg35uuaopbcnc4c6m6g51755s355bm.apps.googleusercontent.com -e GOOGLE_CLIENT_SECRET=MMv_wZAS6Etoleg-sn__BlDC -e URL_PREFIX=http://localhost:4000 -e JWT_SECRET='|r+.2!!!.Qf_-|63*%.D' -e JWT_AUDIENCE='Daily Staging' -e JWT_ISSUER='Daily API Staging' -e CORS_ORIGIN='http://,chrome-extension://,moz-extension://' -e PORT=4000 -e API_URL=http://daily-api:5000 -e API_SECRET=topsecret gcr.io/daily-ops/daily-gateway`
1. Run [Daily API](https://github.com/dailynowco/daily-api) service, it exposes port `5000`.<br/>
`docker run -d --name daily-api -p 5000:5000 --network daily -e DEFAULT_IMAGE_URL=https://storage.cloud.google.com/devkit-assets/placeholder.jpg -e DEFAULT_IMAGE_PLACEHOLDER='data:image/jpg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QCYRXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAIdpAAQAAAABAAAATgAAAAAAAABIAAAAAQAAAEgAAAABAAWQAAAHAAAABDAyMTCgAAAHAAAABDAxMDCgAQADAAAAAQABAACgAgAEAAAAAQAAAAqgAwAEAAAAAQAAAAYAAAAA/+ECz2h0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiB4bWxuczpleGlmPSdodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyc+CiAgPGV4aWY6WFJlc29sdXRpb24+NzI8L2V4aWY6WFJlc29sdXRpb24+CiAgPGV4aWY6WVJlc29sdXRpb24+NzI8L2V4aWY6WVJlc29sdXRpb24+CiAgPGV4aWY6UmVzb2x1dGlvblVuaXQ+SW5jaDwvZXhpZjpSZXNvbHV0aW9uVW5pdD4KICA8ZXhpZjpFeGlmVmVyc2lvbj5FeGlmIFZlcnNpb24gMi4xPC9leGlmOkV4aWZWZXJzaW9uPgogIDxleGlmOkZsYXNoUGl4VmVyc2lvbj5GbGFzaFBpeCBWZXJzaW9uIDEuMDwvZXhpZjpGbGFzaFBpeFZlcnNpb24+CiAgPGV4aWY6Q29sb3JTcGFjZT5zUkdCPC9leGlmOkNvbG9yU3BhY2U+CiAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjEwMjQ8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogIDxleGlmOlBpeGVsWURpbWVuc2lvbj42MDA8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogPC9yZGY6RGVzY3JpcHRpb24+Cgo8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSdyJz8+Cv/bAEMAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/bAEMBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/CABEIAAYACgMBEQACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAEBv/EABYBAQEBAAAAAAAAAAAAAAAAAAgDBP/aAAwDAQACEAMQAAABuW6Vha4f/8QAFxAAAwEAAAAAAAAAAAAAAAAAAAIDAf/aAAgBAQABBQJHjkz/xAAcEQEBAQACAwEAAAAAAAAAAAACAwEREgAEEyH/2gAIAQMBAT8BFIGNA/W+llu9LbahyZ08fkhxiZeFFNaOm0Ckkp0j5//EABwRAAMBAAIDAAAAAAAAAAAAAAECAwQAExESIf/aAAgBAgEBPwGsdL6JUnsMc6Admdc8nNnD+ft6ezJJplldJoKdgjRLoqWjp5//xAAdEAACAQQDAAAAAAAAAAAAAAABAgMREiEjABMi/9oACAEBAAY/AirQXybKSdrrQNHanhcExSbAThqlHUi0rz//xAAXEAEBAQEAAAAAAAAAAAAAAAABERAx/9oACAEBAAE/IRRs0xVxiFhHGC//2gAMAwEAAgADAAAAEGP/xAAWEQEBAQAAAAAAAAAAAAAAAAABEBH/2gAIAQMBAT8QNAUSVjBHQudd/8QAFhEBAQEAAAAAAAAAAAAAAAAAARAh/9oACAECAQE/EEkCGWNRJa8Ww//EABcQAQADAAAAAAAAAAAAAAAAAAEQESH/2gAIAQEAAT8QpeTsA40GpPBD/9k=' -e DEFAULT_IMAGE_RATIO=1.7 -e MYSQL_USER=root -e MYSQL_PASSWORD=12345 -e MYSQL_DATABASE=devkit -e MYSQL_HOST=daily-mysql -e URL_PREFIX=http://localhost:4000 -e PORT=5000 -e GATEWAY_URL=http://daily-gateway:4000 -e GATEWAY_SECRET=topsecret gcr.io/daily-ops/daily-api`
1. Populate database with seed data.<br/>
`docker exec daily-api npx knex seed:run`

That's it! :clap: Now you have a running environment waiting for you to try it out. Each project explains what services are needed and how to dive into the actual code and contribute.

\* Please note that currently not all services are ready (or needed) for local environment so Daily Redirector and Daily Monetization services are not available for you. Don't worry it just means that if you click on an article you will get error 404 and that you will not see ads on your local environment.

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
    <td align="center"><a href="https://github.com/isthatcentered"><img src="https://avatars0.githubusercontent.com/u/10481124?v=4" width="100px;" alt="Edouard"/><br /><sub><b>Edouard</b></sub></a><br /><a href="#ideas-isthatcentered" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
</table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
