/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter, applyFilters } from '@wordpress/hooks';
import {
	BlockControls,
	InspectorControls,
	MediaUpload,
	useBlockEditingMode,
	useStyleOverride,
	withColors,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients,
} from '@wordpress/block-editor';
import {
	Dropdown,
	MenuGroup,
	MenuItem,
	NavigableMenu,
	PanelBody,
	PanelRow,
	ToggleControl,
	ToolbarButton,
	__experimentalGrid as Grid, // eslint-disable-line
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { code, media as mediaIcon } from '@wordpress/icons';
import {
	compose,
	createHigherOrderComponent,
	useInstanceId,
} from '@wordpress/compose';

/**
 * Internal dependencies
 */
import {
	CustomInserterModal,
	DimensionControl,
	InserterModal,
} from './components';
import { parseUploadedMediaAndSetIcon, getIconStyle } from './utils';
import { bolt as defaultIcon } from './icons/bolt';

/**
 * Add the attributes needed for button icons.
 *
 * @since 0.1.0
 * @param {Object} settings
 */
/**
 * Add the attributes needed for navigation icons.
 *
 * @since 0.1.0
 * @param {Object} settings Block settings.
 * @return {Object} Modified block settings.
 */
function addAttributes( settings ) {
	// Add global default icon settings to the Navigation block
	if ( settings.name === 'core/navigation' ) {
		const globalIconAttributes = {
			defaultIconSize: {
				type: 'string',
			},
			defaultIconSpacing: {
				type: 'string',
			},
			defaultIconColor: {
				type: 'string',
			},
			defaultCustomIconColor: {
				type: 'string',
			},
			defaultIconPositionLeft: {
				type: 'boolean',
				default: false,
			},
			defaultJustifySpaceBetween: {
				type: 'boolean',
				default: false,
			},
			defaultHasNoIconFill: {
				type: 'boolean',
				default: false,
			},
		};

		return {
			...settings,
			attributes: {
				...settings.attributes,
				...globalIconAttributes,
			},
		};
	}

	// Add per-item icon attributes to navigation-link, navigation-submenu, and ollie/mega-menu
	if (
		settings.name !== 'core/navigation-link' &&
		settings.name !== 'core/navigation-submenu' &&
		settings.name !== 'ollie/mega-menu'
	) {
		return settings;
	}

	// Add the icon attributes.
	const iconAttributes = {
		icon: {
			// String of icon svg (custom, media library).
			type: 'string',
		},
		iconPositionLeft: {
			type: 'boolean',
			default: false,
		},
		iconName: {
			// Name prop of icon (WordPress icon library, etc).
			type: 'string',
		},
		iconColor: {
			type: 'string',
		},
		customIconColor: {
			type: 'string',
		},
		hasNoIconFill: {
			type: 'boolean',
			default: false,
		},
		justifySpaceBetween: {
			type: 'boolean',
			default: false,
		},
		iconSize: {
			type: 'string',
		},
		iconSpacing: {
			type: 'string',
		},
		useDefaultIconSettings: {
			type: 'boolean',
			default: true,
		},
	};

	const newSettings = {
		...settings,
		attributes: {
			...settings.attributes,
			...iconAttributes,
		},
	};

	return newSettings;
}

addFilter(
	'blocks.registerBlockType',
	'enable-navigation-icons/add-attributes',
	addAttributes
);

// Allowed types for the current WP_User
function GetAllowedMimeTypes() {
	const { allowedMimeTypes, mediaUpload } = useSelect( ( select ) => {
		const { getSettings } = select( 'core/block-editor' );

		// In WordPress 6.1 and lower, allowedMimeTypes returns
		// null in the post editor, so need to use getEditorSettings.
		// TODO: Remove once minimum version is bumped to 6.2
		const { getEditorSettings } = select( 'core/editor' );

		return {
			allowedMimeTypes: getSettings().allowedMimeTypes
				? getSettings().allowedMimeTypes
				: getEditorSettings().allowedMimeTypes,
			mediaUpload: getSettings().mediaUpload,
		};
	}, [] );
	return { allowedMimeTypes, mediaUpload };
}

/**
 * Filter the BlockEdit object and add icon inspector controls to navigation blocks.
 *
 * @since 0.1.0
 * @param {Object} BlockEdit
 */
const withBlockControls = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		// Handle Navigation block (parent) - add default icon settings
		if ( props.name === 'core/navigation' ) {
			const { attributes, setAttributes } = props;
			const {
				defaultIconSize,
				defaultIconSpacing,
				defaultCustomIconColor,
				defaultIconPositionLeft,
				defaultJustifySpaceBetween,
				defaultHasNoIconFill,
			} = attributes;

			const colorGradientSettings = useMultipleOriginColorsAndGradients();

			return (
				<>
					<BlockEdit { ...props } />
					<InspectorControls>
						<PanelBody
							title={ __(
								'Default Icon Settings',
								'enable-navigation-icons'
							) }
							initialOpen={ false }
						>
							<PanelRow>
								<p className="description">
									{ __(
										'Set default icon settings for all navigation items. Individual items can override these settings.',
										'enable-navigation-icons'
									) }
								</p>
							</PanelRow>
							<DimensionControl
								label={ __(
									'Icon size',
									'enable-navigation-icons'
								) }
								value={ defaultIconSize || '' }
								onChange={ ( value ) => {
									setAttributes( { defaultIconSize: value } );
								} }
								units={ [ 'px', 'em', 'rem' ] }
							/>
							<DimensionControl
								label={ __(
									'Icon spacing',
									'enable-navigation-icons'
								) }
								value={ defaultIconSpacing || '' }
								onChange={ ( value ) => {
									setAttributes( {
										defaultIconSpacing: value,
									} );
								} }
								units={ [ 'px', 'em', 'rem' ] }
							/>
							<PanelRow>
								<ToggleControl
									label={ __(
										'Show icons on left',
										'enable-navigation-icons'
									) }
									checked={ defaultIconPositionLeft }
									onChange={ () => {
										setAttributes( {
											defaultIconPositionLeft:
												! defaultIconPositionLeft,
										} );
									} }
								/>
							</PanelRow>
							<PanelRow>
								<ToggleControl
									label={ __(
										'Justify space between',
										'enable-navigation-icons'
									) }
									checked={ defaultJustifySpaceBetween }
									onChange={ () => {
										setAttributes( {
											defaultJustifySpaceBetween:
												! defaultJustifySpaceBetween,
										} );
									} }
								/>
							</PanelRow>
							<PanelRow>
								<ToggleControl
									label={ __(
										'No icon fill (stroke only)',
										'enable-navigation-icons'
									) }
									checked={ defaultHasNoIconFill }
									onChange={ () => {
										setAttributes( {
											defaultHasNoIconFill:
												! defaultHasNoIconFill,
										} );
									} }
								/>
							</PanelRow>
						</PanelBody>
					</InspectorControls>
					<InspectorControls group="color">
						<ColorGradientSettingsDropdown
							panelId={ props.clientId }
							settings={ [
								{
									label: __(
										'Default Icon Color',
										'enable-navigation-icons'
									),
									colorValue:
										defaultCustomIconColor || undefined,
									onColorChange: ( value ) => {
										setAttributes( {
											defaultCustomIconColor: value,
										} );
									},
								},
							] }
							{ ...colorGradientSettings }
						/>
					</InspectorControls>
				</>
			);
		}

		// Handle navigation items (children)
		if (
			props.name !== 'core/navigation-link' &&
			props.name !== 'core/navigation-submenu' &&
			props.name !== 'ollie/mega-menu'
		) {
			return <BlockEdit { ...props } />;
		}

		const { attributes, iconColor, setIconColor, setAttributes, clientId } =
			props;
		const {
			icon,
			iconName,
			iconPositionLeft,
			customIconColor,
			justifySpaceBetween,
			iconSize,
			iconSpacing,
			useDefaultIconSettings,
		} = attributes;
		const { allowedMimeTypes } = GetAllowedMimeTypes();
		const isSVGUploadAllowed = allowedMimeTypes
			? Object.values( allowedMimeTypes ).includes( 'image/svg+xml' )
			: false;

		const [ isInserterOpen, setInserterOpen ] = useState( false );
		const [ isCustomInserterOpen, setCustomInserterOpen ] =
			useState( false );

		// Allow the iconBlock to disable custom SVG icons.
		const enableCustomIcons = applyFilters(
			'iconBlock.enableCustomIcons',
			true
		);

		const isContentOnlyMode = useBlockEditingMode() === 'contentOnly';

		// Ensure a valid string or undefined is passed to colorValue
		let validColorValue;
		if ( typeof iconColor === 'string' && iconColor.trim() !== '' ) {
			validColorValue = iconColor;
		} else if (
			typeof customIconColor === 'string' &&
			customIconColor.trim() !== ''
		) {
			validColorValue = customIconColor;
		}

		const colorGradientSettings = useMultipleOriginColorsAndGradients();

		const ARROW_DOWN = 40;
		const openOnArrowDown = ( event ) => {
			if ( event.keyCode === ARROW_DOWN ) {
				event.preventDefault();
				event.target.click();
			}
		};

		const replaceText =
			icon || iconName
				? __( 'Replace icon', 'icon-block' )
				: __( 'Add icon', 'icon-block' );
		const customIconText =
			icon || iconName
				? __( 'Add/edit custom icon', 'icon-block' )
				: __( 'Add custom icon', 'icon-block' );

		const replaceDropdown = (
			<Dropdown
				renderToggle={ ( { isOpen, onToggle } ) => (
					<ToolbarButton
						aria-expanded={ isOpen }
						aria-haspopup="true"
						onClick={ onToggle }
						onKeyDown={ openOnArrowDown }
					>
						{ replaceText }
					</ToolbarButton>
				) }
				style={ { zIndex: 1 } }
				className="enable-button-icon-dropdown"
				contentClassName="enable-button-icon-dropdown-content"
				renderContent={ ( { onClose } ) => (
					<NavigableMenu className="enable-button-icon-navigableMenu">
						<MenuGroup>
							<MenuItem
								onClick={ () => {
									setInserterOpen( true );
									onClose( true );
								} }
								icon={ defaultIcon }
							>
								{ __( 'Browse Icon Library', 'icon-block' ) }
							</MenuItem>
							{ isSVGUploadAllowed && (
								<MediaUpload
									onSelect={ ( media ) => {
										parseUploadedMediaAndSetIcon(
											media,
											attributes,
											setAttributes
										);
										onClose( true );
									} }
									allowedTypes={ [ 'image/svg+xml' ] }
									render={ ( { open } ) => (
										<MenuItem
											onClick={ open }
											icon={ mediaIcon }
										>
											{ __(
												'Open Media Library',
												'icon-block'
											) }
										</MenuItem>
									) }
									className={
										'enable-button-icon-media-upload'
									}
								/>
							) }
							{ enableCustomIcons && (
								<MenuItem
									onClick={ () => {
										setCustomInserterOpen( true );
										onClose( true );
									} }
									icon={ code }
								>
									{ customIconText }
								</MenuItem>
							) }
						</MenuGroup>
						{ ( icon || iconName ) && (
							<MenuGroup>
								<MenuItem
									onClick={ () => {
										setAttributes( {
											icon: undefined,
											iconName: undefined,
										} );
										onClose( true );
									} }
								>
									{ __( 'Reset', 'icon-block' ) }
								</MenuItem>
							</MenuGroup>
						) }
					</NavigableMenu>
				) }
			/>
		);

		return (
			<>
				<BlockEdit { ...props } />
				<BlockControls group={ isContentOnlyMode ? 'inline' : 'other' }>
					<>
						{ enableCustomIcons || isSVGUploadAllowed ? (
							replaceDropdown
						) : (
							<ToolbarButton
								onClick={ () => {
									setInserterOpen( true );
								} }
							>
								{ replaceText }
							</ToolbarButton>
						) }
					</>
				</BlockControls>
				{ ( icon || iconName ) && (
					<>
						<InspectorControls>
							<PanelBody
								title={ __(
									'Icon settings',
									'enable-button-icons'
								) }
								className="button-icon-picker"
								initialOpen={ true }
							>
								<PanelRow>
									<ToggleControl
										label={ __(
											'Use default icon settings',
											'enable-navigation-icons'
										) }
										help={ __(
											'When enabled, this item will use the default settings from the Navigation block.',
											'enable-navigation-icons'
										) }
										checked={ useDefaultIconSettings }
										onChange={ () => {
											setAttributes( {
												useDefaultIconSettings:
													! useDefaultIconSettings,
											} );
										} }
									/>
								</PanelRow>
								{ ! useDefaultIconSettings && (
									<>
										<PanelRow>
											<ToggleControl
												label={ __(
													'Show icon on left',
													'enable-button-icons'
												) }
												checked={ iconPositionLeft }
												onChange={ () => {
													setAttributes( {
														iconPositionLeft:
															! iconPositionLeft,
													} );
												} }
											/>
										</PanelRow>
										<PanelRow>
											<ToggleControl
												label={ __(
													'Justify space between',
													'enable-button-icons'
												) }
												checked={ justifySpaceBetween }
												onChange={ () => {
													setAttributes( {
														justifySpaceBetween:
															! justifySpaceBetween,
													} );
												} }
											/>
										</PanelRow>
										<DimensionControl
											label={ __(
												'Icon size',
												'enable-navigation-icons'
											) }
											value={ iconSize || '' }
											onChange={ ( value ) => {
												setAttributes( {
													iconSize: value,
												} );
											} }
											units={ [ 'px', 'em', 'rem' ] }
										/>
										<DimensionControl
											label={ __(
												'Icon spacing',
												'enable-navigation-icons'
											) }
											value={ iconSpacing || '' }
											onChange={ ( value ) => {
												setAttributes( {
													iconSpacing: value,
												} );
											} }
											units={ [ 'px', 'em', 'rem' ] }
										/>
									</>
								) }
							</PanelBody>
						</InspectorControls>
						{ ! useDefaultIconSettings && (
							<InspectorControls group="color">
								<ColorGradientSettingsDropdown
									panelId={ clientId }
									settings={ [
										{
											label: 'Icon',
											colorValue: validColorValue,
											onColorChange: ( value ) => {
												setIconColor( value );

												setAttributes( {
													customIconColor: value,
												} );
											},
										},
									] }
									{ ...colorGradientSettings }
								/>
							</InspectorControls>
						) }
					</>
				) }
				<InserterModal
					isInserterOpen={ isInserterOpen }
					setInserterOpen={ setInserterOpen }
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
				{ enableCustomIcons && (
					<CustomInserterModal
						isCustomInserterOpen={ isCustomInserterOpen }
						setCustomInserterOpen={ setCustomInserterOpen }
						attributes={ attributes }
						setAttributes={ setAttributes }
					/>
				) }
			</>
		);
	};
}, 'withBlockControls' );

addFilter(
	'editor.BlockEdit',
	'enable-navigation-icons/with-block-controls',
	compose( [ withColors( { iconColor: 'iconColor' } ), withBlockControls ] )
);

/**
 * Add icon and position classes in the Editor.
 *
 * @since 0.1.0
 * @param {Object} BlockListBlock
 */
function addClasses( BlockListBlock ) {
	return ( props ) => {
		const { name, attributes, clientId } = props;

		if (
			( name !== 'core/navigation-link' &&
				name !== 'core/navigation-submenu' &&
				name !== 'ollie/mega-menu' ) ||
			! ( attributes?.icon || attributes?.iconName )
		) {
			return <BlockListBlock { ...props } />;
		}

		// Get parent Navigation block's default settings
		const parentNavigationDefaults = useSelect(
			( select ) => {
				const { getBlockParentsByBlockName, getBlockAttributes } =
					select( 'core/block-editor' );
				const navigationParents = getBlockParentsByBlockName(
					clientId,
					'core/navigation'
				);

				if ( navigationParents && navigationParents.length > 0 ) {
					const parentId = navigationParents[ 0 ];
					return getBlockAttributes( parentId );
				}

				return {};
			},
			[ clientId ]
		);

		// Determine effective settings based on useDefaultIconSettings
		const useDefaults = attributes?.useDefaultIconSettings !== false; // Default to true
		const effectiveIconSize =
			useDefaults && parentNavigationDefaults?.defaultIconSize
				? parentNavigationDefaults.defaultIconSize
				: attributes?.iconSize;
		const effectiveIconSpacing =
			useDefaults && parentNavigationDefaults?.defaultIconSpacing
				? parentNavigationDefaults.defaultIconSpacing
				: attributes?.iconSpacing;
		const effectiveIconPositionLeft =
			useDefaults &&
			parentNavigationDefaults?.defaultIconPositionLeft !== undefined
				? parentNavigationDefaults.defaultIconPositionLeft
				: attributes?.iconPositionLeft;
		const effectiveCustomIconColor =
			useDefaults && parentNavigationDefaults?.defaultCustomIconColor
				? parentNavigationDefaults.defaultCustomIconColor
				: attributes?.customIconColor;
		const effectiveJustifySpaceBetween =
			useDefaults &&
			parentNavigationDefaults?.defaultJustifySpaceBetween !== undefined
				? parentNavigationDefaults.defaultJustifySpaceBetween
				: attributes?.justifySpaceBetween;
		const effectiveHasNoIconFill =
			useDefaults &&
			parentNavigationDefaults?.defaultHasNoIconFill !== undefined
				? parentNavigationDefaults.defaultHasNoIconFill
				: attributes?.hasNoIconFill;

		const id = useInstanceId( BlockListBlock );
		const selectorPrefix = `wp-block-navigation-item-has-icon-`;
		const selectorClassname = `${ selectorPrefix }${ id }`;
		const selector = `.${ selectorClassname } .wp-block-navigation-item__content::before, .${ selectorClassname } .wp-block-navigation-item__content::after`;

		// Get CSS string for the current icon.
		// The CSS and `style` element is only output if it is not empty.
		const css = getIconStyle( {
			selector,
			icon: attributes?.icon,
			iconName: attributes?.iconName,
			customIconColor: effectiveCustomIconColor,
			iconSize: effectiveIconSize,
			iconSpacing: effectiveIconSpacing,
		} );

		const classes = classnames( props?.className, {
			[ `has-icon__${ attributes?.iconName }` ]: attributes?.iconName,
			'has-icon__custom': attributes?.icon && ! attributes?.iconName,
			'has-icon-position__left': effectiveIconPositionLeft,
			'has-justified-space-between': effectiveJustifySpaceBetween,
			'has-no-icon-fill': effectiveHasNoIconFill,
			[ `${ selectorClassname }` ]: true,
		} );

		useStyleOverride( { css } );

		return <BlockListBlock { ...props } className={ classes } />;
	};
}

addFilter(
	'editor.BlockListBlock',
	'enable-navigation-icons/add-classes',
	addClasses
);
