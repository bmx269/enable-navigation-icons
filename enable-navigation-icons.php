<?php
/**
 * Plugin Name:         Enable Navigation Icons
 * Plugin URI:          https://github.com/bmx269/enable-navigation-icons
 * Description:         Easily add icons to Navigation Block items.
 * Version:             0.0.1
 * Requires at least:   6.3
 * Requires PHP:        7.4
 * Author:              Trent Stromkins
 * Author URI:          https://smallrobot.co
 * License:             GPLv2
 * License URI:         https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * Text Domain:         enable-navigation-icons
 * Domain Path:         /languages
 *
 * @package enable-navigation-icons
 */

defined( 'ABSPATH' ) || exit;

/**
 * Enqueue Editor scripts.
 *
 * @since 0.1.0
 */
function enable_navigation_icons_enqueue_block_editor_assets() {
	$asset_file = include plugin_dir_path( __FILE__ ) . 'build/index.asset.php';

	wp_enqueue_script(
		'enable-navigation-icons-editor-scripts',
		plugin_dir_url( __FILE__ ) . 'build/index.js',
		$asset_file['dependencies'],
		$asset_file['version'],
		true
	);

	wp_set_script_translations(
		'enable-navigation-icons-editor-scripts',
		'enable-navigation-icons',
		plugin_dir_path( __FILE__ ) . 'languages'
	);

}
add_action( 'enqueue_block_editor_assets', 'enable_navigation_icons_enqueue_block_editor_assets' );

/**
 * Enqueue Editor styles.
 *
 * @since 0.1.0
 */
function enable_navigation_icons_enqueue_block_assets() {
	if ( is_admin() ) {
		$asset_file = include plugin_dir_path( __FILE__ ) . 'build/index.asset.php';

		wp_enqueue_style(
			'enable-navigation-icons-editor-styles',
			plugin_dir_url( __FILE__ ) . 'build/editor.css',
			array(),
			$asset_file['version']
		);
	}
}
add_action( 'enqueue_block_assets', 'enable_navigation_icons_enqueue_block_assets' );

/**
 * Enqueue block styles for navigation-link block.
 * (Applies to both frontend and Editor)
 *
 * @since 0.1.0
 */
function enable_navigation_icons_block_styles_link() {
	wp_enqueue_block_style(
		'core/navigation-link',
		array(
			'handle' => 'enable-navigation-icons-block-styles',
			'src'    => plugin_dir_url( __FILE__ ) . 'build/style.css',
			'ver'    => wp_get_theme()->get( 'Version' ),
			'path'   => plugin_dir_path( __FILE__ ) . 'build/style.css',
		)
	);
}
add_action( 'init', 'enable_navigation_icons_block_styles_link' );

/**
 * Enqueue block styles for navigation-submenu block.
 * (Applies to both frontend and Editor)
 *
 * @since 0.1.0
 */
function enable_navigation_icons_block_styles_submenu() {
	wp_enqueue_block_style(
		'core/navigation-submenu',
		array(
			'handle' => 'enable-navigation-icons-block-styles-submenu',
			'src'    => plugin_dir_url( __FILE__ ) . 'build/style.css',
			'ver'    => wp_get_theme()->get( 'Version' ),
			'path'   => plugin_dir_path( __FILE__ ) . 'build/style.css',
		)
	);
}
add_action( 'init', 'enable_navigation_icons_block_styles_submenu' );

/**
 * Enqueue block styles for Ollie mega-menu block.
 * (Applies to both frontend and Editor)
 *
 * @since 0.1.0
 */
function enable_navigation_icons_block_styles_ollie_mega_menu() {
	wp_enqueue_block_style(
		'ollie/mega-menu',
		array(
			'handle' => 'enable-navigation-icons-block-styles-ollie-mega-menu',
			'src'    => plugin_dir_url( __FILE__ ) . 'build/style.css',
			'ver'    => wp_get_theme()->get( 'Version' ),
			'path'   => plugin_dir_path( __FILE__ ) . 'build/style.css',
		)
	);
}
add_action( 'init', 'enable_navigation_icons_block_styles_ollie_mega_menu' );

/**
 * Render icons on the frontend for navigation items.
 *
 * @since 0.1.0
 * @param string $block_content The block content.
 * @param array  $block         The block data.
 * @param object $instance      The block instance.
 * @return string Modified block content with icon.
 */
function enable_navigation_icons_render_block_navigation( $block_content, $block, $instance ) {
	if ( ! isset( $block['attrs']['icon'] ) && ! isset( $block['attrs']['iconName'] ) ) {
		return $block_content;
	}

	$icon      = isset( $block['attrs']['icon'] ) ? $block['attrs']['icon'] : '';
	$icon_name = isset( $block['attrs']['iconName'] ) ? $block['attrs']['iconName'] : 'custom';

	// Check if we should use default settings from the parent Navigation block.
	$use_default_settings = ! isset( $block['attrs']['useDefaultIconSettings'] ) || $block['attrs']['useDefaultIconSettings'] === true;

	// Get parent Navigation block's default settings if they exist.
	$parent_defaults = array();
	if ( $use_default_settings ) {
		$parent_defaults = enable_navigation_icons_get_parent_defaults( $block );
	}

	// Determine effective settings (use defaults if enabled, otherwise use item-specific settings).
	$position_left = $use_default_settings && isset( $parent_defaults['defaultIconPositionLeft'] )
		? $parent_defaults['defaultIconPositionLeft']
		: ( isset( $block['attrs']['iconPositionLeft'] ) ? $block['attrs']['iconPositionLeft'] : false );

	$justify_space_between = $use_default_settings && isset( $parent_defaults['defaultJustifySpaceBetween'] )
		? $parent_defaults['defaultJustifySpaceBetween']
		: ( isset( $block['attrs']['justifySpaceBetween'] ) ? $block['attrs']['justifySpaceBetween'] : false );

	$has_no_icon_fill = $use_default_settings && isset( $parent_defaults['defaultHasNoIconFill'] )
		? $parent_defaults['defaultHasNoIconFill']
		: ( isset( $block['attrs']['hasNoIconFill'] ) ? $block['attrs']['hasNoIconFill'] : false );

	$icon_size = $use_default_settings && ! empty( $parent_defaults['defaultIconSize'] )
		? $parent_defaults['defaultIconSize']
		: ( isset( $block['attrs']['iconSize'] ) ? $block['attrs']['iconSize'] : '' );

	$icon_spacing = $use_default_settings && ! empty( $parent_defaults['defaultIconSpacing'] )
		? $parent_defaults['defaultIconSpacing']
		: ( isset( $block['attrs']['iconSpacing'] ) ? $block['attrs']['iconSpacing'] : '' );

	// Determine effective custom icon color.
	$custom_icon_color = $use_default_settings && ! empty( $parent_defaults['defaultCustomIconColor'] )
		? $parent_defaults['defaultCustomIconColor']
		: ( isset( $block['attrs']['customIconColor'] ) ? $block['attrs']['customIconColor'] : '' );

	$icon_color_class = '';
	$icon_color       = '';
	if ( isset( $block['attrs']['iconColor'] ) ) {
		$icon_color_class = ' has-' . sanitize_html_class( $block['attrs']['iconColor'] ) . '-color';
	} elseif ( $custom_icon_color ) {
		$icon_color = 'style="color:' . esc_attr( $custom_icon_color ) . ';"';
	}

	// Build inline styles for icon size and color.
	$icon_styles = array();
	$link_styles = array();

	if ( $icon_size ) {
		// Set CSS custom properties for icon sizing.
		$link_styles[] = '--icon-size:' . esc_attr( $icon_size );
	}
	if ( $icon_spacing ) {
		$link_styles[] = '--icon-spacing:' . esc_attr( $icon_spacing );
	}
	if ( $custom_icon_color ) {
		$icon_styles[] = 'color:' . esc_attr( $custom_icon_color );
	}

	$icon_style_attr = ! empty( $icon_styles ) ? ' style="' . esc_attr( implode( ';', $icon_styles ) ) . '"' : '';

	// Append the icon class to the navigation item (<li> tag).
	$p = new WP_HTML_Tag_Processor( $block_content );

	// Find the <li> tag (navigation item container)
	if ( $p->next_tag( 'li' ) ) {
		$p->add_class( 'has-icon__' . sanitize_html_class( $icon_name ) );
		if ( $justify_space_between ) {
			$p->add_class( 'has-justified-space-between' );
		}
		if ( $has_no_icon_fill ) {
			$p->add_class( 'has-no-icon-fill' );
		}
		if ( $position_left ) {
			$p->add_class( 'has-icon-position__left' );
		}
	}
	$block_content = $p->get_updated_html();

	// Now apply custom properties to the <a> tag with class wp-block-navigation-item__content
	$p = new WP_HTML_Tag_Processor( $block_content );
	if ( ! empty( $link_styles ) ) {
		// Find the anchor tag within the navigation item
		while ( $p->next_tag( 'a' ) ) {
			$class_attr = $p->get_attribute( 'class' );
			// Check if this is the navigation item content link
			if ( $class_attr && strpos( $class_attr, 'wp-block-navigation-item__content' ) !== false ) {
				$existing_style = $p->get_attribute( 'style' );
				$new_styles     = esc_attr( implode( ';', $link_styles ) );
				$final_style    = $existing_style ? $existing_style . ';' . $new_styles : $new_styles;
				$p->set_attribute( 'style', $final_style );
				break;
			}
		}
		$block_content = $p->get_updated_html();
	}

	// Sanitize SVG content to prevent XSS attacks.
	$allowed_svg_tags = array(
		'svg'      => array(
			'xmlns'       => true,
			'fill'        => true,
			'viewbox'     => true,
			'role'        => true,
			'aria-hidden' => true,
			'focusable'   => true,
			'width'       => true,
			'height'      => true,
			'class'       => true,
		),
		'path'     => array(
			'd'           => true,
			'fill'        => true,
			'stroke'      => true,
			'stroke-width' => true,
			'stroke-linecap' => true,
			'stroke-linejoin' => true,
		),
		'circle'   => array(
			'cx'     => true,
			'cy'     => true,
			'r'      => true,
			'fill'   => true,
			'stroke' => true,
		),
		'rect'     => array(
			'x'      => true,
			'y'      => true,
			'width'  => true,
			'height' => true,
			'fill'   => true,
			'stroke' => true,
		),
		'polygon'  => array(
			'points' => true,
			'fill'   => true,
			'stroke' => true,
		),
		'polyline' => array(
			'points' => true,
			'fill'   => true,
			'stroke' => true,
		),
		'line'     => array(
			'x1'     => true,
			'y1'     => true,
			'x2'     => true,
			'y2'     => true,
			'stroke' => true,
		),
		'g'        => array(
			'fill'   => true,
			'stroke' => true,
		),
	);

	// Sanitize the icon SVG.
	$sanitized_icon = wp_kses( $icon, $allowed_svg_tags );

	// Add the SVG icon either to the left or right of the navigation item text.
	$icon_markup = '<span class="wp-block-navigation-item__icon' . $icon_color_class . '" aria-hidden="true"' . $icon_style_attr . '>' . $sanitized_icon . '</span>';

	// Inject icon inside the <a> tag
	$block_content = $position_left
		? preg_replace( '/(<a[^>]*class="[^"]*wp-block-navigation-item__content[^"]*"[^>]*>)(.*?)(<\/a>)/i', '$1' . $icon_markup . '$2$3', $block_content )
		: preg_replace( '/(<a[^>]*class="[^"]*wp-block-navigation-item__content[^"]*"[^>]*>)(.*?)(<\/a>)/i', '$1$2' . $icon_markup . '$3', $block_content );

	return $block_content;
}
add_filter( 'render_block_core/navigation-link', 'enable_navigation_icons_render_block_navigation', 10, 3 );
add_filter( 'render_block_core/navigation-submenu', 'enable_navigation_icons_render_block_navigation', 10, 3 );
add_filter( 'render_block_ollie/mega-menu', 'enable_navigation_icons_render_block_navigation', 10, 3 );

/**
 * Capture Navigation block attributes when processing block data.
 * Uses a stack to handle multiple/nested Navigation blocks.
 *
 * @since 0.1.0
 * @param array $parsed_block The parsed block data.
 * @return array Unmodified block data.
 */
function enable_navigation_icons_capture_nav_defaults( $parsed_block ) {
	if ( 'core/navigation' === $parsed_block['blockName'] ) {
		global $enable_navigation_icons_nav_stack;

		if ( ! isset( $enable_navigation_icons_nav_stack ) ) {
			$enable_navigation_icons_nav_stack = array();
		}

		// Push Navigation attributes onto the stack.
		$nav_attrs = isset( $parsed_block['attrs'] ) ? $parsed_block['attrs'] : array();
		array_push( $enable_navigation_icons_nav_stack, $nav_attrs );
	}

	return $parsed_block;
}
add_filter( 'render_block_data', 'enable_navigation_icons_capture_nav_defaults', 5, 1 );

/**
 * Clean up Navigation stack after block finishes rendering.
 *
 * @since 0.1.0
 * @param string $block_content The rendered block content.
 * @param array  $block         The block data.
 * @return string Unmodified block content.
 */
function enable_navigation_icons_cleanup_nav_defaults( $block_content, $block ) {
	global $enable_navigation_icons_nav_stack;

	if ( isset( $enable_navigation_icons_nav_stack ) && ! empty( $enable_navigation_icons_nav_stack ) ) {
		array_pop( $enable_navigation_icons_nav_stack );
	}

	return $block_content;
}
add_filter( 'render_block_core/navigation', 'enable_navigation_icons_cleanup_nav_defaults', 1000, 2 );

/**
 * Get parent Navigation block's default icon settings from the stack.
 *
 * @since 0.1.0
 * @param array $block The current block data.
 * @return array Parent Navigation block's default settings.
 */
function enable_navigation_icons_get_parent_defaults( $block ) {
	global $enable_navigation_icons_nav_stack;

	// Return the most recent Navigation block's attributes from the stack.
	if ( isset( $enable_navigation_icons_nav_stack ) && ! empty( $enable_navigation_icons_nav_stack ) ) {
		return end( $enable_navigation_icons_nav_stack );
	}

	return array();
}
