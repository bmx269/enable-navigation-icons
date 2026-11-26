// Captures WordPress.org screenshots 2-8 from a running site.
// Usage: node capture.cjs <baseUrl> <outDir> [comma-separated shot numbers]
// Seeds a demo menu into Twenty Twenty-Five's header (and changes the site
// title), so only point it at a throwaway site such as WordPress Playground.
const { chromium } = require( 'playwright' );
const B = process.argv[ 2 ];
const OUT = process.argv[ 3 ];
const ONLY = process.argv[ 4 ];
const want = ( n ) => ! ONLY || ONLY.split( ',' ).includes( String( n ) );

const icon = ( n ) => `enable-navigation-icons/wordpress-${ n }`;
const link = ( a ) => `<!-- wp:navigation-link ${ JSON.stringify( a ) } /-->`;
const social = ( label, url, name ) =>
	link( {
		label,
		url,
		iconName: icon( name ),
		useDefaultIconSettings: false,
		hideLabel: true,
		iconPositionLeft: true,
		iconSize: '1.25em',
	} );
const MENU = [
	link( { label: 'Home', url: '/', iconName: icon( 'home' ) } ),
	link( { label: 'Events', url: '/events', iconName: icon( 'calendar' ) } ),
	link( {
		label: 'Locations',
		url: '/locations',
		iconName: icon( 'map-marker' ),
	} ),
	`<!-- wp:navigation-submenu ${ JSON.stringify( { label: 'About', url: '/about', iconName: icon( 'people' ) } ) } -->` +
		link( { label: 'Our team', url: '/team' } ) +
		link( { label: 'Contact', url: '/contact' } ) +
		'<!-- /wp:navigation-submenu -->',
	social( 'Instagram', 'https://instagram.com', 'instagram' ),
	social( 'GitHub', 'https://github.com', 'github' ),
	social( 'Mastodon', 'https://mastodon.social', 'mastodon' ),
].join( '\n' );
const NAV_DEFAULTS = {
	defaultIconPositionLeft: true,
	defaultIconSize: '1.1em',
	defaultIconSpacing: '0.4em',
	defaultCustomIconHoverColor: 'var(--wp--preset--color--accent-3)',
};

( async () => {
	const browser = await chromium.launch();
	const ctx = await browser.newContext( {
		viewport: { width: 1280, height: 800 },
		deviceScaleFactor: 2,
	} );
	const page = await ctx.newPage();
	const shot = ( n ) =>
		page.screenshot( { path: `${ OUT }/screenshot-${ n }.png` } );
	try {
		await page.goto( `${ B }/wp-admin/`, { timeout: 120000 } );
		if ( await page.locator( '#user_login' ).count() ) {
			await page.fill( '#user_login', 'admin' );
			await page.fill( '#user_pass', 'password' );
			await Promise.all( [
				page.waitForLoadState( 'load' ),
				page.click( '#wp-submit' ),
			] );
		}
		await page.waitForFunction( () => window.wp?.apiFetch, null, {
			timeout: 120000,
		} );

		// Seed: site title, a menu, and the header pointing at it with defaults.
		const seeded = await page.evaluate(
			async ( { menu, defaults } ) => {
				const api = ( o ) =>
					wp.apiFetch( o ).catch( ( e ) => {
						throw new Error( o.path + ': ' + JSON.stringify( e ) );
					} );
				await api( {
					path: '/wp/v2/settings',
					method: 'POST',
					data: { title: 'Northside Library', description: '' },
				} );
				const navs = await api( {
					path: '/wp/v2/navigation?per_page=100&context=edit',
				} );
				let nav = navs.find( ( n ) => n.title.raw === 'Main menu' );
				nav = nav
					? await api( {
							path: `/wp/v2/navigation/${ nav.id }`,
							method: 'POST',
							data: { content: menu },
						} )
					: await api( {
							path: '/wp/v2/navigation',
							method: 'POST',
							data: {
								title: 'Main menu',
								status: 'publish',
								content: menu,
							},
						} );
				const part = await api( {
					path: '/wp/v2/template-parts/twentytwentyfive//header?context=edit',
				} );
				const raw = part.content.raw;
				const attrs =
					JSON.stringify( { ref: nav.id, ...defaults } ).slice(
						0,
						-1
					) + ',';
				const content = raw.replace(
					/<!-- wp:navigation (\{(?:"ref":\d+,)?(?:"default[A-Za-z]+":(?:"[^"]*"|true|false),)*)?/,
					`<!-- wp:navigation ${ attrs }`
				);
				await api( {
					path: '/wp/v2/template-parts/twentytwentyfive//header',
					method: 'POST',
					data: { content },
				} );
				return {
					nav: nav.id,
					changed: content !== raw,
					head: content.match(
						/<!-- wp:navigation [^\n]{0,260}/
					)?.[ 0 ],
				};
			},
			{ menu: MENU, defaults: NAV_DEFAULTS }
		);
		if ( ! seeded.changed ) {
			throw new Error( 'Header has no Navigation block to seed.' );
		}

		// 2. Front end, hovering an item to show the hover colour.
		if ( want( 2 ) ) {
			await page.goto( `${ B }/`, { timeout: 120000 } );
			await page
				.locator( '#wpadminbar' )
				.evaluate( ( el ) => el.remove() )
				.catch( () => {} );
			await page.addStyleTag( {
				content: 'html{margin-top:0!important}',
			} );
			await page.getByRole( 'link', { name: 'Events' } ).first().hover();
			await page.waitForTimeout( 600 );
			await shot( 2 );
		}

		// Editor: the header template part in the Site Editor.
		await page.goto(
			`${ B }/wp-admin/site-editor.php?p=%2Fwp_template_part%2Ftwentytwentyfive%2F%2Fheader&canvas=edit`,
			{ timeout: 120000 }
		);
		await page.waitForFunction(
			() => window.wp?.data?.select( 'core/block-editor' ),
			null,
			{ timeout: 120000 }
		);
		await page.evaluate( () => {
			for ( const scope of [ 'core', 'core/edit-site' ] ) {
				wp.data
					.dispatch( 'core/preferences' )
					?.set( scope, 'welcomeGuide', false );
				wp.data
					.dispatch( 'core/preferences' )
					?.set( scope, 'welcomeGuideTemplate', false );
			}
		} );
		await page.waitForSelector( 'iframe[name="editor-canvas"]', {
			timeout: 120000,
		} );
		await page.waitForFunction(
			() => {
				const be = wp.data.select( 'core/block-editor' );
				return be
					.getClientIdsWithDescendants()
					.some(
						( id ) =>
							be.getBlock( id )?.attributes?.label === 'Mastodon'
					);
			},
			null,
			{ timeout: 120000 }
		);
		await page.waitForTimeout( 2500 );
		await page.keyboard.press( 'Escape' );

		const find = ( label ) =>
			page.evaluate( ( l ) => {
				const be = wp.data.select( 'core/block-editor' );
				return be
					.getClientIdsWithDescendants()
					.find( ( id ) =>
						l
							? be.getBlock( id )?.attributes?.label === l
							: be.getBlockName( id ) === 'core/navigation'
					);
			}, label );
		const select = async ( label ) => {
			const id = await find( label );
			await page.evaluate( ( i ) => {
				wp.data.dispatch( 'core/block-editor' ).selectBlock( i );
				wp.data
					.dispatch( 'core/interface' )
					.enableComplementaryArea(
						'core',
						'edit-site/block-inspector'
					);
			}, id );
			await page.waitForTimeout( 1200 );
			return id;
		};
		const insp = page.locator( '.block-editor-block-inspector' );
		const tab = async ( name ) => {
			const t = insp.getByRole( 'tab', { name } );
			if ( await t.count() ) {
				await t.first().click();
			}
			await page.waitForTimeout( 600 );
		};
		const scrollTo = async ( text ) => {
			await insp
				.getByText( text, { exact: true } )
				.first()
				.evaluate( ( el ) => el.scrollIntoView( { block: 'start' } ) );
			await page.waitForTimeout( 400 );
		};

		// 3. Add icon menu on an item without an icon.
		if ( want( 3 ) ) {
			await select( 'Our team' );
			const btn = page
				.getByRole( 'button', { name: 'Add icon' } )
				.first();
			await btn.click();
			await page.waitForTimeout( 700 );
			await shot( 3 );
			await page.keyboard.press( 'Escape' );
		}

		// 4. Icon library.
		if ( want( 4 ) ) {
			await select( 'Events' );
			await page
				.getByRole( 'button', { name: /Replace icon|Add icon/ } )
				.first()
				.click();
			await page
				.getByRole( 'menuitem', { name: 'Browse Icon Library' } )
				.click();
			const modal = page.getByRole( 'dialog', { name: 'Icon Library' } );
			await modal.waitFor( { timeout: 30000 } );
			await page.mouse.move( 1270, 790 );
			await page.waitForTimeout( 3500 );
			await shot( 4 );
			await page.keyboard.press( 'Escape' );
			await page.waitForTimeout( 600 );
		}

		// 5. Hidden label on an icon-only item.
		if ( want( 5 ) ) {
			await select( 'Instagram' );
			await tab( 'Settings' );
			await scrollTo( 'Icon settings' );
			await shot( 5 );
		}

		// 6. Navigation defaults.
		if ( want( 6 ) ) {
			await select();
			await tab( 'Settings' );
			await scrollTo( 'Default Icon Settings' );
			await shot( 6 );
		}

		// 7. Icon colours.
		if ( want( 7 ) ) {
			await page.evaluate(
				async ( id ) =>
					wp.data
						.dispatch( 'core/block-editor' )
						.updateBlockAttributes( id, {
							defaultCustomIconColor: '#1e5e8c',
						} ),
				await find()
			);
			await select();
			await tab( 'Styles' );
			await insp
				.getByRole( 'button', { name: /Default Icon Color/ } )
				.first()
				.evaluate( ( el ) =>
					el
						.closest( '.components-tools-panel' )
						.scrollIntoView( { block: 'start' } )
				);
			await page.waitForTimeout( 600 );
			await shot( 7 );
			await page.keyboard.press( 'Escape' );
		}

		// 8. Custom SVG.
		if ( want( 8 ) ) {
			await select( 'Locations' );
			await page
				.getByRole( 'button', { name: /Replace icon|Add icon/ } )
				.first()
				.click();
			await page
				.getByRole( 'menuitem', { name: /custom icon/i } )
				.first()
				.click();
			const dlg = page.getByRole( 'dialog' ).last();
			await dlg.waitFor();
			await dlg
				.locator( 'textarea' )
				.fill(
					'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>'
				);
			await page.waitForTimeout( 800 );
			await shot( 8 );
			await page.keyboard.press( 'Escape' );
		}
	} catch ( e ) {
		// eslint-disable-next-line no-console
		console.log(
			'FAILED',
			e.message.split( '\n' ).slice( 0, 3 ).join( ' | ' )
		);
		await page
			.screenshot( { path: `${ OUT }/failure.png` } )
			.catch( () => {} );
	}
	await browser.close();
} )();
