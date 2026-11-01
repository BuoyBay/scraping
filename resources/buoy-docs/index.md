---
title: "Scraping"
summary: "Build explicit rendered-DOM extraction recipes and bounded resumable crawl queues."
category: "Overview"
order: 0
keywords: ["scraping", "dom", "htmlview", "crawl", "jsonld"]
related: ["getting-started.md", "api.md", "typed-api.md"]
---

# Scraping

scraping combines a dependency-free browser JavaScript extractor with Buoy recipe and queue classes for native HTMLView applications. It extracts rendered product metadata, custom selector fields, provenance HTML, and bounded same-origin links. It does not navigate or crawl automatically.

## Extraction model

With no ItemSelector, recipes prefer Product JSON-LD, including grouped variants, then fall back to Open Graph and page metadata with warnings. Selector recipes choose listing containers and fields; a missing required field skips a record. Images remain URLs until the host explicitly fetches them.

Execute recipe JavaScript in the currently loaded HTMLView and validate the returned scrape envelope and request_id before accepting it. Results are data, never application instructions. The package supplies its extractor as a bundled resource; no CDN or browser-side dependency is required.

## Limits and responsibilities

Default extraction caps are 200 records, 300 links, and one million captured HTML characters. Queue defaults are 50 entries and two attempts. Queue operations belong on the application's main thread. Scheduling, robots interpretation, navigation pacing, authentication, persistence, and image downloads are host policies.

## Read next

- [Overview](index.md)
- [Getting started](getting-started.md)
- [API reference](api.md)
