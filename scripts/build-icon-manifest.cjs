#!/usr/bin/env node
/**
 * Convert the Node-bundled icon registry into a PHP manifest.
 *
 * Reads build/icon-manifest.cjs (produced by the second webpack config) and
 * writes build/icon-manifest.php, which enable-navigation-icons.php includes to
 * publish the bundled icons to the WordPress Icon API on WordPress 7.1+.
 *
 * @since 1.0.0
 */

const fs = require( 'fs' );
const path = require( 'path' );

const projectDir = path.resolve( __dirname, '..' );
const buildDir = path.join( projectDir, 'build' );
const bundlePath = path.join( projectDir, '.build-tmp', 'icon-manifest.cjs' );
const outputPath = path.join( buildDir, 'icon-manifest.php' );

if ( ! fs.existsSync( bundlePath ) ) {
	// eslint-disable-next-line no-console
	console.error(
		`Icon manifest bundle not found at ${ bundlePath }. Run the webpack build first.`
	);
	process.exit( 1 );
}

/**
 * Escape a value for a PHP single-quoted string literal.
 *
 * @param {string} value The value to escape.
 * @return {string} The escaped value.
 */
function toPhpString( value ) {
	return String( value ).replace( /\\/g, '\\\\' ).replace( /'/g, "\\'" );
}

const bundle = require( bundlePath );
const build = bundle.default ?? bundle;
const { icons, skipped } = build();

if ( skipped.length > 0 ) {
	// A skipped icon is worse than a missing one. It still appears in the
	// editor's icon library, because that reads the bundled JS registry, but
	// picking it stores a name the manifest cannot resolve — so the frontend
	// renders no icon at all, silently. Fail the build rather than ship that.
	// eslint-disable-next-line no-console
	console.error(
		`\nERROR: ${ skipped.length } icon(s) cannot be represented in the icon manifest:`
	);
	skipped.forEach( ( entry ) => {
		// eslint-disable-next-line no-console
		console.error( `  - ${ entry.name }: ${ entry.reason }` );
	} );
	// eslint-disable-next-line no-console
	console.error(
		'\nThese would show in the icon library but render nothing on the ' +
			'frontend.\nEither remove them from src/icons/index.js, or make ' +
			'them representable using\nonly <svg>, <path> and <polygon> ' +
			'(<circle> and <rect> are converted automatically).\n'
	);
	process.exit( 1 );
}

const names = Object.keys( icons ).sort();

const lines = [
	'<?php',
	'/**',
	' * Generated icon manifest - do not edit.',
	' *',
	' * Produced by scripts/build-icon-manifest.cjs during the build. Consumed by',
	' * enable_navigation_icons_register_icons() to publish the bundled icon set to',
	' * the WordPress Icon API (WordPress 7.1+).',
	' *',
	' * @package enable-navigation-icons',
	' */',
	'',
	"defined( 'ABSPATH' ) || exit;",
	'',
	'return array(',
];

names.forEach( ( name ) => {
	lines.push( `\t'${ toPhpString( name ) }' => array(` );
	lines.push( `\t\t'label'   => '${ toPhpString( icons[ name ].label ) }',` );
	lines.push(
		`\t\t'content' => '${ toPhpString( icons[ name ].content ) }',`
	);
	lines.push( '\t),' );
} );

lines.push( ');' );
lines.push( '' );

fs.mkdirSync( buildDir, { recursive: true } );
fs.writeFileSync( outputPath, lines.join( '\n' ) );

// The bundle is an intermediate artifact only; PHP never loads it.
fs.rmSync( path.dirname( bundlePath ), { recursive: true, force: true } );

// eslint-disable-next-line no-console
console.log(
	`Icon manifest written to build/icon-manifest.php (${ names.length } icons).`
);
