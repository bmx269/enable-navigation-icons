/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Modal } from '@wordpress/components';
import { useState, useEffect, useMemo, useCallback } from '@wordpress/element';

/**
 * Internal dependencies
 */
import getIcons from './../../icons';
import {
	flattenIconsArray,
	getIconTypes,
	getOwnRegistryName,
	OWN_COLLECTION,
	useCoreIcons,
} from './../../utils';
import ContentHeader from './content-header';
import IconGrid from './icon-grid';
import Sidebar from './sidebar';
import { parseIconComponent } from '../../utils/parse-icon';
export default function InserterModal( props ) {
	const { isInserterOpen, setInserterOpen, attributes, setAttributes } =
		props;
	const bundledIconsByType = getIcons();

	// Icons registered with the WordPress Icon API (WP 7.1+), exposed as
	// additional types alongside the plugin's bundled icons. Resolves to an
	// empty array on older versions, leaving the inserter unchanged. The
	// registry is only fetched once the modal is actually opened.
	const { coreIconTypes } = useCoreIcons( { enabled: isInserterOpen } );

	const iconsByType = useMemo( () => {
		const bundledTitles = new Set(
			bundledIconsByType.map( ( type ) => type?.title ?? type?.type )
		);

		const shownCoreTypes = coreIconTypes
			// The plugin's own published collection duplicates the bundled
			// set, so it is hidden here (but kept in the data for previews).
			.filter( ( type ) => type.collection !== OWN_COLLECTION )
			// Core's own collection is labeled "WordPress", which collides
			// with the bundled set's sidebar group. Disambiguate collisions.
			.map( ( type ) =>
				bundledTitles.has( type.title )
					? {
							...type,
							title: sprintf(
								/* translators: %s: icon collection name. */
								__(
									'%s (Icon API)',
									'enable-navigation-icons'
								),
								type.title
							),
					  }
					: type
			);

		return [ ...bundledIconsByType, ...shownCoreTypes ];
	}, [ bundledIconsByType, coreIconTypes ] );
	const iconTypes = getIconTypes( iconsByType );

	// Get the default type, and if there is none, get the first type.
	const defaultType = useMemo( () => {
		const defaultTypes = iconTypes.filter( ( type ) => type.isDefault );
		return defaultTypes.length !== 0 ? defaultTypes : [ iconTypes[ 0 ] ];
	}, [ iconTypes ] );

	const [ searchInput, setSearchInput ] = useState( '' );
	const [ currentCategory, setCurrentCategory ] = useState(
		'all__' + defaultType[ 0 ]?.type
	);
	const [ iconSize, setIconSize ] = useState( () => {
		const storedSettings = window.localStorage.getItem( 'icon_block' );
		return storedSettings
			? JSON.parse( storedSettings )?.preview_size || 24
			: 24;
	} );

	useEffect( () => {
		const settings = JSON.parse(
			window.localStorage.getItem( 'icon_block' ) || '{}'
		);
		settings.preview_size = iconSize;
		window.localStorage.setItem( 'icon_block', JSON.stringify( settings ) );
	}, [ iconSize ] );

	const iconsAll = useMemo(
		() => flattenIconsArray( iconsByType ),
		[ iconsByType ]
	);

	// Move the filtering logic to a separate function
	const getFilteredIcons = useCallback( () => {
		if ( searchInput ) {
			return iconsAll.filter( ( icon ) => {
				const input = searchInput.toLowerCase();
				const iconName = icon.title.toLowerCase();

				if ( iconName.includes( input ) ) {
					return true;
				}

				return (
					icon?.keywords?.some( ( keyword ) =>
						keyword.includes( input )
					) || false
				);
			} );
		}

		if ( currentCategory.startsWith( 'all__' ) ) {
			const categoryType = currentCategory.replace( 'all__', '' );
			return (
				iconsByType.find( ( type ) => type.type === categoryType )
					?.icons || []
			);
		}

		return iconsAll.filter(
			( icon ) => icon?.categories?.includes( currentCategory ) || false
		);
	}, [ searchInput, currentCategory, iconsAll, iconsByType ] );

	if ( ! isInserterOpen ) {
		return null;
	}

	function updateIconAtts( renderedIcon, name, hasNoIconFill, iconObject ) {
		// Icons from the WordPress Icon API are stored by their namespaced
		// registry name only. The SVG is resolved server-side by wp_get_icon(),
		// which keeps the markup out of post content and lets a re-registered
		// icon update everywhere at once.
		if ( iconObject?.coreName ) {
			setAttributes( {
				icon: undefined,
				iconName: iconObject.coreName,
				hasNoIconFill,
			} );
			setInserterOpen( false );
			return;
		}

		// The plugin's own bundled icons are also stored by name — resolved
		// from the shipped manifest on the server and the JS registry in the
		// editor, so this works on every supported WordPress version. Sets
		// registered by other plugins via the `iconBlock.icons` filter are
		// not in the manifest and keep embedding their SVG.
		if ( iconObject?.type === 'wordpress' ) {
			setAttributes( {
				icon: undefined,
				iconName: getOwnRegistryName( name ),
				hasNoIconFill,
			} );
			setInserterOpen( false );
			return;
		}

		if ( typeof renderedIcon !== 'string' ) {
			renderedIcon = parseIconComponent( renderedIcon );
		}
		setAttributes( {
			icon: renderedIcon,
			iconName: name,
			hasNoIconFill,
		} );
		setInserterOpen( false );
	}

	function onClickCategory( category ) {
		setCurrentCategory( category );
	}

	return (
		<Modal
			className="wp-block-outermost-icon-inserter__modal"
			title={ __( 'Icon Library', 'icon-block' ) }
			onRequestClose={ () => setInserterOpen( false ) }
			isFullScreen
		>
			<div
				className={ classnames( 'icon-inserter', {
					'is-searching': searchInput,
				} ) }
			>
				<Sidebar
					iconsByType={ iconsByType }
					currentCategory={ currentCategory }
					onClickCategory={ onClickCategory }
					searchInput={ searchInput }
					setSearchInput={ setSearchInput }
				/>
				<div className="icon-inserter__content">
					<ContentHeader
						searchInput={ searchInput }
						shownIconsCount={ getFilteredIcons().length }
						iconSize={ iconSize }
						setIconSize={ setIconSize }
					/>
					<IconGrid
						shownIcons={ getFilteredIcons() }
						iconSize={ iconSize }
						updateIconAtts={ updateIconAtts }
						attributes={ attributes }
					/>
				</div>
			</div>
		</Modal>
	);
}
