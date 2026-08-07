/**
 * Normalize a bundled icon's JS registry name into its Icon API registry name.
 *
 * Registry names must start and end with a lowercase letter or digit and may
 * only contain hyphens and underscores in between. camelCase boundaries in the
 * source names become hyphens, so `wordpress-starFilled` normalizes to
 * `wordpress-star-filled`.
 *
 * Used both at build time (generating build/icon-manifest.php) and at pick
 * time in the editor (storing a bundled icon by its manifest name), so the
 * two MUST stay identical — a divergence stores names the manifest cannot
 * resolve. These names are public API once released; do not change the
 * normalization for icons that have already shipped.
 *
 * @since 0.3.0
 * @param {string} name The icon's JS registry name.
 * @return {string} The normalized registry name.
 */
export default function normalizeIconName( name ) {
	return String( name )
		.replace( /([a-z0-9])([A-Z])/g, '$1-$2' )
		.toLowerCase()
		.replace( /[^a-z0-9_-]+/g, '-' )
		.replace( /-{2,}/g, '-' )
		.replace( /^[-_]+/, '' )
		.replace( /[-_]+$/, '' );
}
