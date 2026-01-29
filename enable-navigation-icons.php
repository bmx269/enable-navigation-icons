<?php
/**
 * Plugin Name:         Enable Navigation Icons
 * Plugin URI:          https://www.smallrobot.co
 * Description:         Easily add icons to Navigation Block items.
 * Version:             0.0.1
 * Requires at least:   6.3
 * Requires PHP:        7.4
 * Author:              Trent Stromkins
 * Author URI:          https://www.smallrobot.co
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
		$asset_file['version']
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
			plugin_dir_url( __FILE__ ) . 'build/editor.css'
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
 * Render icons on the frontend for navigation items.
 *
 * @since 0.1.0
 * @param string $block_content The block content.
 * @param array  $block         The block data.
 * @return string Modified block content with icon.
 */
function enable_navigation_icons_render_block_navigation( $block_content, $block ) {
	if ( ! isset( $block['attrs']['icon'] ) && ! isset( $block['attrs']['iconName'] ) ) {
		return $block_content;
	}

	$icon                 = isset( $block['attrs']['icon'] ) ? $block['attrs']['icon'] : '';
	$icon_name            = isset( $block['attrs']['iconName'] ) ? $block['attrs']['iconName'] : 'custom';
	$position_left        = isset( $block['attrs']['iconPositionLeft'] ) ? $block['attrs']['iconPositionLeft'] : false;
	$justify_space_between = isset( $block['attrs']['justifySpaceBetween'] ) ? $block['attrs']['justifySpaceBetween'] : false;
	$has_no_icon_fill     = isset( $block['attrs']['hasNoIconFill'] ) ? $block['attrs']['hasNoIconFill'] : false;
	$icon_size            = isset( $block['attrs']['iconSize'] ) ? $block['attrs']['iconSize'] : '';
	$icon_spacing         = isset( $block['attrs']['iconSpacing'] ) ? $block['attrs']['iconSpacing'] : '';

	$icon_color_class = '';
	$icon_color       = '';
	if ( isset( $block['attrs']['iconColor'] ) ) {
		$icon_color_class = ' has-' . sanitize_html_class( $block['attrs']['iconColor'] ) . '-color';
	} elseif ( isset( $block['attrs']['customIconColor'] ) ) {
		$icon_color = 'style="color:' . esc_attr( $block['attrs']['customIconColor'] ) . ';"';
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
	if ( isset( $block['attrs']['customIconColor'] ) ) {
		$icon_styles[] = 'color:' . esc_attr( $block['attrs']['customIconColor'] );
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
add_filter( 'render_block_core/navigation-link', 'enable_navigation_icons_render_block_navigation', 10, 2 );
add_filter( 'render_block_core/navigation-submenu', 'enable_navigation_icons_render_block_navigation', 10, 2 );
