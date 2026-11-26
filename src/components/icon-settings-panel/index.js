/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	RangeControl,
	SelectControl,
	ToggleControl,
	__experimentalToolsPanel as ToolsPanel, // eslint-disable-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem as ToolsPanelItem, // eslint-disable-line @wordpress/no-unsafe-wp-apis
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import DimensionControl from '../dimension-control';

/**
 * The icon presentation settings shared by the Navigation block (as defaults)
 * and by each navigation item (as overrides).
 *
 * `key` is the setting's identity; `attributes` maps it to the attribute name
 * on each kind of block. `shownByDefault` settings are always visible, the rest
 * can be added from the panel's options menu and appear automatically once set.
 *
 * @since 1.0.2
 */
export const ICON_SETTINGS = [
	{
		key: 'size',
		type: 'dimension',
		attributes: { navigation: 'defaultIconSize', item: 'iconSize' },
		label: __( 'Icon size', 'enable-navigation-icons' ),
		units: [ 'px', 'em', 'rem' ],
		shownByDefault: true,
	},
	{
		key: 'spacing',
		type: 'dimension',
		attributes: { navigation: 'defaultIconSpacing', item: 'iconSpacing' },
		label: __( 'Icon spacing', 'enable-navigation-icons' ),
		units: [ 'px', 'em', 'rem' ],
		shownByDefault: true,
	},
	{
		key: 'positionLeft',
		type: 'toggle',
		attributes: {
			navigation: 'defaultIconPositionLeft',
			item: 'iconPositionLeft',
		},
		label: __( 'Show icon on left', 'enable-navigation-icons' ),
		shownByDefault: true,
	},
	{
		key: 'hideLabel',
		type: 'toggle',
		attributes: { navigation: 'defaultHideLabel', item: 'hideLabel' },
		label: __( 'Hide label (icon only)', 'enable-navigation-icons' ),
		help: __(
			'The label is hidden visually but still read by screen readers, so the link keeps an accessible name.',
			'enable-navigation-icons'
		),
		shownByDefault: true,
	},
	{
		key: 'justify',
		type: 'toggle',
		attributes: {
			navigation: 'defaultJustifySpaceBetween',
			item: 'justifySpaceBetween',
		},
		label: __( 'Justify space between', 'enable-navigation-icons' ),
	},
	{
		key: 'noFill',
		type: 'toggle',
		attributes: {
			navigation: 'defaultHasNoIconFill',
			item: 'hasNoIconFill',
		},
		label: __( 'No icon fill (stroke only)', 'enable-navigation-icons' ),
	},
	{
		key: 'verticalAlign',
		type: 'select',
		attributes: {
			navigation: 'defaultIconVerticalAlign',
			item: 'iconVerticalAlign',
		},
		label: __( 'Icon vertical alignment', 'enable-navigation-icons' ),
		emptyValue: 'center',
		options: [
			{ label: __( 'Top', 'enable-navigation-icons' ), value: 'top' },
			{
				label: __( 'Center', 'enable-navigation-icons' ),
				value: 'center',
			},
			{
				label: __( 'Bottom', 'enable-navigation-icons' ),
				value: 'bottom',
			},
		],
	},
	{
		key: 'offset',
		type: 'dimension',
		attributes: { navigation: 'defaultIconOffset', item: 'iconOffset' },
		label: __( 'Icon offset', 'enable-navigation-icons' ),
		units: [ 'px', '%', 'em', 'rem' ],
		min: -100,
	},
	{
		key: 'rotate',
		type: 'range',
		attributes: { navigation: 'defaultIconRotate', item: 'iconRotate' },
		label: __( 'Icon rotation', 'enable-navigation-icons' ),
		help: __(
			'Rotate the icon clockwise, in degrees.',
			'enable-navigation-icons'
		),
	},
	{
		key: 'flipHorizontal',
		type: 'toggle',
		attributes: {
			navigation: 'defaultFlipHorizontal',
			item: 'flipHorizontal',
		},
		label: __( 'Flip horizontally', 'enable-navigation-icons' ),
	},
	{
		key: 'flipVertical',
		type: 'toggle',
		attributes: { navigation: 'defaultFlipVertical', item: 'flipVertical' },
		label: __( 'Flip vertically', 'enable-navigation-icons' ),
	},
];

/**
 * The value an attribute is reset to. Matches the attribute defaults declared
 * in addAttributes(), so a reset setting serializes out of the block comment.
 *
 * @param {Object} setting An ICON_SETTINGS entry.
 * @return {string|number|boolean|undefined} The reset value.
 */
function getResetValue( setting ) {
	if ( setting.type === 'toggle' ) {
		return false;
	}
	if ( setting.type === 'range' ) {
		return 0;
	}
	return undefined;
}

/**
 * Whether a setting currently holds a non-default value.
 *
 * @param {Object}                          setting An ICON_SETTINGS entry.
 * @param {string|number|boolean|undefined} value   The attribute value.
 * @return {boolean} True if the setting has been changed.
 */
function hasSettingValue( setting, value ) {
	if ( setting.type === 'toggle' ) {
		return !! value;
	}
	if ( setting.type === 'range' ) {
		return !! value;
	}
	if ( setting.type === 'select' ) {
		return !! value && value !== setting.emptyValue;
	}
	return value !== undefined && value !== '';
}

/**
 * Build the attribute object that resets every listed setting.
 *
 * @param {Array}  settings ICON_SETTINGS entries.
 * @param {string} scope    `navigation` or `item`.
 * @return {Object} Attributes to pass to setAttributes().
 */
export function getResetAttributes( settings, scope ) {
	return settings.reduce( ( reset, setting ) => {
		reset[ setting.attributes[ scope ] ] = getResetValue( setting );
		return reset;
	}, {} );
}

/**
 * Render the control for one setting.
 *
 * @param {Object}                                props          Component props.
 * @param {Object}                                props.setting  An ICON_SETTINGS entry.
 * @param {string|number|boolean|undefined}       props.value    Current value.
 * @param {(next: string|number|boolean) => void} props.onChange Called with the new value.
 * @return {Element} The control.
 */
function SettingControl( { setting, value, onChange } ) {
	switch ( setting.type ) {
		case 'toggle':
			return (
				<ToggleControl
					__nextHasNoMarginBottom
					label={ setting.label }
					help={ setting.help }
					checked={ !! value }
					onChange={ () => onChange( ! value ) }
				/>
			);
		case 'select':
			return (
				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ setting.label }
					value={ value || setting.emptyValue }
					options={ setting.options }
					onChange={ onChange }
				/>
			);
		case 'range':
			return (
				<RangeControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ setting.label }
					help={ setting.help }
					value={ value ?? 0 }
					onChange={ ( next ) => onChange( next ?? 0 ) }
					min={ -180 }
					max={ 180 }
					step={ 15 }
					allowReset
					resetFallbackValue={ 0 }
				/>
			);
		default:
			return (
				<DimensionControl
					label={ setting.label }
					value={ value || '' }
					onChange={ onChange }
					units={ setting.units }
					min={ setting.min }
				/>
			);
	}
}

/**
 * ToolsPanelItems for the icon presentation settings.
 *
 * Rendered inside a ToolsPanel; each item can be reset individually from the
 * panel menu, and settings that are not shown by default appear as soon as
 * they hold a value, so existing content never hides a configured setting.
 *
 * @since 1.0.2
 * @param {Object}                       props               Component props.
 * @param {string}                       props.scope         `navigation` (defaults) or `item` (overrides).
 * @param {Object}                       props.attributes    Block attributes.
 * @param {(attributes: Object) => void} props.setAttributes Block setAttributes.
 * @param {string}                       props.panelId       The owning block's client ID.
 * @return {Element} The items.
 */
export function IconSettingsItems( {
	scope,
	attributes,
	setAttributes,
	panelId,
} ) {
	return ICON_SETTINGS.map( ( setting ) => {
		const name = setting.attributes[ scope ];
		const value = attributes[ name ];
		return (
			<ToolsPanelItem
				key={ setting.key }
				panelId={ panelId }
				label={ setting.label }
				isShownByDefault={ !! setting.shownByDefault }
				hasValue={ () => hasSettingValue( setting, value ) }
				onDeselect={ () =>
					setAttributes( { [ name ]: getResetValue( setting ) } )
				}
			>
				<SettingControl
					setting={ setting }
					value={ value }
					onChange={ ( next ) => setAttributes( { [ name ]: next } ) }
				/>
			</ToolsPanelItem>
		);
	} );
}

export { ToolsPanel, ToolsPanelItem };
