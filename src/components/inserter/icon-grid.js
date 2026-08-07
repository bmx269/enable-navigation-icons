/**
 * External dependencies
 */
import classnames from 'classnames';
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Icon, blockDefault } from '@wordpress/icons';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { getOwnRegistryName, parseIcon } from './../../utils';

export default function IconGrid( props ) {
	const { shownIcons, iconSize, updateIconAtts, attributes } = props;

	const noResults = (
		<div className="block-editor-inserter__no-results">
			<Icon
				icon={ blockDefault }
				className="block-editor-inserter__no-results-icon"
			/>
			<p>{ __( 'No results found.', 'block-icon' ) }</p>
		</div>
	);

	const searchResults = (
		<div className="icons-list">
			{ shownIcons.map( ( icon ) => {
				let renderedIcon = icon.icon;

				// Icons provided by third-parties are generally strings.
				if ( typeof renderedIcon === 'string' ) {
					renderedIcon = parseIcon( renderedIcon );
				}

				// An icon can be stored under its Icon API name, its own-
				// collection registry name (bundled picks), or its bare JS
				// name (legacy content) — highlight it for any of the three.
				const storedNames = [ icon?.coreName ?? icon.name, icon.name ];
				if ( icon?.type === 'wordpress' ) {
					storedNames.push( getOwnRegistryName( icon.name ) );
				}

				return (
					<Button
						key={ `icon-${ icon.name }` }
						className={ classnames(
							'icons-list__item',
							'block-editor-block-types-list__item',
							{
								'is-active': storedNames.includes(
									attributes?.iconName
								),
								'has-no-icon-fill': icon?.hasNoIconFill,
							}
						) }
						onClick={ () =>
							updateIconAtts(
								icon.icon,
								icon.name,
								icon?.hasNoIconFill,
								icon
							)
						}
					>
						<span className="icons-list__item-icon">
							<Icon icon={ renderedIcon } size={ iconSize } />
						</span>
						<span className="icons-list__item-title">
							{ icon?.title ?? icon.name }
						</span>
					</Button>
				);
			} ) }
		</div>
	);

	return (
		<div className="icon-inserter__content-grid">
			{ isEmpty( shownIcons ) ? noResults : searchResults }
		</div>
	);
}
