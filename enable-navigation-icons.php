<?php
/**
 * Plugin Name:         Enable Navigation Icons
 * Plugin URI:          https://github.com/bmx269/enable-navigation-icons
 * Description:         Easily add icons to Navigation Block items.
 * Version:             0.3.0
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
 * Collection slug used when publishing this plugin's icons to the WordPress
 * Icon API registry (WordPress 7.1+).
 *
 * @since 0.3.0
 */
const ENABLE_NAVIGATION_ICONS_COLLECTION = 'enable-navigation-icons';

/**
 * Determine whether the WordPress Icon API is available.
 *
 * The registration and rendering helpers landed in WordPress 7.1. Every call
 * site guards on this so the plugin keeps working unchanged on 6.3 - 7.0.
 *
 * @since 0.3.0
 * @return bool True when the Icon API can be used.
 */
function enable_navigation_icons_has_icon_api() {
	return function_exists( 'wp_get_icon' )
		&& function_exists( 'wp_register_icon' )
		&& function_exists( 'wp_register_icon_collection' );
}

/**
 * Determine whether an icon name refers to the WordPress Icon API registry.
 *
 * Registry names are always namespaced as `collection/icon-name`, while the
 * plugin's own historical names are bare slugs such as `wordpress-github`. The
 * slash is therefore an unambiguous discriminator, which is what allows content
 * created by earlier versions to keep rendering with no migration at all.
 *
 * @since 0.3.0
 * @param string $icon_name The stored iconName attribute.
 * @return bool True when the name refers to the icon registry.
 */
function enable_navigation_icons_is_registry_icon( $icon_name ) {
	return is_string( $icon_name ) && false !== strpos( $icon_name, '/' );
}

/**
 * Determine whether an icon name belongs to this plugin's own collection.
 *
 * Own-collection names resolve from the shipped manifest rather than the
 * Icon API, so they work on every supported WordPress version.
 *
 * @since 0.3.0
 * @param string $icon_name The stored iconName attribute.
 * @return bool True when the name is in the plugin's own collection.
 */
function enable_navigation_icons_is_own_collection_name( $icon_name ) {
	return is_string( $icon_name )
		&& 0 === strpos( $icon_name, ENABLE_NAVIGATION_ICONS_COLLECTION . '/' );
}

/**
 * Build the `has-icon__*` class suffix for an icon name.
 *
 * Slashes in namespaced registry names are converted to hyphens so the result
 * is a valid CSS class (`core/plus` becomes `core-plus`). The plugin's own
 * collection prefix is dropped entirely, so a bundled icon picked on 0.3.0
 * (`enable-navigation-icons/wordpress-github`) produces the same
 * `has-icon__wordpress-github` class as earlier versions — existing theme CSS
 * keeps matching. Bare legacy names are unaffected.
 *
 * Must stay in sync with `getIconClassSuffix()` in src/utils/use-core-icons.js.
 *
 * @since 0.3.0
 * @param string $icon_name The stored iconName attribute.
 * @return string The sanitized class suffix.
 */
function enable_navigation_icons_icon_class_suffix( $icon_name ) {
	if ( ! is_string( $icon_name ) ) {
		return '';
	}

	if ( enable_navigation_icons_is_own_collection_name( $icon_name ) ) {
		$icon_name = substr( $icon_name, strlen( ENABLE_NAVIGATION_ICONS_COLLECTION ) + 1 );
	}

	return sanitize_html_class( str_replace( '/', '-', $icon_name ) );
}

/**
 * Load the generated icon manifest, once per request.
 *
 * @since 0.3.0
 * @return array The manifest, keyed by unqualified icon name.
 */
function enable_navigation_icons_get_manifest() {
	static $manifest = null;

	if ( null === $manifest ) {
		$manifest_path = plugin_dir_path( __FILE__ ) . 'build/icon-manifest.php';
		$manifest      = file_exists( $manifest_path ) ? include $manifest_path : array();

		if ( ! is_array( $manifest ) ) {
			$manifest = array();
		}
	}

	return $manifest;
}

/**
 * Resolve an own-collection icon name from the shipped manifest.
 *
 * This is the version-independent path: bundled icons stored by name render
 * from the plugin's own data on WordPress 6.3 just as on 7.1 — the Icon API
 * is never required for them.
 *
 * @since 0.3.0
 * @param string $icon_name The namespaced icon name.
 * @return string The SVG markup, or an empty string when unknown.
 */
function enable_navigation_icons_get_manifest_icon( $icon_name ) {
	if ( ! enable_navigation_icons_is_own_collection_name( $icon_name ) ) {
		return '';
	}

	$manifest = enable_navigation_icons_get_manifest();
	$bare     = substr( $icon_name, strlen( ENABLE_NAVIGATION_ICONS_COLLECTION ) + 1 );

	return isset( $manifest[ $bare ]['content'] ) ? $manifest[ $bare ]['content'] : '';
}

/**
 * Resolve the SVG markup for an icon stored by registry name.
 *
 * The plugin's own collection is resolved from the shipped manifest first —
 * no Icon API needed, so those names work on WordPress 6.3+. Anything else
 * (core and third-party collections) requires wp_get_icon() from 7.1.
 *
 * @since 0.3.0
 * @param string $icon_name The namespaced icon name.
 * @return string The SVG markup, or an empty string when unavailable.
 */
function enable_navigation_icons_get_registry_icon( $icon_name ) {
	if ( ! enable_navigation_icons_is_registry_icon( $icon_name ) ) {
		return '';
	}

	$manifest_icon = enable_navigation_icons_get_manifest_icon( $icon_name );
	if ( '' !== $manifest_icon ) {
		return $manifest_icon;
	}

	if ( ! enable_navigation_icons_has_icon_api() ) {
		return '';
	}

	// `size => null` preserves the icon's own dimensions so the plugin's CSS
	// custom properties stay in control of sizing.
	return (string) wp_get_icon( $icon_name, array( 'size' => null ) );
}

/**
 * Publish this plugin's bundled icons to the WordPress Icon API registry.
 *
 * This makes the icon set available to the core Icon block, to other plugins,
 * and over the REST API - not just inside navigation items.
 *
 * @since 0.3.0
 */
function enable_navigation_icons_register_icons() {
	if ( ! enable_navigation_icons_has_icon_api() ) {
		return;
	}

	$manifest = enable_navigation_icons_get_manifest();

	if ( empty( $manifest ) ) {
		return;
	}

	$registered = wp_register_icon_collection(
		ENABLE_NAVIGATION_ICONS_COLLECTION,
		array(
			'label'       => __( 'Navigation Icons', 'enable-navigation-icons' ),
			'description' => __( 'Icons bundled with the Enable Navigation Icons plugin.', 'enable-navigation-icons' ),
		)
	);

	if ( ! $registered ) {
		return;
	}

	foreach ( $manifest as $name => $icon ) {
		if ( empty( $icon['content'] ) ) {
			continue;
		}

		wp_register_icon(
			ENABLE_NAVIGATION_ICONS_COLLECTION . '/' . $name,
			array(
				'label'   => isset( $icon['label'] ) ? $icon['label'] : $name,
				'content' => $icon['content'],
			)
		);
	}
}
// Priority 11 so core has finished registering its own collections (init 0)
// and icons (init 10) first.
add_action( 'init', 'enable_navigation_icons_register_icons', 11 );

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
	// Skip rendering during REST API requests to prevent icon HTML from being saved.
	// This allows rendering in the editor preview iframe so users can see icon changes.
	if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
		return $block_content;
	}

	if ( ! isset( $block['attrs']['icon'] ) && ! isset( $block['attrs']['iconName'] ) ) {
		return $block_content;
	}

	$icon      = isset( $block['attrs']['icon'] ) ? $block['attrs']['icon'] : '';
	$icon_name = isset( $block['attrs']['iconName'] ) ? $block['attrs']['iconName'] : 'custom';

	// Icons chosen from the WordPress Icon API store only their registry name,
	// so resolve the markup now. Content created by earlier plugin versions
	// still carries its own SVG in the `icon` attribute and takes precedence,
	// which is why no migration is needed.
	$is_registry_icon = '' === $icon && enable_navigation_icons_is_registry_icon( $icon_name );

	if ( $is_registry_icon ) {
		$icon = enable_navigation_icons_get_registry_icon( $icon_name );

		// The icon is no longer registered, or this WordPress version has no
		// Icon API. Leave the markup untouched rather than emitting an empty
		// icon wrapper.
		if ( '' === $icon ) {
			return $block_content;
		}
	}

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

	$icon_vertical_align = $use_default_settings && ! empty( $parent_defaults['defaultIconVerticalAlign'] )
		? $parent_defaults['defaultIconVerticalAlign']
		: ( isset( $block['attrs']['iconVerticalAlign'] ) ? $block['attrs']['iconVerticalAlign'] : '' );

	$icon_rotate = $use_default_settings && ! empty( $parent_defaults['defaultIconRotate'] )
		? $parent_defaults['defaultIconRotate']
		: ( isset( $block['attrs']['iconRotate'] ) ? $block['attrs']['iconRotate'] : 0 );

	$icon_offset = $use_default_settings && ! empty( $parent_defaults['defaultIconOffset'] )
		? $parent_defaults['defaultIconOffset']
		: ( isset( $block['attrs']['iconOffset'] ) ? $block['attrs']['iconOffset'] : '' );

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
	if ( $icon_offset ) {
		$icon_styles[] = 'position:relative';
		$icon_styles[] = 'top:' . esc_attr( $icon_offset );
	}
	// Rotation is applied to the icon wrapper, so it is independent of where
	// the icon came from and works for bundled, custom and registry icons.
	if ( ! empty( $icon_rotate ) && is_numeric( $icon_rotate ) ) {
		$icon_styles[] = 'transform:rotate(' . (int) $icon_rotate . 'deg)';
	}

	$icon_style_attr = ! empty( $icon_styles ) ? ' style="' . esc_attr( implode( ';', $icon_styles ) ) . '"' : '';

	// Append the icon class to the navigation item (<li> tag).
	$p = new WP_HTML_Tag_Processor( $block_content );

	// Find the <li> tag (navigation item container)
	if ( $p->next_tag( 'li' ) ) {
		$p->add_class( 'has-icon__' . enable_navigation_icons_icon_class_suffix( $icon_name ) );
		if ( $justify_space_between ) {
			$p->add_class( 'has-justified-space-between' );
		}
		if ( $has_no_icon_fill ) {
			$p->add_class( 'has-no-icon-fill' );
		}
		if ( $position_left ) {
			$p->add_class( 'has-icon-position__left' );
		}
		if ( $icon_vertical_align && 'center' !== $icon_vertical_align ) {
			$p->add_class( 'has-icon-align__' . sanitize_html_class( $icon_vertical_align ) );
		}
	}
	$block_content = $p->get_updated_html();

	// Now apply custom properties to the element with class wp-block-navigation-item__content.
	// This can be an <a> tag (navigation-link) or a <button> tag (navigation-submenu).
	if ( ! empty( $link_styles ) ) {
		$p     = new WP_HTML_Tag_Processor( $block_content );
		$found = false;

		while ( $p->next_tag() && ! $found ) {
			$class_attr = $p->get_attribute( 'class' );
			if ( $class_attr && strpos( $class_attr, 'wp-block-navigation-item__content' ) !== false ) {
				$existing_style = $p->get_attribute( 'style' );
				$new_styles     = esc_attr( implode( ';', $link_styles ) );
				$final_style    = $existing_style ? $existing_style . ';' . $new_styles : $new_styles;
				$p->set_attribute( 'style', $final_style );
				$found = true;
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

	// Check if the first navigation content element already has an icon to avoid duplicates.
	// Only check the first matching element, not the entire block content, so that
	// child items with their own icons don't prevent the parent from getting its icon.
	if ( preg_match( '/(<(?:a|button)[^>]*class="[^"]*wp-block-navigation-item__content[^"]*"[^>]*>)(.*?)(<\/(?:a|button)>)/is', $block_content, $first_element ) ) {
		if ( strpos( $first_element[0], 'wp-block-navigation-item__icon' ) !== false ) {
			return $block_content;
		}
	}

	// Sanitize the icon SVG. Markup that came from the Icon API registry was
	// already sanitized by core at registration and again by wp_get_icon(), so
	// it is used as-is; running it through this allowlist would only risk
	// stripping attributes core deliberately adds.
	$sanitized_icon = $is_registry_icon ? $icon : wp_kses( $icon, $allowed_svg_tags );

	// Add the SVG icon either to the left or right of the navigation item text.
	$icon_markup = '<span class="wp-block-navigation-item__icon' . $icon_color_class . '" aria-hidden="true"' . $icon_style_attr . '>' . $sanitized_icon . '</span>';

	// Inject icon inside the first element with wp-block-navigation-item__content class.
	// Handles both <a> (hover mode) and <button> (click mode) tags.
	// Limit to first match to avoid leaking into child navigation items.
	$block_content = $position_left
		? preg_replace( '/(<(?:a|button)[^>]*class="[^"]*wp-block-navigation-item__content[^"]*"[^>]*>)(.*?)(<\/(?:a|button)>)/is', '$1' . $icon_markup . '$2$3', $block_content, 1 )
		: preg_replace( '/(<(?:a|button)[^>]*class="[^"]*wp-block-navigation-item__content[^"]*"[^>]*>)(.*?)(<\/(?:a|button)>)/is', '$1$2' . $icon_markup . '$3', $block_content, 1 );

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
