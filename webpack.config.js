/**
 * External dependencies
 */
const RemoveEmptyScriptsPlugin = require( 'webpack-remove-empty-scripts' );
const path = require( 'path' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

/**
 * The editor/frontend bundle.
 */
const pluginConfig = {
	...defaultConfig,

	entry: {
		index: path.resolve( process.cwd(), 'src/index.js' ),
		editor: path.resolve( process.cwd(), 'src/editor.scss' ),
		style: path.resolve( process.cwd(), 'src/index.scss' ),
	},

	plugins: [ ...defaultConfig.plugins, new RemoveEmptyScriptsPlugin() ],
};

/**
 * A separate Node-targeted bundle used only at build time.
 *
 * It renders the bundled icon registry to SVG strings so the icons can be
 * published to the WordPress Icon API from PHP. The default config cannot be
 * reused here because it externalizes every `@wordpress/*` import to a browser
 * global, which is meaningless in Node.
 *
 * @since 1.0.0
 */
const iconManifestConfig = {
	mode: 'production',
	target: 'node',
	devtool: false,

	entry: {
		'icon-manifest': path.resolve(
			process.cwd(),
			'src/icon-manifest-entry.js'
		),
	},

	// Deliberately not build/: wp-scripts cleans that directory, which would
	// race with this compilation and delete the bundle before it can be read.
	output: {
		path: path.resolve( process.cwd(), '.build-tmp' ),
		filename: '[name].cjs',
		library: { type: 'commonjs2' },
	},

	// Readability matters more than size for a file that never ships.
	optimization: { minimize: false },

	resolve: { extensions: [ '.js', '.jsx' ] },

	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: {
					loader: require.resolve( 'babel-loader' ),
					options: {
						presets: [
							require.resolve(
								'@wordpress/babel-preset-default'
							),
						],
					},
				},
			},
		],
	},
};

module.exports = [ pluginConfig, iconManifestConfig ];
