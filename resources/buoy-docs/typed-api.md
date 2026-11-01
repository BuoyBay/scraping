---
title: "scraping typed API"
summary: "Source-derived public signatures, properties, parameters, defaults, and return values."
category: "Reference"
order: 21
types: ["CrawlEntry", "CrawlQueue", "CrawlState", "ScrapeRecipe"]
dependencies: []
symbols: ["CrawlEntry", "CrawlQueue", "CrawlState", "ScrapeRecipe"]
related: ["api.md", "getting-started.md", "index.md"]
---

# scraping typed API

Generated from the package source declarations. Platform guards are shown where present; inherited members are documented on the base type. See the [API contracts](api.md) for behavior and limitations.

## Scraping functions

### CanonicalWebURL

`Public Function CanonicalWebURL(value As String) As String`

Normalize an already absolute HTTP(S) URL without dropping query parameters.

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `value` | `String` | `ByVal` | Required |

#### Returns

| Type |
| --- |
| `String` |

### WebOrigin

`Public Function WebOrigin(value As String) As String`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `value` | `String` | `ByVal` | Required |

#### Returns

| Type |
| --- |
| `String` |

### ResolveWebURL

`Public Function ResolveWebURL(reference As String, baseURL As String) As String`

Resolve HTTP redirect references while preserving query strings and doubled slashes.

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `reference` | `String` | `ByVal` | Required |
| `baseURL` | `String` | `ByVal` | Required |

#### Returns

| Type |
| --- |
| `String` |

### PrettyJSON

`Public Function PrettyJSON(value As JSONItem) As String`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `value` | `JSONItem` | `ByVal` | Required |

#### Returns

| Type |
| --- |
| `String` |

## ScrapeRecipe

`Public Class ScrapeRecipe`

Build a versioned extraction recipe; selectors run against the current DOM.

### Properties

| Name | Type | Read-Only | Shared | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `Name` | `String` | No | No | `"generic-product"` | — |
| `ItemSelector` | `String` | No | No | `""` | — |
| `LinkSelector` | `String` | No | No | `"a[href]"` | — |
| `Fields` | `JSONItem` | No | No | `JSONItem.NewObject()` | — |
| `CaptureHTML` | `Boolean` | No | No | `True` | — |
| `MaximumRecords` | `Integer` | No | No | `200` | — |

### Configuration

`Public Function Configuration(sourceURL As String) As JSONItem`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `sourceURL` | `String` | `ByVal` | Required |

#### Returns

| Type |
| --- |
| `JSONItem` |

### JavaScript

`Public Function JavaScript(sourceURL As String, requestID As Integer) As String`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `sourceURL` | `String` | `ByVal` | Required |
| `requestID` | `Integer` | `ByVal` | Required |

#### Returns

| Type |
| --- |
| `String` |

## CrawlState

`Public Enum CrawlState`

### Values

| Name | Type | Value / Default | Description |
| --- | --- | --- | --- |
| `Pending` | `CrawlState` | — | — |
| `Loading` | `CrawlState` | — | — |
| `Complete` | `CrawlState` | — | — |
| `Failed` | `CrawlState` | — | — |

## CrawlEntry

`Public Class CrawlEntry`

### Properties

| Name | Type | Read-Only | Shared | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `URL` | `String` | No | No | — | — |
| `State` | `CrawlState` | No | No | `CrawlState.Pending` | — |
| `Attempts` | `Integer` | No | No | `0` | — |
| `RequestID` | `Integer` | No | No | `0` | — |
| `ErrorMessage` | `String` | No | No | `""` | — |
| `Result` | `JSONItem` | No | No | `JSONItem.Null()` | — |

## CrawlQueue

`Public Class CrawlQueue`

An explicit one-page-at-a-time queue with deduplication and stale-result rejection.

### Properties

| Name | Type | Read-Only | Shared | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `Entries` | `Array Of CrawlEntry` | No | No | `[]` | — |
| `MaximumPages` | `Integer` | No | No | `50` | — |
| `MaximumAttempts` | `Integer` | No | No | `2` | — |

### Enqueue

`Public Function Enqueue(url As String) As Boolean`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `url` | `String` | `ByVal` | Required |

#### Returns

| Type |
| --- |
| `Boolean` |

### NextEntry

`Public Function NextEntry() As CrawlEntry`

No parameters.

#### Returns

| Type |
| --- |
| `CrawlEntry` |

### Complete

`Public Function Complete(requestID As Integer, payload As JSONItem) As Boolean`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `requestID` | `Integer` | `ByVal` | Required |
| `payload` | `JSONItem` | `ByVal` | Required |

#### Returns

| Type |
| --- |
| `Boolean` |

### Fail

`Public Function Fail(requestID As Integer, message As String, retryable As Boolean = False) As Boolean`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `requestID` | `Integer` | `ByVal` | Required |
| `message` | `String` | `ByVal` | Required |
| `retryable` | `Boolean` | `ByVal` | `False` |

#### Returns

| Type |
| --- |
| `Boolean` |

### Pause

`Public Sub Pause()`

No parameters.

Returns: no value.

### Checkpoint

`Public Function Checkpoint() As JSONItem`

No parameters.

#### Returns

| Type |
| --- |
| `JSONItem` |

### Restore

`Public Shared Function Restore(checkpoint As JSONItem) As CrawlQueue`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `checkpoint` | `JSONItem` | `ByVal` | Required |

#### Returns

| Type |
| --- |
| `CrawlQueue` |
