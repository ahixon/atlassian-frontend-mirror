import { css, CSSObject } from '@emotion/core';

import { easeOut, prefersReducedMotion } from '@atlaskit/motion';

import {
  BANNER,
  BANNER_HEIGHT,
  CONTENT,
  IS_SIDEBAR_DRAGGING,
  LEFT_PANEL,
  LEFT_PANEL_WIDTH,
  LEFT_SIDEBAR_WIDTH,
  RIGHT_PANEL,
  RIGHT_PANEL_WIDTH,
  RIGHT_SIDEBAR_WIDTH,
  TOP_NAVIGATION,
  TOP_NAVIGATION_HEIGHT,
  TRANSITION_DURATION,
} from '../../common/constants';

const gridTemplateAreas = `
  "${LEFT_PANEL} ${BANNER} ${RIGHT_PANEL}"
  "${LEFT_PANEL} ${TOP_NAVIGATION} ${RIGHT_PANEL}"
  "${LEFT_PANEL} ${CONTENT} ${RIGHT_PANEL}"
 `;
export const gridStyles = css`
  outline: none;

  /* IE11 */
  display: -ms-grid;
  // prettier-ignore
  -ms-grid-columns: var(--${LEFT_PANEL_WIDTH}, 0px) var(--${LEFT_SIDEBAR_WIDTH}, 0px) 1fr var(--${RIGHT_SIDEBAR_WIDTH}, 0px) var(--${RIGHT_PANEL_WIDTH}, 0px);
  -ms-grid-rows: var(--${BANNER_HEIGHT}, 0px) var(--${TOP_NAVIGATION_HEIGHT}, 0px) 1fr;
  /* IE11 */

  display: grid;
  height: 100%;
  // prettier-ignore
  grid-template-columns: var(--${LEFT_PANEL_WIDTH}, 0px) minmax(0, 1fr) var(--${RIGHT_PANEL_WIDTH}, 0px);
  grid-template-rows: var(--${BANNER_HEIGHT}, 0px) var(--${TOP_NAVIGATION_HEIGHT}, 0px)
    auto;
  grid-template-areas: ${gridTemplateAreas};
`;

export const contentStyles = css`
  /* IE11 */
  -ms-grid-column: 2;
  -ms-grid-column-span: 3;
  -ms-grid-row: 3;
  -ms-grid-row-span: 3;
  /* IE11 */

  grid-area: ${CONTENT};
  display: flex;
  height: 100%;
  position: relative;
`;

export const focusStyles = {
  '&:focus': {
    outline: 'none',
    '&  [data-wrapper-element]': {
      outline: 'none',
      boxShadow: '0px 0px 0px 2px inset #4C9AFF',
    },
    '& > div:not([data-skip-link-wrapper])': {
      outline: 'none',
      boxShadow: '0px 0px 0px 2px inset #4C9AFF',
    },
  },
};

export const bannerStyles = (isFixed?: boolean): CSSObject => ({
  gridArea: `${BANNER}`,
  height: `var(--${BANNER_HEIGHT}, 0px)`,
  ...focusStyles,
  ...(isFixed && {
    position: 'fixed',
    top: 0,
    left: `var(--${LEFT_PANEL_WIDTH}, 0px)`,
    right: `var(--${RIGHT_PANEL_WIDTH}, 0px)`,
    zIndex: 2,
  }),

  // /* IE11 */
  msGridColumn: '2',
  msGridColumnSpan: '3',
  msGridRow: '1',
  // /* IE11 */
});

export const topNavigationStyles = (isFixed?: boolean): CSSObject => ({
  gridArea: `${TOP_NAVIGATION}`,
  height: `var(--${TOP_NAVIGATION_HEIGHT}, 0px)`,
  ...focusStyles,
  ...(isFixed && {
    position: 'fixed',
    top: `var(--${BANNER_HEIGHT}, 0px)`,
    left: `var(--${LEFT_PANEL_WIDTH}, 0px)`,
    right: `var(--${RIGHT_PANEL_WIDTH}, 0px)`,
    zIndex: 2,
  }),

  // /* IE11 */
  msGridColumn: '2',
  msGridColumnSpan: '3',
  msGridRow: '2',
  // /* IE11 */
});

export const mainStyles: CSSObject = {
  ...focusStyles,
  // Prevent flex container from blowing
  // up when there's super wide content
  flexGrow: 1,
  minWidth: 0,
  // Transition negative margin on main
  // in sync with the increase in width of
  // leftSidebar
  transition: `margin-left ${TRANSITION_DURATION}ms ${easeOut} 0s`,
  marginLeft: 0,

  [`[${IS_SIDEBAR_DRAGGING}] &`]: {
    // Make sure drag to resize remains snappy
    transition: 'none',
    cursor: 'ew-resize',
  },

  ...prefersReducedMotion(),
};

// This inner wrapper is required to allow the
// sidebar to be position: fixed. If we were to apply position: fixed
// to the outer wrapper, it will be popped out of it's flex container
// and Main would stretch to occupy all the space.
export const fixedRightSidebarInnerStyles = (isFixed?: boolean): CSSObject => ({
  ...focusStyles,
  ...(isFixed
    ? {
        position: 'fixed',
        top: `calc(var(--${BANNER_HEIGHT},0px) + var(--${TOP_NAVIGATION_HEIGHT},0px))`,
        right: `calc(var(--${RIGHT_PANEL_WIDTH},0px))`,
        bottom: 0,
      }
    : { height: '100%' }),
});

export const rightSidebarStyles = (isFixed?: boolean): CSSObject => ({
  width: `var(--${RIGHT_SIDEBAR_WIDTH}, 0px)`,
  ...focusStyles,
  ...(isFixed && {
    // in fixed mode this element's child is taken out of the document flow
    // It doesn't take up the width as expected
    // psuedo element forces it to take up the necessary width
    '&::after': {
      content: "''",
      display: 'inline-block',
      width: `var(--${LEFT_SIDEBAR_WIDTH}, 0px)`,
    },
  }),
});

export const rightPanelStyles = (isFixed?: boolean): CSSObject => ({
  gridArea: RIGHT_PANEL,
  ...focusStyles,
  ...(isFixed && {
    position: 'fixed',
    width: `var(--${RIGHT_PANEL_WIDTH}, 0px)`,
    top: 0,
    bottom: 0,
    right: 0,
  }),

  /* IE11 */
  msGridColumn: '5',
  msGridRow: '1',
  msGridRowSpan: '3',
  /* IE11 */
});

export const leftPanelStyles = (isFixed?: boolean): CSSObject => ({
  gridArea: LEFT_PANEL,
  ...focusStyles,
  ...(isFixed && {
    position: 'fixed',
    width: `var(--${LEFT_PANEL_WIDTH}, 0px)`,
    top: 0,
    bottom: 0,
    left: 0,
  }),

  /* IE11 */
  msGridColumn: '1',
  msGridRow: '1',
  msGridRowSpan: '3',
  /* IE11 */
});
