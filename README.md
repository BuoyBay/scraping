# Extract DOM data and manage explicit crawl queues

A reusable source package for native `HTMLView` apps: configurable DOM extraction,
JSON-LD product discovery, bounded same-origin link discovery, HTML provenance,
and a stateful crawl queue. The JavaScript extractor has no browser-side dependencies.
Node and linkedom are used only for the offline development tests.

Copy `packages/scraping-0.1.0.buipkg` to your project's `packages/` folder and use
`Import scraping`. The package ships its extractor through Buoy's package resources;
no filesystem path or external script CDN is needed at runtime. Rebuild locally with
`ahoy tools/build_scraping.bui`.

## Install

From a Buoy consumer project with BPM installed:

```sh
bpm add scraping --git https://github.com/BuoyBay/scraping.git --rev refs/heads/main
```

BPM records the resolved commit in its lockfile. Keep that lockfile with the
consumer project for reproducible installs.

## Example

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

## Build from source

With the native `build-packages` driver from [devtools](https://github.com/BuoyBay/devtools)
on your `PATH`, run from this checkout:

```sh
build-packages --root "$PWD" --compile-consumer scraping
```

The driver checks source targets and compiles an import consumer. See the
[API guide](docs/API.md) for behavior, limits and any host prerequisites.

## Local Buoy setup

On your own machine, install Buoy and run:

```sh
buoy ai init --both
```

## Contributing

[Contributing](CONTRIBUTING.md) · [License](LICENSE)
