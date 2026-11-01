/* Buoy Scraping: native DOM extraction. No network code or injected dependencies. */
(function (root) {
  'use strict';
  const version = '1.0.0';
  const clean = value => String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  function resolveURL(value, base) {
    try {
      // Text whitespace cleanup changes URL path/query identity. Trim only.
      const reference = String(value == null ? '' : value).trim();
      let url;
      try { url = new URL(reference); }
      catch (_) { url = new URL(reference, base); }
      if (!/^https?:$/.test(url.protocol) || url.username || url.password) return '';
      url.hash = '';
      return url.href; // Query parameters identify variants/pages and must survive.
    } catch (_) { return ''; }
  }
  function extract(document, options) {
    options = options || {};
    const base = resolveURL(options.source_url || document.URL, document.baseURI);
    if (!base) throw new Error('An absolute HTTP(S) source URL is required');
    const origin = new URL(base).origin;
    const resolutionBase = resolveURL(document.baseURI, base) || base;
    const warnings = [];
    const maxRecords = Math.min(1000, Math.max(1, Number(options.max_records) || 200));
    const maxLinks = Math.min(2000, Math.max(1, Number(options.max_links) || 300));
    function nodes(parent, selector) {
      if (!selector) return [];
      try { return Array.from(parent.querySelectorAll(selector)); }
      catch (_) { throw new Error('Invalid CSS selector: ' + selector); }
    }
    function read(parent, spec) {
      if (typeof spec === 'string') spec = { selector: spec };
      spec = spec || {};
      const found = spec.selector ? nodes(parent, spec.selector) : [parent];
      const values = found.map(node => clean(spec.attribute ? node.getAttribute(spec.attribute) : node.textContent)).filter(Boolean);
      return spec.multiple ? Array.from(new Set(values)) : (values[0] || '');
    }
    const meta = selector => read(document, {selector, attribute: 'content'});
    const canonicalHref = read(document, {selector:'link[rel~="canonical"]', attribute:'href'});
    const offeredCanonical = (canonicalHref && resolveURL(canonicalHref, resolutionBase)) || base;
    const canonical = new URL(offeredCanonical).origin === origin ? offeredCanonical : base;
    if (offeredCanonical !== canonical) warnings.push('Ignored cross-origin canonical URL');
    function images(values) {
      return Array.from(new Set((Array.isArray(values) ? values : [values]).map(value => {
        if (value && typeof value === 'object') value = value.url || value.contentUrl;
        return value ? resolveURL(value, resolutionBase) : '';
      }).filter(Boolean))).slice(0, 100);
    }
    function record(fields, recordURL) {
      let url = resolveURL(recordURL || fields.url || canonical, resolutionBase);
      if (!url) { warnings.push('Skipped record with invalid URL'); return null; }
      if (new URL(url).origin !== origin) {
        warnings.push('Ignored cross-origin record URL'); url = base;
      }
      const result = Object.assign({}, fields, {url, source_url:base,
        canonical_url:url, type:'scrape.record', schema_version:1,
        extracted_at:new Date().toISOString(), extractor_version:version,
        recipe:clean(options.name || 'generic-product')});
      if (result.images) result.images = images(result.images);
      return result;
    }
    let records = [];
    if (options.item_selector) {
      const items = nodes(document, options.item_selector);
      for (const item of items.slice(0, maxRecords)) {
        const fields = {};
        let valid = true;
        for (const [key, spec] of Object.entries(options.fields || {})) {
          const value = read(item, spec);
          fields[key] = value;
          if (spec && spec.required && (!value || (Array.isArray(value) && !value.length))) {
            warnings.push('Missing required field: ' + key); valid = false;
          }
        }
        if (!valid) continue;
        const link = fields.url || read(item, {selector:'a[href]', attribute:'href'});
        if (!link && !fields.sku) {
          fields.record_key = JSON.stringify(fields);
          warnings.push('Listing item has no URL/SKU; identity follows extracted content');
        }
        const value = record(fields, link);
        if (value) records.push(value);
      }
      if (!items.length) warnings.push('The item selector matched no elements');
      if (items.length > maxRecords) warnings.push('Record limit reached');
    } else {
      // Prefer standards-based Product data to brittle retailer-specific selectors.
      const products = [];
      function visit(value, depth, inherited) {
        if (!value || depth > 12) return;
        if (Array.isArray(value)) { value.forEach(item => visit(item, depth + 1, inherited)); return; }
        if (typeof value !== 'object') return;
        const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
        if (types.some(type => /(?:^|[\/#:])Product$/i.test(String(type)))) products.push(Object.assign({}, inherited, value));
        if (value['@graph']) visit(value['@graph'], depth + 1, inherited);
        if (value.mainEntity) visit(value.mainEntity, depth + 1, inherited);
        if (value.itemListElement) visit(value.itemListElement, depth + 1, inherited);
        if (value.item) visit(value.item, depth + 1, inherited);
        if (value.hasVariant) {
          const defaults = Object.assign({}, inherited);
          for (const key of ['name','brand','image','description','model','url','offers']) {
            if (value[key] != null) defaults[key] = value[key];
          }
          visit(value.hasVariant, depth + 1, defaults);
        }
      }
      nodes(document, 'script[type="application/ld+json"]').forEach(script => {
        try { visit(JSON.parse(script.textContent), 0); }
        catch (_) { warnings.push('Ignored invalid JSON-LD'); }
      });
      for (const product of products.slice(0, maxRecords)) {
        const offers = (Array.isArray(product.offers) ? product.offers[0] : product.offers) ?? {};
        const brand = product.brand && typeof product.brand === 'object' ? product.brand.name : product.brand;
        const result = record({name:clean(product.name), sku:clean(product.sku || product.productID),
          model:clean(product.model), brand:clean(brand), description:clean(product.description),
          price:clean(offers.price == null ? offers.lowPrice : offers.price),
          currency:clean(offers.priceCurrency), availability:clean(offers.availability),
          images:images(product.image || [])}, product.url || offers.url || canonical);
        if (result) records.push(result);
      }
      if (!records.length) {
        const result = record({name:meta('meta[property="og:title"]') || read(document,'h1') || clean(document.title),
          description:meta('meta[property="og:description"]') || meta('meta[name="description"]'),
          sku:meta('meta[itemprop="sku"]'), model:meta('meta[itemprop="model"]'),
          brand:meta('meta[itemprop="brand"]'),
          price:meta('meta[property="product:price:amount"]') || meta('meta[property="og:price:amount"]'),
          currency:meta('meta[property="product:price:currency"]'),
          images:images([meta('meta[property="og:image"]')].filter(Boolean))}, canonical);
        if (result && result.name) records.push(result);
        warnings.push('Used page metadata fallback; review the extracted record');
      }
    }
    // Equal URLs can represent distinct JSON-LD variants; include SKU in identity.
    const seenRecords = new Set();
    records = records.filter(item => {
      const key = JSON.stringify([item.canonical_url, item.sku || item.record_key || '']);
      if (seenRecords.has(key)) { warnings.push('Dropped duplicate record identity'); return false; }
      seenRecords.add(key); return true;
    });
    const seenLinks = new Set();
    const links = [];
    for (const element of nodes(document, options.link_selector || 'a[href]')) {
      const url = resolveURL(element.getAttribute('href'), resolutionBase);
      if (!url || url === base || seenLinks.has(url)) continue;
      if (!options.allow_external_links && new URL(url).origin !== origin) continue;
      seenLinks.add(url);
      const isNext = clean(element.getAttribute('rel')).toLowerCase().split(/\s+/).includes('next');
      links.push({url, name:clean(element.textContent), kind:isNext ? 'pagination' : 'link'});
      if (links.length >= maxLinks) { warnings.push('Link limit reached'); break; }
    }
    let html = options.capture_html ? document.documentElement.outerHTML : '';
    if (html.length > (Number(options.max_html_characters) || 1000000)) {
      html = ''; warnings.push('Source HTML exceeded snapshot limit and was omitted');
    }
    return {schema_version:1, extractor_version:version, source_url:base, canonical_url:canonical,
      title:clean(document.title), records, links, warnings, source_html:html};
  }
  const api = {version, resolveURL, extract};
  root.BuoyScraper = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
