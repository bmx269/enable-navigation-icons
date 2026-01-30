# Enable Navigation Icons

Easily add icons to Navigation Block items in WordPress.

## Features

### Icon Selection
- **Icon Library** - Browse and select from a curated collection of WordPress icons
- **Media Library** - Upload and use custom SVG icons from your media library
- **Custom SVG** - Paste custom SVG code directly for complete flexibility

### Icon Positioning
- **Left/Right Placement** - Position icons before or after navigation link text
- **Space Between** - Justify content with space between icon and text for full-width layouts

### Icon Styling
- **Icon Size** - Adjust icon dimensions with a slider control (supports px, em, rem units)
- **Icon Spacing** - Control the gap between icon and text (supports px, em, rem units)
- **Icon Color** - Choose from theme colors or set a custom color
- **No Fill Option** - Support for stroke-based icons (e.g., Lucide icons)

### Navigation Block Default Settings
Set default icon settings at the Navigation block level that apply to all child navigation items:
- **Global Defaults** - Configure size, spacing, color, position, and styling once for the entire navigation
- **Item-Level Overrides** - Individual navigation items can inherit defaults or use custom settings
- **Nested Support** - Works seamlessly with multiple and nested Navigation blocks
- **Menu Support** - Applies to both inline navigation items and dynamically loaded WordPress menus

This feature streamlines icon management for large navigation menus by eliminating repetitive configuration while maintaining flexibility for individual items.

### Supported Blocks
- `core/navigation` - Navigation block (for setting default icon settings)
- `core/navigation-link` - Standard navigation links
- `core/navigation-submenu` - Submenu/dropdown navigation items
- `ollie/mega-menu` - Ollie Menu Designer dropdown menu items

## Requirements

- WordPress 6.3 or higher
- PHP 7.4 or higher

## Installation

1. Download the plugin zip file
2. Go to **Plugins > Add New** in your WordPress admin
3. Click **Upload Plugin** and select the zip file
4. Activate the plugin

## Usage

### Adding Icons to Navigation Items

1. Add or edit a Navigation block in the block editor
2. Select a navigation link or submenu item
3. Click **Add icon** in the block toolbar
4. Choose an icon from the library, upload from media, or paste custom SVG
5. Adjust icon settings in the block sidebar:
   - Toggle icon position (left/right)
   - Enable space between justification
   - Set icon size and spacing
   - Choose icon color
   - Enable "No icon fill" for stroke-based icons

### Setting Navigation Block Defaults

To apply consistent icon settings across all navigation items:

1. Select the Navigation block (parent container)
2. Open the block settings sidebar
3. Configure **Default Icon Settings**:
   - Set default icon size
   - Set default icon spacing
   - Choose default icon color
   - Set default icon position (left/right)
   - Enable default space between justification
   - Enable "No icon fill" for stroke-based icons by default
4. All navigation items will inherit these settings automatically

### Overriding Defaults for Individual Items

Individual navigation items can override Navigation block defaults:

1. Select a navigation link or submenu item
2. In the block sidebar, locate **Icon Settings**
3. Toggle off **Use default icon settings**
4. Configure custom settings for this specific item

When "Use default icon settings" is enabled (default), the item inherits all settings from the parent Navigation block. When disabled, the item uses its own custom settings.

## Development

```bash
# Install dependencies
npm install

# Start development build with watch
npm start

# Build for production
npm run build
```

## License

GPLv2 or later. See [LICENSE](LICENSE) for details.
