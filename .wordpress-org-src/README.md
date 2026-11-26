# WordPress.org asset sources

Sources for the images in `.wordpress-org/`. Not shipped in the plugin.

```sh
node .wordpress-org-src/render.mjs .wordpress-org-src/screenshot-1.html .wordpress-org/screenshot-1.png 1280 800 2
```

`render.mjs` needs Playwright, which `@wordpress/scripts` already installs (`npx playwright install chromium` if the browser is missing). Only `file://` and the font CDN are loaded.

The icons in `screenshot-1.html` are inlined from the plugin's bundled set (`build/icon-manifest.php`) and `src/icons/bolt.js`, so they match what users see. UI labels are copied from the editor strings in `src/index.js`; keep them in sync if those change.

## Captured screenshots (2–8)

`capture.cjs` captures screenshots 2 to 8 from a running site at 1280×800, 2× scale. It changes the site title, creates a "Main menu" Navigation menu and points Twenty Twenty-Five's header at it, so run it against a throwaway WordPress Playground site only:

```sh
npx @wp-playground/cli@latest server --auto-mount --wp=7.2 --blueprint=<blueprint that activates the plugin and twentytwentyfive>
node .wordpress-org-src/capture.cjs http://127.0.0.1:9400 .wordpress-org
node .wordpress-org-src/capture.cjs http://127.0.0.1:9400 .wordpress-org 4,7   # only some shots
```

The current images come from WordPress 7.2 RC3 with Twenty Twenty-Five. The "Open Media Library" item is missing from screenshot 3 because Playground, like WordPress by default, doesn't allow SVG uploads.
