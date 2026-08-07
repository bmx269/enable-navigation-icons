export {
	getIconTypes,
	flattenIconsArray,
	simplifyCategories,
} from './icon-functions';
export { parseIcon } from './parse-icon';
export {
	parseUploadedMediaAndSetIcon,
	parseDroppedMediaAndSetIcon,
} from './parse-media';
export { displayMessages } from './display-messages';
export { getIconStyle } from './icon-style';
export {
	CORE_ICON_TYPE_PREFIX,
	OWN_COLLECTION,
	getCoreIconContent,
	getIconClassSuffix,
	getOwnRegistryName,
	isCoreIconName,
	isOwnCollectionName,
	useCoreIcons,
} from './use-core-icons';
export { default as normalizeIconName } from './normalize-icon-name';
