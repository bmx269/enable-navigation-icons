/**
 * Build-time entry point that renders the bundled icon registry to plain SVG
 * strings, so it can be published to the WordPress Icon API from PHP.
 *
 * This module is never shipped to the browser. It is bundled for Node by the
 * second webpack config and consumed by scripts/build-icon-manifest.cjs.
 *
 * @since 1.0.0
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
import normalizeName from './utils/normalize-icon-name';

/**
 * Elements the core icon registry permits. Anything else is stripped by core's
 * sanitizer at registration time, which would silently publish a broken icon,
 * so such icons are skipped instead.
 *
 * @see https://make.wordpress.org/core/2026/07/24/registering-and-rendering-svg-icons-in-wordpress-7-1/
 */
const CORE_ALLOWED_ELEMENTS = [ 'svg', 'path', 'polygon' ];

/**
 * Extract the attributes of an SVG tag as a name/value map.
 *
 * @param {string} attrString The raw attribute portion of the tag.
 * @return {Object} Attribute map.
 */
function parseAttributes( attrString ) {
	const attrs = {};
	const pattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"/g;
	let match = pattern.exec( attrString );

	while ( match ) {
		attrs[ match[ 1 ] ] = match[ 2 ];
		match = pattern.exec( attrString );
	}

	return attrs;
}

/**
 * Rewrite `<circle>` and `<rect>` elements as equivalent `<path>` elements.
 *
 * The core registry's sanitizer only allows `svg`, `path` and `polygon`, so
 * icons drawn with circles or rectangles would otherwise be unpublishable.
 * Both shapes have exact path equivalents: a circle becomes two arcs, a
 * rectangle a move plus three lines. Rounded rectangles (`rx`/`ry`) are left
 * untouched — those icons are skipped rather than converted approximately.
 *
 * @param {string} markup The SVG markup.
 * @return {string} Markup with convertible shapes rewritten as paths.
 */
function convertShapesToPaths( markup ) {
	const num = ( value ) => {
		const parsed = parseFloat( value );
		return Number.isFinite( parsed ) ? parsed : null;
	};

	let result = markup.replace(
		/<circle\b([^>]*?)\s*\/?>(?:<\/circle>)?/g,
		( full, attrString ) => {
			const attrs = parseAttributes( attrString );
			const cx = num( attrs.cx ) ?? 0;
			const cy = num( attrs.cy ) ?? 0;
			const r = num( attrs.r );

			if ( ! r ) {
				return full;
			}

			const d = `M${ cx - r } ${ cy }a${ r } ${ r } 0 1 0 ${
				2 * r
			} 0a${ r } ${ r } 0 1 0 ${ -2 * r } 0z`;
			const fill = attrs.fill ? ` fill="${ attrs.fill }"` : '';

			return `<path d="${ d }"${ fill }/>`;
		}
	);

	result = result.replace(
		/<rect\b([^>]*?)\s*\/?>(?:<\/rect>)?/g,
		( full, attrString ) => {
			const attrs = parseAttributes( attrString );

			// Rounded corners have no simple exact path equivalent here.
			if ( attrs.rx || attrs.ry ) {
				return full;
			}

			const x = num( attrs.x ) ?? 0;
			const y = num( attrs.y ) ?? 0;
			const width = num( attrs.width );
			const height = num( attrs.height );

			if ( ! width || ! height ) {
				return full;
			}

			const d = `M${ x } ${ y }h${ width }v${ height }h${ -width }z`;
			const fill = attrs.fill ? ` fill="${ attrs.fill }"` : '';

			return `<path d="${ d }"${ fill }/>`;
		}
	);

	return result;
}

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

		content = convertShapesToPaths( content );

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
