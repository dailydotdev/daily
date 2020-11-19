# ADR 2: GraphQL Pub/Sub Implementation

* Status: accepted
* Deciders: @idoshamun
* Date: 2020-11-15

## Context and Problem Statement

We want to add real-time updates to the application.
GraphQL Subscription is a perfect match for implementing the real-time updates.
It's based on WebSocket to create a bi-directional communication between the server and client.
Every GraphQL Subscription server should be aware that an event is occurred to push messages back to the client.
This is done using a [Pub/Sub Engine](https://www.apollographql.com/docs/apollo-server/data/subscriptions/).

There are many open-source implementations that can serve as an engine.
Which one should we choose for our use-case?

## Decision Drivers

* Popular open-source solution
* Real-time is here to stay and will probably grow over time
* Easy to implement and maintain

## Considered Options

* [Redis driver](https://github.com/davidyaha/graphql-redis-subscriptions)
* [Google Pub/Sub driver](https://github.com/axelspringer/graphql-google-pubsub)
* In-memory default driver

## Decision Outcome

Chosen option: Redis driver, because it's the easiest solution to implement and the most common one for this use-case.

### Positive Consequences

* Very easy to implement and to integrate with
* Redis is very popular and there's so much knowledge available
* Support WebSocket cluster out-of-the-box

### Negative Consequences

* No autoscale, so we need to monitor the performance
* Costly compared to possible serverless solutions
* New infrastructure to manage and learn

## Pros and Cons of the Options

### Google Pub/Sub driver

* Good, because it's a no-ops solution
* Good, because it's cheap
* Good, because we're very familiar with it already
* Bad, because it doesn't support fanout out-of-the-box, so clustering can be a mess
* Bad, because it's not a common use-case to use it for WebSocket

### In-memory default driver

* Good, because it's bundled with Apollo and maintained by them
* Good, because easy to use
* Bad, because it's in-memory, so clustering is out of scope
