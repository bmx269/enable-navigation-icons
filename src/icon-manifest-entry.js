/**
 * Build-time entry point that renders the bundled icon registry to plain SVG
 * strings, so it can be published to the WordPress Icon API from PHP.
 *
 * This module is never shipped to the browser. It is bundled for Node by the
 * second webpack config and consumed by scripts/build-icon-manifest.cjs.
 *
 * @since 0.3.0
 */

/**
 * External dependencies
 */
import ReactDOMServer from 'react-dom/server';

/**
 * WordPress dependencies
 */
import { isValidElement } from '@wordpress/element';

/**
 * Internal dependencies
 */
import getIcons from './icons';
import { flattenIconsArray } from './utils/icon-functions';

/**
 * Elements the core icon registry permits. Anything else is stripped by core's
 * sanitizer at registration time, which would silently publish a broken icon,
 * so such icons are skipped instead.
 *
 * @see https://make.wordpress.org/core/2026/07/24/registering-and-rendering-svg-icons-in-wordpress-7-1/
 */
const CORE_ALLOWED_ELEMENTS = [ 'svg', 'path', 'polygon' ];

/**
 * Find SVG element names used in a markup string.
 *
 * @param {string} markup The SVG markup.
 * @return {string[]} Lowercased element names.
 */
function getElementNames( markup ) {
	const names = [];
	const pattern = /<\s*([a-zA-Z][a-zA-Z0-9-]*)/g;
	let match = pattern.exec( markup );

	while ( match ) {
		names.push( match[ 1 ].toLowerCase() );
		match = pattern.exec( markup );
	}

	return names;
}

/**
 * Normalize an icon name into something the registry accepts.
 *
 * Registry names must start and end with a lowercase letter or digit and may
 * only contain hyphens and underscores in between. camelCase boundaries in the
 * source names become hyphens, so `starFilled` registers as `star-filled`
 * rather than the unreadable `starfilled`.
 *
 * These names are part of the plugin's public API once published, so they
 * should not change after a release.
 *
 * @param {string} name The icon name.
 * @return {string} The normalized name.
 */
function normalizeName( name ) {
	return String( name )
		.replace( /([a-z0-9])([A-Z])/g, '$1-$2' )
		.toLowerCase()
		.replace( /[^a-z0-9_-]+/g, '-' )
		.replace( /-{2,}/g, '-' )
		.replace( /^[-_]+/, '' )
		.replace( /[-_]+$/, '' );
}

/**
 * Render the bundled icon registry to a manifest of SVG strings.
 *
 * @return {Object} `{ icons, skipped }` where `icons` maps a normalized icon
 *                  name to `{ label, content }`.
 */
export default function buildIconManifest() {
	const icons = {};
	const skipped = [];

	flattenIconsArray( getIcons() ).forEach( ( icon ) => {
		const name = normalizeName( icon?.name );

		if ( ! name || icons[ name ] ) {
			return;
		}

		let content = icon?.icon;

		if ( isValidElement( content ) ) {
			content = ReactDOMServer.renderToStaticMarkup( content );
		}

		if ( typeof content !== 'string' || ! content.includes( '<svg' ) ) {
			skipped.push( { name, reason: 'no SVG markup' } );
			return;
		}

		const disallowed = getElementNames( content ).filter(
			( element ) => ! CORE_ALLOWED_ELEMENTS.includes( element )
		);

		if ( disallowed.length > 0 ) {
			// Core would strip these shapes, leaving a visibly broken icon.
			skipped.push( {
				name,
				reason: `unsupported elements: ${ [
					...new Set( disallowed ),
				].join( ', ' ) }`,
			} );
			return;
		}

		icons[ name ] = {
			label: icon?.title ?? name,
			content,
		};
	} );

	return { icons, skipped };
}
