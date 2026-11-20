# CSV.view

Turn CSV, TSV, or arrays of records into a table with search, sorting, filters, and pagination.

![CSV.view preview](prev.jpg)

## Index

1. [Quick start](#quick-start)
2. [Try it](#try-it)
3. [Downloads](#downloads)
4. [API and options](#api-and-options)
5. [Themes](#themes)
6. [Checks and releases](#checks-and-releases)
7. [Related projects](#related-projects)
8. [License](#license)

## Quick start

```html
<link href="https://cdn.jsdelivr.net/gh/byuwur/csv.view@latest/csv.min.css" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/gh/byuwur/csv.view@latest/csv.min.js" defer></script>
<div id="viewer" data-theme="light"></div>
<script>
  document.addEventListener("DOMContentLoaded", () => {
    byCSVviewer(document.getElementById("viewer"), "name,score\nAndres,10\nSam,8");
  });
</script>
```

Pin a published tag in place of `@latest` for a fixed version.

### Offline use and Content Security Policy

The renderer loads no remote scripts, fonts, or styles. Local library files work without a CDN, including in a `file://` host. Host optional `csv.themes.css` locally for extra palettes. The online playground and exported CDN starter still require internet access; a local starter requires all referenced files beside it. Playground fetches and clipboard permissions remain subject to browser restrictions.

Allow the script and style origins in your CSP. Authorize inline initialization and custom theme CSS separately, or move them into local files. The controls use static HTML templates and do not support enforced Trusted Types.

## Try it

[Playground](https://csv.byuwur.co/)

The library contains no tracking. The [privacy policy](https://byuwur.co/privacy/dotview) and [cookie policy](https://byuwur.co/cookies/dotview) apply only to the hosted landing page and playground.

Open [index.html](index.html) locally. Its host assets use the network. Exported starters use the default settings. The playground accepts local files up to 30 MiB.

## Downloads

[ZIP](https://github.com/byuwur/csv.view/releases/latest/download/csv.view.zip) · [Minified ZIP](https://github.com/byuwur/csv.view/releases/latest/download/csv.view.minified.zip)

## API and options

1. [API and data contract](#api-and-data-contract)
2. [Options](#options)
3. [Appearance and limits](#appearance-and-limits)

### API and data contract

`byCSVviewer(element, input?, options?)` returns `{ ready, setOptions, destroy }`. `ready` resolves `true` after initial rendering, or `false` on a displayed data error, cancellation, or disposal. Invalid targets or delimiters throw `TypeError`. Re-rendering disposes the previous instance; `destroy()` cancels pending work and clears the target only if the instance still owns it.

`byCSVviewer.parse(input, options?)` uses the same parser and synchronously returns `{ columns: string[], rows: unknown[][] }`. Invalid input throws `TypeError`, `SyntaxError`, or `RangeError`. Read the release version with `byCSVviewer.VERSION`. Duplicate script loads preserve the API.

CSV strings remain strings, including leading zeros and whitespace. Quoted delimiters, doubled quotes, CR/LF/CRLF, BOM, and embedded line breaks are supported. A quote must start a field; after its closing quote only a delimiter or line ending is accepted. Unequal field counts are errors.

Array/record values retain scalar types; null/missing values display as empty. Nested objects are rejected. Caller arrays are unchanged. Only own keys are used, including `__proto__`.

Column headers cycle through ascending, descending, and reset to input order. Sorting is natural and case-insensitive; ties keep input order. Reset retains active filters. Filtering leaves source data unchanged.

Cell copy preserves the exact value, including empty strings. Copy requires clipboard permission in a secure context.

`ready` describes the initial render only; it does not track later filtering, sorting, or page changes.

```javascript
const viewer = byCSVviewer(target, csv, { search: true });
const rendered = await viewer.ready; // false on data errors or cancellation.
viewer.destroy(); // Call when the host panel is removed.
```

### Options

| Option             | Default     | Behavior                                                                                                                                                   |
| ------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `delimiter`        | `","`       | One character, excluding quote, BOM, CR, and LF. No autodetection.                                                                                         |
| `headers`          | `true`      | First text/array row supplies names. False generates `Column 1`, etc. Record input always uses its union of own keys.                                      |
| `skipEmptyLines`   | `true`      | Skip physically empty lines. Quoted empty cells and delimiter-only rows remain.                                                                            |
| `pageSize`         | `50`        | Rows per page, integer 1-1000; invalid values use 50.                                                                                                      |
| `search`           | `false`     | Global case-insensitive substring search, including hidden columns.                                                                                        |
| `columnFilters`    | `false`     | Per-column substring filters; combined with search using AND. Hidden filters remain active.                                                                |
| `visibleColumns`   | all         | Array of zero-based indices or column names. Duplicate names match every column with that name; an empty array hides all columns.                          |
| `copyCells`        | `false`     | Cells become keyboard-accessible copy buttons, keeping the same text and spacing.                                                                          |
| `animations`       | `true`      | Animate controls, disclosures and theme backgrounds. Overrides the system motion preference.                                                               |
| `appearAnimation`  | `false`     | Fade the viewer in on each render when `animations` is enabled. Initial rendering remains immediate by default.                                            |
| `toolbar`          | `true`      | Show the viewer header; secondary tools are configured separately.                                                                                         |
| `credits`          | `true`      | Show attribution in the header.                                                                                                                            |
| `displayContainer` | `true`      | Show the content panel frame and inner horizontal padding. `false` also hides status information.                                                          |
| `statusBar`        | `true`      | Show counts and metadata when `displayContainer` is true. With `statusBar: false`, loading and empty results remain visible; errors always remain visible. |
| `columnsButton`    | `false`     | Show the column chooser.                                                                                                                                   |
| `sorting`          | `true`      | Cycle ascending, descending, then input order; arrows show its direction.                                                                                  |
| `pagination`       | `true`      | Paginate large tables. The pager appears only with multiple pages; false shows every row.                                                                  |
| `theme`            | Container   | Initial `"light"` or `"dark"` mode class.                                                                                                                  |
| `palette`          | Container   | Initial `data-theme` palette, including custom CSS names.                                                                                                  |
| `fontSize`         | Container   | Number in rem or a CSS size such as `"1.25em"` or `"20px"`; bounded to `0.5rem`-`3rem`.                                                                    |
| `themeToggle`      | `true`      | Show the theme toggle.                                                                                                                                     |
| `fontSizeControls` | `true`      | Show text-size controls.                                                                                                                                   |
| `copyButton`       | `true`      | Copy original text, or CSV serialized from record/row input, including hidden/filtered rows.                                                               |
| `controlsSize`     | `"regular"` | `"xs"` (0.5rem), `"small"` (0.7rem), `"regular"` (0.875rem), `"large"` (1rem), or `"xl"` (1.25rem); invalid values use `"regular"`.                        |
| `controlsCompact`  | `true`      | Keep credits beside controls; `false` stacks them. Wraps as needed.                                                                                        |
| `controlsPosition` | `"top"`     | Sticky `"top"` or `"bottom"` toolbar; invalid values use `"top"`.                                                                                          |

### Appearance and limits

Style `.byCSVdocument` with `--by-view-bg`, `--by-view-text`, `--by-view-muted`, `--by-view-border`, `--by-view-accent`, and `--by-view-alt`. Set typography on the target or its class.

Wide tables scroll horizontally instead of squeezing columns. Explicit line breaks are preserved; cell copy feedback leaves values in place.

Limits: 10 million text-input characters, 100,000 data rows, and 500 columns. Pagination mounts one page of up to 1,000 rows; `pagination: false` mounts every matching row. Browser parsing/filtering yield. `.parse()` and native sorting are synchronous; large cells or records can still block.

Delimiter guessing, type inference, formulas, nested records, and spreadsheet editing are unsupported. Formula-like text is displayed and copied verbatim, never evaluated.

Requires a modern browser with ES2022 (`Object.hasOwn`), async functions, WeakMap, Intl.Collator, and CSS variables. The browser suites can run in Chromium, Firefox, and WebKit (see Checks).

`--by-view-content-font` and `--by-view-line-height` set source/tree typography.

The playground disables header-only settings while Viewer header is off, preserving their values. Appearing animation is disabled while Animations is off.

Use `toolbar: false` to hide the header, or disable `credits`, `themeToggle`, `fontSizeControls`, and `copyButton` individually. Content actions such as search and format-specific buttons use their own options.

Controls use monospace by default; override `--by-view-controls-font` to change it.

## Themes

Use `theme` for light or dark mode and `palette` for the color scheme. Monokai, GitHub, Solarized and High Contrast are built in. Load [csv.themes.css](csv.themes.css) after the base stylesheet for the other palettes.

Options override container settings. Omit an option or pass `null` to keep its current value. Call `setOptions(changes)` on the returned viewer to apply settings immediately. Presentation changes preserve the displayed document. The text controls resize content in `0.125rem` steps. Content padding stays fixed. The document frame, toolbar, and status line keep their size. Reset restores the configured or inherited size. Numeric `fontSize` uses rem. CSS sizes such as `20px` also work within the `0.5rem` to `3rem` range. Invalid appearance values throw `RangeError` before replacing the document.

```html
<div id="viewer" class="dark" data-theme="github"></div>
```

Use **Copy CSS** in the playground to export appearance settings. Set `--by-view-document-bg` for the outer background and `--by-view-container-bg` for panels and controls. Define custom palette variables on the component’s mode class and `[data-theme]` selector. For example:

```css
.byCSVdocument.dark[data-theme="my-ocean"] {
  --by-view-bg: #102a43;
  --by-view-text: #f0f6fc;
}
```

### Palette names

`monokai`, `github`, `solarized`, `high-contrast`, `dracula`, `darcula`, `nord`, `catppuccin`, `catppuccin-frappe`, `catppuccin-macchiato`, `rose-pine`, `rose-pine-moon`, `gruvbox`, `gruvbox-material`, `tokyo-night`, `tokyo-storm`, `tokyo-moon`, `one`, `material`, `material-ocean`, `night-owl`, `synthwave`, `ayu`, `everforest`, `kanagawa`, `selenized`, `vscode`, `monokai-dimmed`, `discord`, `slack`, `bonyur`, `sakura`, `bubblegum`, `candy`, `rose-gold`, `lavender`, `cyberpunk`, `sunset`, `volcano`, `amber`, `terminal`, `paper`, `ink`, `ocean`, `forest`, `mint`, `ice`, `sepia`.

High Contrast text colors target at least [7:1 contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html), with [3:1 contrast for control boundaries and focus cues](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). Check contrast again when you override colors.

Legacy integrations can use `#byVIEWtheme` or a detected `csv.light.css` / `csv.dark.css` link. The toggle keeps its path, query, and hash and updates viewers sharing the link. Explicit container themes stay independent. Separate theme files are no longer shipped; retain your hosted legacy files to use this alternative.

## Checks and releases

Use Node.js 22+ and run these commands from the repository root. For playground checks, place sibling checkouts of `spa.js` at `v20.16`, `code.view` at `v2.2` next to this repository.

```sh
npm --prefix .github ci --ignore-scripts --no-audit --no-fund
node .github/node_modules/playwright/cli.js install chromium
export NODE_PATH="$PWD/.github/node_modules"
node --test --test-concurrency=1 __tests__/rendering.cjs __tests__/playground.cjs
node .github/scripts/build.mjs --tag v0.0.0-local
npm --prefix .github run release:test
```

In PowerShell, replace the `export` line with `$env:NODE_PATH = "$PWD/.github/node_modules"`. [CI](.github/workflows/rendering.yml) runs Chromium, Firefox and WebKit by default. Manual runs can target one browser.

The [release workflow](.github/workflows/release.yml) tests the regular and minified ZIPs. Both contain the runtime files, README and license. The build manifest records the version and source commit. The local build writes `dist/assets/` and `dist/RELEASE_NOTES.md`. Use `--offline` for local minification. Publish by pushing a version tag matching the library’s `VERSION` (for example, `v2` for version 2).

## Related projects

[CODE.view](https://github.com/byuwur/code.view) · [DIFF.view](https://github.com/byuwur/diff.view) · [JSON.view](https://github.com/byuwur/json.view) · [LOG.view](https://github.com/byuwur/log.view) · [MD.edit](https://github.com/byuwur/md.edit) · [MD.view](https://github.com/byuwur/md.view) · [XML.view](https://github.com/byuwur/xml.view) · [YAML.view](https://github.com/byuwur/yaml.view)

## License

MIT (c) 2026 Andres Trujillo [Mateus] byUwUr. See [LICENSE](LICENSE.md).
