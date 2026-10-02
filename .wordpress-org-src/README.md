# WordPress.org asset sources

Sources for the images in `.wordpress-org/` that are drawn rather than captured. Not shipped in the plugin.

```sh
node .wordpress-org-src/render.mjs .wordpress-org-src/screenshot-1.html .wordpress-org/screenshot-1.png 1280 800 2
```

`render.mjs` needs Playwright, which `@wordpress/scripts` already installs (`npx playwright install chromium` if the browser is missing). Only `file://` and the font CDN are loaded.

The icons in `screenshot-1.html` are inlined from the plugin's bundled set (`build/icon-manifest.php`) and `src/icons/bolt.js`, so they match what users see. UI labels are copied from the editor strings in `src/index.js`; keep them in sync if those change.

Screenshots 2 and 3 are real editor captures.
