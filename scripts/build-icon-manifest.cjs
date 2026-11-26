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
const iconsDir = path.join( buildDir, 'icons' );

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

const names = Object.keys( icons ).sort();

const lines = [
	'<?php',
	'/**',
	' * Generated icon manifest - do not edit.',
	' *',
	' * Produced by scripts/build-icon-manifest.cjs during the build. Lists the',
	" * bundled icons (name => label); each icon's SVG is in build/icons/<name>.svg.",
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
	// Markup is not repeated here: it lives only in build/icons/<name>.svg,
	// which both the renderer and the Icon API registration read.
	lines.push( `\t\t'label' => '${ toPhpString( icons[ name ].label ) }',` );
	lines.push( '\t),' );
} );

lines.push( ');' );
lines.push( '' );

fs.mkdirSync( buildDir, { recursive: true } );
fs.writeFileSync( outputPath, lines.join( '\n' ) );

// One .svg per icon, registered with the Icon API by `file_path`. Core only
// reads and sanitizes a file-backed icon when it is first requested, whereas
// icons registered with inline `content` are all sanitized on every request.
// Cleared first so icons removed from the set don't linger in the zip.
fs.rmSync( iconsDir, { recursive: true, force: true } );
fs.mkdirSync( iconsDir, { recursive: true } );
names.forEach( ( name ) => {
	fs.writeFileSync(
		path.join( iconsDir, `${ name }.svg` ),
		icons[ name ].content
	);
} );

// The bundle is an intermediate artifact only; PHP never loads it.
fs.rmSync( path.dirname( bundlePath ), { recursive: true, force: true } );

// eslint-disable-next-line no-console
console.log(
	`Icon manifest written to build/icon-manifest.php and build/icons/ (${ names.length } icons).`
);

if ( skipped.length > 0 ) {
	// Surfaced deliberately: these icons are absent from the published
	// collection, so silence here would read as full coverage.
	// eslint-disable-next-line no-console
	console.log(
		`Skipped ${ skipped.length } icon(s) the core registry cannot represent:`
	);
	skipped.forEach( ( entry ) => {
		// eslint-disable-next-line no-console
		console.log( `  - ${ entry.name }: ${ entry.reason }` );
	} );
}
