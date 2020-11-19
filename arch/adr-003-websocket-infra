# ADR 3: WebSocket Infrastructure

* Status: accepted
* Deciders: @idoshamun
* Date: 2020-11-02

## Context and Problem Statement

We want to add real-time updates to the application.
GraphQL Subscription is a perfect match for implementing the real-time updates.
It's based on WebSocket to create a bi-directional communication between the server and client.

The problem is that our current [application infrastructure](https://github.com/dailydotdev/daily/blob/master/arch/adr-001-app-infra.md), 
Cloud Run, doesn't support WebSocket.

What application infrastructure is the right choice for our WebSocket cluster?

## Decision Drivers

* Docker-based solution
* WebSocket support
* Managed as much as possible

## Considered Options

* Google Kubernetes Engine
* Google Compute Engine

## Decision Outcome

Chosen option: GKE, because I have previous experience with deploying to Kubernetes and it's a Docker-based solution.

### Positive Consequences

* We can utilize existing knowledge and tools that we build
* Kubernetes is probably the most popular solution for Docker-based deployments

### Negative Consequences

* Requires monitoring the performance of the cluster and scale manually if necessary
* Can be costly if we don't implement autoscaling

## Pros and Cons of the Options

### Google Compute Engine

* Good, because it provides maximum flexibility
* Bad, because we don't have prior experience
* Bad, because it's not a Docker-based solution
