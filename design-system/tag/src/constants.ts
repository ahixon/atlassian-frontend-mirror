import { borderRadius, fontSize, gridSize } from '@atlaskit/theme/constants';

const gridSizeValue = gridSize();
const borderRadiusValue = borderRadius();
const fontSizeValue = fontSize();

export const tagHeightUnitless = 2.5 * gridSizeValue;
export const tagHeight = `${tagHeightUnitless}px`;
export const buttonWidthUnitless = tagHeightUnitless; // button should be square
export const buttonWidth = tagHeight; // button should be square
export const maxWidthUnitless = 25 * gridSizeValue;
export const maxWidth = `${maxWidthUnitless}px`;
export const maxTextWidthUnitless = maxWidthUnitless - tagHeightUnitless;
export const maxTextWidth = `${maxTextWidthUnitless}px`;

export const defaultBorderRadius = `${borderRadiusValue}px`;
export const defaultRoundedBorderRadius = `${buttonWidthUnitless / 2}px`;
export const defaultMargin = `${gridSizeValue / 2}px`;
export const defaultTextPadding = `${gridSizeValue / 2}px`;
export const textPaddingRight = `${2 * gridSizeValue}px`;
export const textMarginLeft = `${tagHeightUnitless}px`;
export const textFontSize = `${fontSizeValue}px`;

export const cssVar = {
  color: {
    background: {
      default: '--ds-cb',
      hover: '--ds-cbh',
      active: '--ds-cba',
    },
    focusRing: '--ds-cfr',
    text: {
      default: '--ds-ct',
      hover: '--ds-cth',
      active: '--ds-ctp',
      link: '--ds-ctl',
    },
    removeButton: {
      default: '--ds-rb',
      hover: '--ds-rbh',
    },
  },
  borderRadius: '--ds-br',
};
