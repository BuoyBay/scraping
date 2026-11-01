---
title: "Scraping getting started"
summary: "Install and use Scraping with explicit configuration and resource ownership."
category: "Guides"
order: 10
keywords: ["scraping", "dom", "htmlview", "crawl", "jsonld"]
related: ["index.md", "api.md", "typed-api.md"]
---

# Scraping getting started

Install the scraping archive in packages so the extractor resource is delivered with your app. The example creates a queue and selector recipe, claims a URL, and prints the configuration a host can use. It does not fetch or navigate; a GUI host must load the page and run recipe.JavaScript in its HTMLView.

```buoy
Import scraping

Sub Main()
    Dim queue As New CrawlQueue()
    queue.Enqueue("https://shop.example/products")
    Dim recipe As New ScrapeRecipe()
    recipe.ItemSelector = ".product"
    recipe.Fields.Value("name") = ".title"
    Dim entry As CrawlEntry = queue.NextEntry()
    If entry <> Nil Then
        Print recipe.Configuration(entry.URL).ToString()
        queue.Pause()
    End If
    Print queue.Checkpoint().ToString()
End Sub
```

## Connect the browser bridge

Execute JavaScript(sourceURL, requestID), handle HTMLView JavaScriptRequest, parse the message, and accept only kind scrape with the active request_id. An envelope carries either data or error. Complete/Fail accept the request ID, so stale responses cannot complete a different queue claim.

Data contains records, links, warnings, source_html, source/canonical URLs, and extractor metadata. Prices remain strings with currency; zero prices are retained. Canonical/product identities are bound to the source origin.

## Pause and restore

Pause returns an active entry to Pending without consuming a retry. Checkpoint serializes versioned state; CrawlQueue.Restore validates it, rebuilds deduplication, and treats interrupted Loading entries as Pending. Persist checkpoints in host-owned storage. A page that hydrates after load needs an explicit later extraction when its content is ready.

## Read next

- [Overview](index.md)
- [Getting started](getting-started.md)
- [API reference](api.md)
