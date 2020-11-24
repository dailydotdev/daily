# ADR 4: Trending Articles Solution

* Status: accepted
* Deciders: @idoshamun
* Date: 2020-11-22

## Context and Problem Statement

We would like to mark the most trending articles in our feed.
Trending means that the number of views is growing over time.
How should we identify the trending articles in near real-time?

## Decision Drivers

* Easy to build
* No-ops solution

## Considered Options

* Cron job
* Google Dataflow
* Apache Spark

## Decision Outcome

Chosen option: Cron job, because it utilizes our existing API server and its infrastructure.
This should be the most straightforward solution to implement.

### Positive Consequences

* Utilize existing API
* No-ops needed

### Negative Consequences

* Very limited in terms of possible calculations compared to data processing platforms
* Might create load on the database as we grow
* I believe that in the near future we will have to migrate to a different solution

## Pros and Cons of the Options

### Google Dataflow

* Good, because it uses a Apache Beam which is an open source library
* Good, because it's a fully managed with automatic provisioning solution
* Good, because it's a very flexible platform
* Bad, because it will increase our cloud cost
* Bad, because we don't have this infrastructure in place yet

### Apache Spark

* Good, because it's a well-known open source platform
* Good, because it's a very flexible platform
* Bad, because it will increase our cloud cost
* Bad, because we don't have this infrastructure in place yet
* Bad, because we don't have prior experience
