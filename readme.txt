=== Enable Navigation Icons ===
Contributors: bmx269
Tags: navigation, icons, menu, block editor, gutenberg
Requires at least: 6.3
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html

Easily add icons to Navigation Block items in WordPress.

== Description ==

Enable Navigation Icons makes it simple to add and customize icons for your WordPress Navigation Block items. Whether you're building a simple menu or complex mega menu navigation, this plugin provides intuitive controls for adding beautiful icons to your navigation links.

**Recommended Companion Plugin:** Use the [Icon Block](https://wordpress.org/plugins/icon-block/) plugin to add custom icon sets and expand your icon library options. Icon Block is a powerful companion that allows you to register additional icon libraries for use with Enable Navigation Icons.

= Key Features =

**Icon Selection**
* Browse and select from a curated collection of WordPress icons
* Upload and use custom SVG icons from your media library
* Paste custom SVG code directly for complete flexibility

**Icon Positioning**
* Position icons before or after navigation link text (left/right)
* Space between justification for full-width layouts
* Flexible alignment options

**Icon Styling**
* Adjust icon dimensions with a slider control (supports px, em, rem units)
* Control the gap between icon and text (supports px, em, rem units)
* Choose from theme colors or set a custom color
* Support for stroke-based icons with "No Fill" option (e.g., Lucide icons)

**Navigation Block Default Settings**
Set default icon settings at the Navigation block level that apply to all child navigation items:
* Configure size, spacing, color, position, and styling once for the entire navigation
* Individual navigation items can inherit defaults or use custom settings
* Works seamlessly with multiple and nested Navigation blocks
* Applies to both inline navigation items and dynamically loaded WordPress menus

This feature streamlines icon management for large navigation menus by eliminating repetitive configuration while maintaining flexibility for individual items.

**Ollie Menu Designer Integration**
Full support for the Ollie Menu Designer plugin's mega menu dropdown items:
* Add icons to Ollie mega menu dropdown navigation items
* Same icon selection and styling options as standard navigation items
* Works seamlessly with Ollie themes and the Menu Designer plugin

= Supported Blocks =

* `core/navigation` - Navigation block (for setting default icon settings)
* `core/navigation-link` - Standard navigation links
* `core/navigation-submenu` - Submenu/dropdown navigation items
* `ollie/mega-menu` - Ollie Menu Designer dropdown menu items (requires Ollie Menu Designer plugin)

= Credits =

This plugin was inspired by and incorporates code and ideas from the [enable-button-icons](https://github.com/ndiego/enable-button-icons) project. Special thanks to @ndiego for his excellent work on button icon functionality, which served as a foundation for implementing navigation icon features.

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/enable-navigation-icons` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. Add or edit a Navigation block in the block editor.
4. Select a navigation link or submenu item.
5. Click "Add icon" in the block toolbar to get started.

== Frequently Asked Questions ==

= Does this work with any theme? =

Yes! Enable Navigation Icons works with any WordPress theme that supports the block editor and Navigation blocks.

= Can I use custom SVG icons? =

Absolutely! You can use icons from the built-in library, upload SVG files from your media library, or paste custom SVG code directly.

= Does this work with WordPress menus? =

Yes! The plugin works with both inline navigation items and dynamically loaded WordPress menus.

= Can I set default icon settings for the entire navigation? =

Yes! Select the Navigation block (parent container) and configure default icon settings that will apply to all child navigation items. Individual items can still override these defaults if needed.

= Does it work with the Ollie Menu Designer plugin? =

Yes! The plugin fully supports Ollie Menu Designer's mega menu dropdown items with the same functionality as standard navigation items.

== Screenshots ==

1. Icon selection interface showing library, media, and custom SVG options
2. Icon positioning and styling controls in the block sidebar
3. Navigation block with default icon settings panel
4. Example navigation with icons in various styles and positions

== Changelog ==

= 0.1.0 =
* Initial release
* Icon selection (library, media, custom SVG)
* Icon positioning (left/right, space between)
* Icon styling (size, spacing, color, no fill option)
* Navigation block default settings
* Support for core/navigation-link and core/navigation-submenu blocks
* Support for Ollie Menu Designer mega menu blocks

== Upgrade Notice ==

= 0.1.0 =
Initial release of Enable Navigation Icons.
