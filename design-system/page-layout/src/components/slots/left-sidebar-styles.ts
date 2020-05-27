import { CSSObject } from '@emotion/core';

import { easeOut, prefersReducedMotion } from '@atlaskit/motion';

import {
  BANNER_HEIGHT,
  COLLAPSED_LEFT_SIDEBAR_WIDTH,
  IS_SIDEBAR_COLLAPSED,
  IS_SIDEBAR_COLLAPSING,
  IS_SIDEBAR_DRAGGING,
  LEFT_PANEL_WIDTH,
  LEFT_SIDEBAR_FLYOUT,
  LEFT_SIDEBAR_WIDTH,
  MAIN_SELECTOR,
  RESIZE_BUTTON_SELECTOR,
  RESIZE_CONTROL_SELECTOR,
  TOP_NAVIGATION_HEIGHT,
  TRANSITION_DURATION,
} from '../../common/constants';
// This inner wrapper is required to allow the
// sidebar to be position: fixed. If we were to apply position: fixed
// to the outer wrapper, it will be popped out of it's flex container
// and Main would stretch to occupy all the space.
export const fixedLeftSidebarInnerStyles = (
  isFixed?: boolean,
  isFlyoutOpen?: boolean,
): CSSObject => ({
  ...(isFixed
    ? {
        position: 'fixed',
        top: `calc(var(--${BANNER_HEIGHT}) + var(--${TOP_NAVIGATION_HEIGHT}))`,
        left: `calc(var(--${LEFT_PANEL_WIDTH}))`,
        bottom: 0,
        width: `var(--${LEFT_SIDEBAR_WIDTH})`,
        transition: `width ${TRANSITION_DURATION}ms ${easeOut} 0s`,

        [`[${IS_SIDEBAR_DRAGGING}] &`]: {
          // Make sure drag to resize does not animate as the user drags
          transition: 'none',
          cursor: 'ew-resize',
        },

        ...(isFlyoutOpen && {
          width: `var(--${LEFT_SIDEBAR_FLYOUT})`,
        }),
      }
    : {
        height: '100%',
      }),

  // Hide contents when collapsed
  ...(!isFlyoutOpen && {
    [`[${IS_SIDEBAR_COLLAPSED}] & > *:not([${RESIZE_CONTROL_SELECTOR}])`]: {
      transition: `0ms linear ${TRANSITION_DURATION - 100}ms`,
      transitionProperty: 'opacity, visibility',
      opacity: 0,
      visibility: 'hidden',
      ...prefersReducedMotion(),
    },
  }),
  [`[${IS_SIDEBAR_COLLAPSING}] & > *:not([${RESIZE_CONTROL_SELECTOR}])`]: {
    transition: `0ms linear ${TRANSITION_DURATION - 100}ms`,
    transitionProperty: 'opacity, visibility',
    opacity: 0,
    visibility: 'hidden',
    ...prefersReducedMotion(),
  },
  [`& > *:not([${RESIZE_CONTROL_SELECTOR}])`]: {
    transition: 'none',
    visibility: 'visible',
    opacity: 1,
  },

  ...prefersReducedMotion(),
});

export const leftSidebarStyles = (
  isFixed?: boolean,
  isFlyoutOpen?: boolean,
): CSSObject => ({
  position: 'relative',
  width: `var(--${LEFT_SIDEBAR_WIDTH})`,
  transition: `width ${TRANSITION_DURATION}ms ${easeOut} 0s`,
  zIndex: 1, // Make resize affordance appear on top of content
  marginLeft: 0,

  [`[${IS_SIDEBAR_DRAGGING}] &`]: {
    // Make sure drag to resize does not animate as the user drags
    transition: 'none',
    cursor: 'ew-resize',
  },

  [`&:hover [${RESIZE_BUTTON_SELECTOR}]`]: {
    opacity: 1,
  },

  ...(isFlyoutOpen && {
    width: `var(--${LEFT_SIDEBAR_FLYOUT})`,
  }),

  ...(isFlyoutOpen &&
    !isFixed && {
      [`& + [${MAIN_SELECTOR}]`]: {
        // adds a negative left margin to main
        // which transitions at the same speed
        // with which left sidebars width increases
        // This give an illusion that the flyout is appearing
        // on top of the main content, while main remains in place
        marginLeft: `calc(-1 * var(--${LEFT_SIDEBAR_FLYOUT}) + ${COLLAPSED_LEFT_SIDEBAR_WIDTH}px)`,
      },
    }),

  ...(isFixed && {
    // in fixed mode this element's child is taken out of the document flow
    // It doesn't take up the width as expected
    // psuedo element forces it to take up the necessary width
    '&::after': {
      content: "''",
      display: 'inline-block',
      width: `var(--${LEFT_SIDEBAR_WIDTH})`,
    },

    ...(isFlyoutOpen && {
      width: COLLAPSED_LEFT_SIDEBAR_WIDTH,
    }),
  }),

  ...prefersReducedMotion(),
});