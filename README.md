<div align="center">
  <img src="/assets/logo.png" alt="Daily Logo" width="200">
  <h1>Daily</h1>
  <strong>Curated dev news delivered to your new tab 👩🏽‍💻</strong>
  <h6>Made by developers for developers ❤️</h6>
</div>
<br>
<p align="center">
  <a href="https://stackshare.io/daily/daily">
    <img src="http://img.shields.io/badge/tech-stack-0690fa.svg?style=flat" alt="StackShare">
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

## Architecture

<p align="center">
    <img src="/assets/arch.png" alt="Daily architecture" width="700">
</p>
