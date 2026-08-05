/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';

/**
 * Prefix used for the inserter "type" of every core Icon API collection.
 *
 * Keeping core collections behind a prefix guarantees they can never collide
 * with the plugin's own bundled `wordpress` type, and it lets the rest of the
 * codebase recognise a core-sourced icon from its type alone.
 *
 * @since 0.3.0
 */
export const CORE_ICON_TYPE_PREFIX = 'wp-icons--';

/**
 * Module-level cache so the (potentially large) icon registry is only fetched
 * once per editor session, no matter how many navigation items are edited.
 *
 * @since 0.3.0
 */
let cache = null;
let pending = null;

/**
 * Determine whether an icon name refers to the core Icon API registry.
 *
 * Core icon names are always namespaced as `collection/icon-name`. The
 * plugin's own historical names are bare slugs (e.g. `wordpress-github`), so
 * the presence of a slash is an unambiguous discriminator and no data
 * migration is required for existing content.
 *
 * @since 0.3.0
 * @param {string} iconName The stored iconName attribute.
 * @return {boolean} True if the name refers to the core icon registry.
 */
export function isCoreIconName( iconName ) {
	return typeof iconName === 'string' && iconName.includes( '/' );
}

/**
 * Build the `has-icon__*` class suffix for an icon name.
 *
 * Namespaced registry names contain a slash, which is not valid in a CSS class,
 * so it is converted to a hyphen (`core/plus` becomes `core-plus`). Bare legacy
 * names pass through untouched, so existing theme CSS targeting classes such as
 * `has-icon__wordpress-github` keeps working.
 *
 * Must stay in sync with `enable_navigation_icons_icon_class_suffix()` in PHP.
 *
 * @since 0.3.0
 * @param {string} iconName The stored iconName attribute.
 * @return {string} The class suffix.
 */
export function getIconClassSuffix( iconName ) {
	if ( typeof iconName !== 'string' ) {
		return '';
	}

	return iconName.replace( /\//g, '-' );
}

/**
 * Convert a REST icon record into the shape the inserter expects.
 *
 * `coreName` preserves the namespaced registry name, because
 * `flattenIconsArray()` rewrites `name` by prefixing it with the type.
 *
 * @since 0.3.0
 * @param {Object} record The REST icon record.
 * @return {Object} An inserter icon.
 */
function toInserterIcon( record ) {
	const [ , bareName ] = record.name.split( '/' );

	return {
		name: bareName ?? record.name,
		coreName: record.name,
		title: record.label ?? bareName ?? record.name,
		icon: record.content ?? '',
	};
}

/**
 * Load all core icon collections and their icons from the REST API.
 *
 * @since 0.3.0
 * @return {Promise<Array>} Inserter icon types, one per collection.
 */
async function loadCoreIconTypes() {
	// Both endpoints return their full result set in a single response:
	// WP_REST_Icons_Controller::get_items() ignores `page`/`per_page`, so
	// paginating would re-fetch the same list and duplicate every icon.
	const [ collections, records ] = await Promise.all( [
		apiFetch( { path: '/wp/v2/icon-collections' } ),
		apiFetch( {
			path: addQueryArgs( '/wp/v2/icons', { context: 'view' } ),
		} ),
	] );

	if ( ! Array.isArray( collections ) || collections.length === 0 ) {
		return [];
	}

	if ( ! Array.isArray( records ) || records.length === 0 ) {
		return [];
	}

	// Group icons by collection. The `collection` field was added in WP 7.1;
	// fall back to the icon name's namespace so a 7.0 registry still groups.
	const grouped = new Map();

	records.forEach( ( record ) => {
		if ( ! record?.name ) {
			return;
		}

		const slug = record.collection ?? record.name.split( '/' )[ 0 ];

		if ( ! grouped.has( slug ) ) {
			grouped.set( slug, [] );
		}

		grouped.get( slug ).push( toInserterIcon( record ) );
	} );

	return (
		collections
			.map( ( collection ) => ( {
				type: `${ CORE_ICON_TYPE_PREFIX }${ collection.slug }`,
				title: collection.label ?? collection.slug,
				isCoreCollection: true,
				collection: collection.slug,
				icons: grouped.get( collection.slug ) ?? [],
			} ) )
			// Drop empty collections so they don't show as dead sidebar entries.
			.filter( ( type ) => type.icons.length > 0 )
	);
}

/**
 * Hook exposing the core Icon API registry as inserter icon types.
 *
 * Resolves to an empty list on WordPress versions without the Icon API REST
 * routes, so the inserter simply shows the plugin's bundled icons as before.
 *
 * @since 0.3.0
 * @return {Object} `{ coreIconTypes, isResolving, isSupported }`.
 */
export function useCoreIcons() {
	const [ state, setState ] = useState(
		() =>
			cache ?? {
				coreIconTypes: [],
				isResolving: true,
				isSupported: false,
			}
	);

	useEffect( () => {
		if ( cache ) {
			return;
		}

		let isStale = false;

		if ( ! pending ) {
			pending = loadCoreIconTypes()
				.then( ( coreIconTypes ) => ( {
					coreIconTypes,
					isResolving: false,
					isSupported: true,
				} ) )
				.catch( () => ( {
					// No Icon API on this WordPress version, or the current
					// user cannot read the registry. Either way, fall back to
					// the bundled icons silently.
					coreIconTypes: [],
					isResolving: false,
					isSupported: false,
				} ) )
				.then( ( result ) => {
					cache = result;
					pending = null;
					return result;
				} );
		}

		pending.then( ( result ) => {
			if ( ! isStale ) {
				setState( result );
			}
		} );

		return () => {
			isStale = true;
		};
	}, [] );

	return state;
}

/**
 * Look up the SVG markup for a core icon that has already been fetched.
 *
 * Used by the editor preview, which needs the markup to build a mask image.
 * Returns an empty string until the registry has loaded.
 *
 * @since 0.3.0
 * @param {Array}  coreIconTypes Types returned by `useCoreIcons()`.
 * @param {string} iconName      Namespaced icon name, e.g. `core/plus`.
 * @return {string} The SVG markup, or an empty string.
 */
export function getCoreIconContent( coreIconTypes, iconName ) {
	if ( ! isCoreIconName( iconName ) || ! Array.isArray( coreIconTypes ) ) {
		return '';
	}

	for ( const type of coreIconTypes ) {
		const match = type.icons?.find(
			( icon ) => icon.coreName === iconName
		);

		if ( match ) {
			return match.icon ?? '';
		}
	}

	return '';
}

/**
 * Human readable label for the core icon registry, used in notices.
 *
 * @since 0.3.0
 * @return {string} The label.
 */
export function getCoreIconRegistryLabel() {
	return __( 'WordPress icon registry', 'enable-navigation-icons' );
}
