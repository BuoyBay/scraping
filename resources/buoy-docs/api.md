---
title: "Scraping API"
summary: "Public types, operations, error behavior, and limits for Scraping."
category: "Reference"
order: 20
keywords: ["scraping", "dom", "htmlview", "crawl", "jsonld"]
symbols: ["ScrapeRecipe", "CrawlQueue", "CrawlEntry", "CrawlState", "CanonicalWebURL", "WebOrigin", "ResolveWebURL", "PrettyJSON", "ScrapeRecipe.JavaScript", "CrawlQueue.Restore"]
related: ["index.md", "getting-started.md", "typed-api.md"]
---

# Scraping API

| API | Contract |
| --- | --- |
| ScrapeRecipe | Name, ItemSelector, LinkSelector, Fields, CaptureHTML, MaximumRecords. |
| Configuration(sourceURL) | JSON configuration for the extractor. |
| JavaScript(sourceURL, requestID) | Executable extractor program for the loaded HTMLView; does not navigate. |
| CrawlQueue.Enqueue(url) | Validate and deduplicate an absolute web URL; False for a duplicate. |
| NextEntry() | Claim one pending entry, or Nil when none is available. |
| Complete(requestID, payload) | Accept data only for the currently active request. |
| Fail(requestID, message, retryable) | Fail or requeue within MaximumAttempts. |
| Pause, Checkpoint, CrawlQueue.Restore | Stop the active claim and serialize/restore queue state. |
| CrawlEntry | URL, State, Attempts, RequestID, ErrorMessage, Result. |
| CrawlState | Pending, Loading, Complete, Failed. |
| CanonicalWebURL, WebOrigin, ResolveWebURL, PrettyJSON | URL normalization/origin/resolution helpers and formatted JSON. |

## Recipe fields and identities

Fields maps a name to a selector string or an object with selector and optional attribute, multiple, and required. Missing attribute uses normalized text. LinkSelector defaults to a[href]; discovered URLs preserve query identity, lose fragments, and reject embedded credentials/non-web schemes.

Request IDs are process-unique and are not restored from checkpoints. Linkless records without SKU receive content-derived record keys and a warning; supply stable product URLs/SKUs when updates must retain identity.

## Read next

- [Overview](index.md)
- [Getting started](getting-started.md)
- [API reference](api.md)


[Full typed API: properties, parameters, defaults, and returns](typed-api.md)
