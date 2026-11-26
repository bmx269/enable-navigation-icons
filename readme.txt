=== Enable Navigation Icons ===
Contributors: bmx269
Tags: navigation, icons, menu, block editor, gutenberg
Requires at least: 6.9
Tested up to: 7.2
Requires PHP: 7.4
Stable tag: 1.0.2
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html

Add icons to Navigation block links and submenus. Pick from 297 built-in icons, the WordPress Icon API or your own SVG.

== Description ==

Enable Navigation Icons adds an icon option to the items in the core Navigation block. Select a link or submenu, click **Add icon** in the block toolbar, and pick an icon. Then set its size, spacing, position and colors for that item, or once on the Navigation block for the whole menu.

Icons are added when the page is rendered, not saved into your content, so your menus stay clean and portable. Deactivate the plugin and the menus go back to plain text links.

**[Try it in WordPress Playground](https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/bmx269/enable-navigation-icons/main/blueprint.json)** to test the plugin in your browser, with nothing to install.

= Getting started =

1. **Select a menu item.** In the Site Editor or the block editor, select a link or submenu inside a Navigation block.
2. **Add an icon.** Click **Add icon** in the block toolbar and choose from the icon library, paste SVG code, or pick an SVG from the Media Library if your site allows SVG uploads.
3. **Style the whole menu.** Select the Navigation block and set **Default Icon Settings** in the sidebar: size, spacing, position, label visibility and more. Every item follows them.
4. **Override where needed.** On any item, turn off **Use default icon settings** to give it its own settings and colors.

= Key features =

**Icons from anywhere**

* 297 built-in icons, from WordPress's own icon set plus social and brand logos, searchable by name and category
* On WordPress 7.1 and later, icons registered with the WordPress Icon API, including core's icons and any collection added by your theme or another plugin
* Paste your own SVG code, with a live preview
* Pick an SVG from the Media Library, on sites that allow SVG uploads
* Icon sets added with the [Icon Block](https://wordpress.org/plugins/icon-block/) plugin appear in the library too

**Layout**

* Icon before or after the label
* Icon-only items: hide the label visually while screen readers still announce it, for social links and other compact menus
* Space-between layout for full-width menus
* Top, center or bottom alignment for labels that wrap onto several lines, plus a fine vertical offset
* Icon size and gap in px, em or rem

**Style**

* Icon color from the theme palette or any custom color
* A separate icon color on hover and keyboard focus
* Rotation in 15 degree steps, and horizontal or vertical flipping
* "No icon fill" for stroke-based icon sets such as Lucide

**Menu-wide defaults**

* Set every option once on the Navigation block and all of its items follow, including submenu items and menus loaded from a saved Navigation menu
* Items can keep the defaults or use their own settings
* Settings panels work like core's: common options are shown, the rest are added from the panel menu, and each can be reset on its own

= WordPress Icon API (WordPress 7.1+) =

On WordPress 7.1 and later the plugin works with core's SVG Icon API in both directions:

* Icons registered with the Icon API appear in the icon library next to the built-in set
* The built-in set is published as the `enable-navigation-icons` collection, so the core Icon block, other plugins and the REST API can use it too

On WordPress 6.9 and 7.0 everything else works the same, using the icons the plugin ships with.

= How icons are stored =

An icon picked from a library is stored by name, such as `enable-navigation-icons/wordpress-github` or `core/plus`, and turned into SVG when the page is rendered. Only custom SVG code and Media Library uploads are stored as markup, and that markup is sanitized before it is output.

Settings become CSS classes on the menu item, such as `has-icon__wordpress-github`, `has-icon-position__left` and `has-hidden-label`, so themes can target them.

= Supported blocks =

* `core/navigation`: default icon settings for the whole menu
* `core/navigation-link`: menu links
* `core/navigation-submenu`: submenu items
* `ollie/mega-menu`: dropdown items from the Ollie Menu Designer plugin

= Support & Contribute =

* **Support:** ask questions and report problems in the [support forum](https://wordpress.org/support/plugin/enable-navigation-icons/).
* **Contribute:** the code lives on [GitHub](https://github.com/bmx269/enable-navigation-icons). Bug reports and pull requests are welcome in the [issue tracker](https://github.com/bmx269/enable-navigation-icons/issues).

Enable Navigation Icons is written and maintained by Trent Stromkins.

= Credits =

Inspired by, and built on code and ideas from, [Enable Button Icons](https://github.com/ndiego/enable-button-icons) by Nick Diego.

== Installation ==

1. Install the plugin from *Plugins → Add New Plugin* by searching for "Enable Navigation Icons", or upload the `enable-navigation-icons` folder to `/wp-content/plugins/`.
2. Activate the plugin through the *Plugins* screen.
3. Open a template, template part or post that contains a Navigation block, in the Site Editor or the block editor.
4. Select a menu item and click **Add icon** in the block toolbar.

== Frequently Asked Questions ==

= Where are the icon settings? =

Select a menu item and look for **Icon settings** in the block sidebar's Settings tab. Menu-wide defaults are under **Default Icon Settings** on the Navigation block itself. Colors are in the Styles tab: **Default Icon Color** and **Default Icon Hover Color** on the Navigation block, and **Icon** and **Icon hover** on an item that doesn't use the defaults.

= Some options are missing from the settings panel =

Only the most common options are shown at first. Open the panel's **⋮** menu to add the others: space between, no icon fill, vertical alignment, offset, rotation and flipping. Any option that already has a value is always shown.

= Why is there no "Open Media Library" option? =

WordPress blocks SVG uploads by default, so the option only appears on sites that allow them, for example with an SVG upload plugin. You can still paste SVG code with **Add custom icon**.

= Are icon-only links accessible? =

Yes. **Hide label (icon only)** hides the text visually but keeps it in the page, so screen readers still announce the link by its label. In the editor the label shows faded while the item is selected, so you can still edit it.

= Does the hover color work for keyboard users? =

Yes. The hover color also applies when the item has keyboard focus.

= Does it work with any theme? =

It works with any theme that uses the Navigation block, which includes all block themes.

= Does it work with menus saved as Navigation menus? =

Yes. Icons work on items inside a saved Navigation menu as well as on items added directly to a Navigation block, and the Navigation block's defaults apply to both.

= Do I need WordPress 7.1? =

No. The plugin requires WordPress 6.9. WordPress 7.1 adds the Icon API, which brings more icons into the library and shares the plugin's icons with the rest of the site.

= Is SVG code saved into my posts and templates? =

Not for icons picked from a library: those are stored by name and rendered when the page loads. Custom SVG code and Media Library icons are stored with the item, because there is nothing else to look them up from.

= What happens if I deactivate the plugin? =

Icons stop being shown and the menu items show just their labels. The icon settings stay in the block attributes, so icons come back if you reactivate the plugin.

= Can I add my own icon sets? =

Yes. Icon sets registered for the [Icon Block](https://wordpress.org/plugins/icon-block/) plugin appear in the library, and on WordPress 7.1 and later so does any collection registered with the WordPress Icon API.

= Does it work with the Ollie Menu Designer plugin? =

Yes. Its mega menu dropdown items get the same icon options as standard menu items, and follow the Navigation block's defaults.

== Screenshots ==

1. How it works: add an icon from the block toolbar, pick one from the library, the Media Library or your own SVG, then style it per item or for the whole menu from the Navigation block.
2. A header menu with icons before each label, icon-only social links, and the hover color on Events.
3. Select a menu item and click Add icon in the block toolbar to browse the icon library or paste SVG code.
4. The Icon Library: 297 built-in icons by category, plus icons registered with the WordPress Icon API on WordPress 7.1 and later.
5. Icon settings for one item. The Instagram link hides its label, so only the icon shows on the site while screen readers still announce "Instagram".
6. Default Icon Settings on the Navigation block apply to every item in the menu.
7. Default icon and hover colors in the Navigation block's Styles tab.
8. Paste your own SVG, such as a Lucide icon, and check it in the preview before inserting it.

== Changelog ==

= 1.0.2 =

Adds icon-only menu items and an icon hover color, and makes the plugin lighter on every page. Existing icons render exactly as before; nothing needs to be migrated.

**New**

* Hide label (icon only): hide a navigation item's text visually while screen readers still announce it, so icon-only links such as social profiles stay accessible. Available per item and as a Navigation block default. In the editor the label is shown faded while the item is selected, so it can still be edited.
* Icon hover color: give icons a different color on hover and keyboard focus, per item or as a Navigation block default.
* The icon settings panels now work like core's block settings: common options are always visible, the rest can be added from the panel menu, every option can be reset on its own, and "Reset all" restores the defaults. Options you have already set are always shown.

**Fixes**

* Custom stroke-based SVG icons (such as Lucide) no longer disappear on the front end. Their stroke attributes were being removed by the SVG sanitizer, although the editor preview showed them correctly.
* Custom SVG icons with cut-out shapes keep their holes (`fill-rule` is now preserved).
* An icon color containing `$` followed by a digit no longer corrupts the menu markup.
* After a plugin update, browsers now load the updated stylesheet instead of a cached copy (the stylesheet was versioned by the theme's version).
* The icon stylesheet is printed once per page instead of once per navigation block type.
* No more failed Icon API requests when opening the icon library on WordPress versions without the Icon API.
* No more component deprecation warnings in the editor console on WordPress 6.9 and 7.0.

**Performance**

* Registering the bundled icons with the WordPress Icon API is about 50 times faster: icons are registered by file and only read and sanitized when used, instead of all ~300 being sanitized on every page load.
* The editor script is about 25% smaller (308 KB to 238 KB): it now uses WordPress's built-in serializer instead of bundling React's server renderer, and no longer loads lodash.

**Compatibility**

* Requires WordPress 6.9 or later (previously 6.3). Tested up to WordPress 7.2.

= 1.0.1 =

* Fix the distributed plugin package including the repository's version control directory, which inflated the download from roughly 170 KB to 916 KB. No functional changes.

= 1.0.0 =

First stable release. Adds support for the WordPress Icon API introduced in WordPress 7.1, alongside new rotation and flip controls. Existing icons are unaffected and no migration is required.

**WordPress Icon API support (WordPress 7.1+)**

* Browse icons registered with core's SVG Icon API directly in the icon library, including WordPress core's own icon set and any collection registered by your theme or another plugin
* Icons chosen from a collection are stored by name and rendered on the server, so no SVG markup is written into your post content
* The plugin's bundled icon set is published as an `enable-navigation-icons` icon collection, making all 297 icons available to the core Icon block, to other plugins, and over the REST API

**Cleaner post content on every supported version**

* Icons picked from the built-in library are now stored by name and resolved from data the plugin ships with, so post content stays free of SVG markup on WordPress 6.3 and later, not only on 7.1
* Content remains portable between sites running any supported WordPress version

**New icon controls**

* Rotate icons, in 15 degree steps, per navigation item or as a Navigation block default
* Flip icons horizontally and vertically, matching the core Icon block's controls and CSS class names
* Rotation and flipping combine correctly, and both work for built-in, custom, and collection icons

**Fixes and improvements**

* Fix editor interface strings not being translatable: text domains are now correct throughout and JavaScript strings are included in the translation template
* Fix icon size and rotation not applying to the editor preview for icons rendered from a collection
* Only download the icon registry when it is actually needed, rather than on every editor load
* Match the core Icon block's render model, using the CSS `rotate` property and `box-sizing` on icon SVGs so shared icons render consistently wherever they appear
* Two bundled icons that core's SVG sanitizer could not represent are now published correctly

**Compatibility**

* Tested with WordPress 7.1
* Requires WordPress 6.3 or later, and continues to run unchanged on 6.3 through 7.0
* Existing navigation icons keep working exactly as before, with no migration and no changes to the CSS classes themes target

= 0.2.1 =

* Confirm compatibility with WordPress 7.0
* Update npm dependencies
* Remove legacy WordPress 6.1 fallback code (minimum version is 6.3)

= 0.2.0 =

* Add icon vertical alignment option (top, center, bottom) for multi-line menu items
* Add icon vertical offset for fine-tuning icon position (supports px, %, em, rem units)
* Add WordPress Playground support for local development and testing
* Fix icon size and spacing not applying to submenu/dropdown items rendered as button elements
* Update Node.js to 22 LTS and update npm dependencies

= 0.1.1 =

* Fix submenu icon not appearing on parent item when children have their own icons
* Fix icon injection for submenu items rendered as button elements (click-to-open mode)
* Fix icon styles leaking from parent submenu into child navigation items in editor and frontend
* Fix block error when adding custom icon to navigation item with no existing icon

= 0.1.0 =

* Initial release
* Icon selection (library, media, custom SVG)
* Icon positioning (left/right, space between)
* Icon styling (size, spacing, color, no fill option)
* Navigation block default settings
* Support for core/navigation-link and core/navigation-submenu blocks
* Support for Ollie Menu Designer mega menu blocks

== Upgrade Notice ==

= 1.0.2 =
Adds icon-only menu items and an icon hover color, and makes the plugin lighter on every page. Requires WordPress 6.9 or later. Existing icons are unaffected.

= 1.0.1 =
Packaging fix only, reducing the download size. No functional changes from 1.0.0.

= 1.0.0 =
First stable release. Adds WordPress 7.1 Icon API support, icon rotation and flipping, and fixes editor translations. Existing icons are unaffected and no migration is needed.

= 0.2.1 =
Confirmed compatibility with WordPress 7.0.

= 0.2.0 =
New icon vertical alignment and offset controls for multi-line menu items. Fixes submenu icon sizing.

= 0.1.1 =
Bug fixes for submenu icon rendering and custom icon insertion.

= 0.1.0 =
Initial release of Enable Navigation Icons.
