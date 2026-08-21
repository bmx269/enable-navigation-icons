/**
 * External dependencies
 */
import classnames from 'classnames';
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	Button,
	Modal,
	Notice,
	RangeControl,
	TextareaControl,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { Icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { bolt } from './../../icons/bolt';
import { parseIcon } from './../../utils';

export default function CustomInserterModal( props ) {
	const {
		isCustomInserterOpen,
		setCustomInserterOpen,
		attributes,
		setAttributes,
	} = props;
	const { icon, iconName } = attributes;
	const [ customIcon, setCustomIcon ] = useState(
		! iconName ? icon || '' : ''
	);
	const [ iconSize, setIconSize ] = useState( 100 );

	// If a SVG icon is inserted from the Media Library, we need to update
	// the custom icon editor in the modal.
	useEffect( () => setCustomIcon( icon ), [ icon ] );

	if ( ! isCustomInserterOpen ) {
		return null;
	}

	function insertCustomIcon() {
		setAttributes( {
			icon: customIcon,
			iconName: '',
		} );
		setCustomInserterOpen( false );
	}

	let iconToRender = parseIcon( customIcon );
	const isSVG = ! isEmpty( iconToRender?.props );

	// Render the defualt lightning bolt if the icon is not a valid SVG.
	iconToRender = isSVG ? iconToRender : bolt;

	return (
		<Modal
			className="wp-block-outermost-icon-custom-inserter__modal"
			title={ __( 'Custom Icon', 'enable-navigation-icons' ) }
			onRequestClose={ () => setCustomInserterOpen( false ) }
			isFullScreen
		>
			<div className="icon-custom-inserter">
				<div className="icon-custom-inserter__content">
					<TextareaControl
						label={ __( 'Custom icon', 'enable-navigation-icons' ) }
						hideLabelFromVision={ true }
						value={ customIcon }
						onChange={ setCustomIcon }
						placeholder={ __(
							'Paste the SVG code for your custom icon.',
							'enable-navigation-icons'
						) }
					/>
				</div>
				<div className="icon-custom-inserter__sidebar">
					<div className="icon-preview">
						<div
							className={ classnames( 'icon-preview__window', {
								'is-default': ! isSVG,
							} ) }
						>
							<Icon icon={ iconToRender } size={ iconSize } />
						</div>
						<div className="icon-controls">
							<div className="icon-controls__size">
								<span>
									{ __(
										'Preview size',
										'enable-navigation-icons'
									) }
								</span>
								<RangeControl
									min={ 24 }
									max={ 400 }
									initialPosition={ 100 }
									withInputField={ false }
									onChange={ ( value ) =>
										setIconSize( value )
									}
								/>
							</div>
						</div>
						{ customIcon && ! isSVG && (
							<Notice status="error" isDismissible={ false }>
								{ __(
									'The custom icon does not appear to be in a valid SVG format or contains non-SVG elements.',
									'enable-navigation-icons'
								) }
							</Notice>
						) }
					</div>
					<div className="icon-insert-buttons">
						<Button
							label={ __(
								'Clear custom icon',
								'enable-navigation-icons'
							) }
							isSecondary
							disabled={ ! customIcon }
							onClick={ () => setCustomIcon( '' ) }
						>
							{ __( 'Clear', 'enable-navigation-icons' ) }
						</Button>
						<Button
							label={ __(
								'Insert custom icon',
								'enable-navigation-icons'
							) }
							isPrimary
							disabled={ ! isSVG || ! customIcon }
							onClick={ insertCustomIcon }
						>
							{ __(
								'Insert custom icon',
								'enable-navigation-icons'
							) }
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
}
