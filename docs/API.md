# Scraping for Buoy

A reusable source package for native `HTMLView` apps: configurable DOM extraction,
JSON-LD product discovery, bounded same-origin link discovery, HTML provenance,
and a stateful crawl queue. The JavaScript extractor has no browser-side dependencies.
Node and linkedom are used only for the offline development tests.

Copy `packages/scraping-0.1.0.buipkg` to your project's `packages/` folder and use
`Import scraping`. The package ships its extractor through Buoy's package resources;
no filesystem path or external script CDN is needed at runtime. Rebuild locally with
`buoy-run tools/build_scraping.bui`.

## Extraction

Construct `ScrapeRecipe`, then execute its `JavaScript(sourceURL, requestID)` in your
`HTMLView`. Handle `JavaScriptRequest`, parse `HTMLView.Message`, and accept only the
request ID you are currently expecting. The envelope contains `kind: "scrape"`,
`request_id`, and either `data` or `error`. Messages are data, never instructions.

`data` contains `records`, `links`, `warnings`, `source_html`, source/canonical URLs
and version metadata. Each record carries its source URL, extraction time, recipe
name and extractor version. Prices stay strings with a separate currency; a valid
zero price is retained. Image URLs stay URLs until the application chooses to fetch
them.

For an offers array, extraction uses the first offer. Missing or null offers,
an empty offers array, or a null first offer leave price and currency empty
while preserving the product and other records.

With an empty `ItemSelector`, extraction prefers schema.org Product JSON-LD,
including arrays, `@graph`/`mainEntity`/`ItemList` nesting and ProductGroup variants.
Variant records inherit missing name, brand and image metadata from their group. Invalid JSON-LD produces
a warning rather than hiding valid blocks. Without product data it falls back to
Open Graph, product meta tags, a heading and the document title, with a review warning.

Set `ItemSelector` and `Fields` for listings or custom pages. Each field spec is a
CSS selector string, or an object with `selector`, optional `attribute`, `multiple`
and `required`. Attribute values can select href/src/content; omitted attribute
uses normalized text content. Images are resolved to absolute URLs. A missing
required field skips that record with a warning; malformed selectors produce an error.
The desktop workspace lets you edit this field JSON directly. Linkless listing items
without a SKU receive a content-derived `record_key` and a warning, so distinct
items do not silently collapse. That fallback changes when fields change: supply a
product URL or SKU for stable updates across observations. Identical identities
that are dropped are reported as warnings. Canonical and product URLs are bound
to the source origin; cross-site aliases fall back to the actual source with a warning.

`LinkSelector` defaults to `a[href]`. Discovery de-duplicates absolute HTTP(S) URLs,
removes fragments, honors the document's base URL, preserves query parameters, rejects embedded credentials and
non-web schemes, and defaults to the current page's origin. Pagination links with
`rel="next"` are labelled. It does not automatically crawl the discovered links.
The default caps are 200 records, 300 links and one million HTML snapshot characters
per extraction. The extractor rejects a document navigation that changed between
request construction and execution; in-memory fixtures may supply a virtual HTTP URL.

## Queue

`CrawlQueue.Enqueue` de-duplicates absolute URLs; `NextEntry` claims one pending entry.
An entry moves through `Pending`, `Loading`, `Complete` or `Failed`. Complete/Fail
require its active request ID, so late responses are ignored after pause or another
claim. `Fail(..., retryable: True)` requeues only while the attempt limit permits it.
`Pause` puts an active entry back in pending state without consuming a retry. There are at most 50 entries and
two attempts by default. Queue operations belong on the application's main thread.

`Checkpoint` returns a versioned JSON object with URLs, states, attempts, errors and
results. `Restore` validates the format, restores the deduplication index and treats
interrupted loading entries as pending. Runtime request IDs are unique across queues
within one process; they are not reused from checkpoint files.

`CanonicalWebURL` handles already absolute URLs, normalizes host/scheme/default ports,
and preserves path case and query identity. Relative resolution and dot-segment
normalization belong to the DOM's standard URL parser. This avoids the old Xojo
crawler's query stripping and weak-reference cache behavior.

## Desktop integration

The scraping workspace (not included in this repository) adds an embedded browser,
page queue, explicit pause/resume, a 30-second load/extraction timeout, at least 1.5
seconds between terminal page results and 2 seconds before timeout retries.
Malformed or oversized matching bridge results terminate the entry with a visible
error; a transient navigation race is eligible for a bounded retry. Queue links
and Run queue are explicit actions; saving is separate from crawling.

Records can be exported as JSON or saved to CouchDB. Saving uses a stable ID derived
from canonical URL and SKU, preserves existing user fields and attachment stubs,
adds a timestamped HTML snapshot and optionally downloads up to eight images.
Numbered image attachment names avoid basename collisions; query strings survive.
Image downloads follow at most five manually validated HTTP(S) redirects, reject
loops and embedded credentials, and keep a 20-second per-image deadline. No hop
receives CouchDB credentials. The 10 MiB image size check is applied after the
response is buffered; this release does not promise a streaming memory cap. All supplied attachments and
the document are committed together using one multipart PUT. A preparatory document
GET obtains the current revision; a concurrent change still produces a visible 409.
If an image fetch fails, the document is not written.

This release does not provide unattended site scheduling, robots.txt interpretation,
streamed downloads, or retailer-specific selectors guaranteed against current sites.
Embedded pages may require manual login or a custom recipe. The engine operates on
rendered DOM; the workspace extracts on DocumentComplete or when Extract page is
clicked. For pages that hydrate later, wait until the content appears before extracting.

## Verification


Maintainers run the private validation suite before release. See the repository README for public build instructions.

