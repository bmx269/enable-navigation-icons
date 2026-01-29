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

### Supported Blocks
- `core/navigation-link` - Standard navigation links
- `core/navigation-submenu` - Submenu/dropdown navigation items

## Requirements

- WordPress 6.3 or higher
- PHP 7.4 or higher

## Installation

1. Download the plugin zip file
2. Go to **Plugins > Add New** in your WordPress admin
3. Click **Upload Plugin** and select the zip file
4. Activate the plugin

## Usage

1. Add or edit a Navigation block in the block editor
2. Select a navigation link or submenu item
3. Click **Add icon** in the block toolbar
4. Choose an icon from the library, upload from media, or paste custom SVG
5. Adjust icon settings in the block sidebar:
   - Toggle icon position (left/right)
   - Enable space between justification
   - Set icon size and spacing
   - Choose icon color

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
