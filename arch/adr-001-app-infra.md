# ADR 1: Application Infrastructure

* Status: accepted
* Deciders: @idoshamun
* Date: 2020-11-02

## Context and Problem Statement

As daily.dev grows, the need for building multiple services that create a complex business logic is rising.
The application infrastructure that orchestrates everything plays a crucial part and enables moving fast.

What application infrastructure is the right choice for daily.dev?

## Decision Drivers

* I'm a single developer and cannot operate a complex infrastructure 24/7
* daily.dev is growing fast, and we need an elastic platform to support the growth
* Cost-effective
* Allows secured intercommunication between services

## Considered Options

* Google Kubernetes Engine
* Cloud Run
* Cloud Function

## Decision Outcome

Chosen option: "Cloud Run", because it's a no-ops solution that can autoscale based on the requests per second and can even scale to zero when needed.
Cloud Run is based on Knative, a Kubernetes addon, so it should be easy to migrate if needed to other container-based solutions.

### Positive Consequences

* Autoscale out-of-the-box
* Zero scale for background processes when idle
* Easily manage traffic between new versions
* Dedicated monitoring for every service
* HTTPS communication by default
* Secure services using Google IAM

### Negative Consequences

* Doesn't support WebSockets
* Google's proprietary solution
* Some features are still in beta
* Not enough public knowledge and experience

## Pros and Cons of the Options

### Google Kubernetes Engine

* Good, because it's an open-source platform and available on every major provider
* Good, because it's a very popular solution with lots of public knowledge
* Good, because it's the current application infrastructure, and it works great
* Bad, because autoscaling is hard and requires manual monitoring
* Bad, because there is no secured intercommunication out-of-the-box

### Cloud Function

* Good, because it's a no-ops serverless solution
* Good, because autoscale is supported out-of-the-box
* Bad, because it's Google's proprietary solution and cannot be easily migrated to another solution
* Bad, because it has limited runtime support
