/** @jsx jsx */
import { css, jsx, keyframes } from '@emotion/core';

import { P300 } from '@atlaskit/theme/colors';
import { layers } from '@atlaskit/theme/constants';
import { token } from '@atlaskit/tokens';

type BaseProps = React.HTMLAttributes<HTMLDivElement> & {
  bgColor?: string;
  radius?: number;
  className?: string;
  testId?: string;
};

type TargetProps = Omit<BaseProps, 'css'> & {
  // eslint-disable-next-line @repo/internal/react/boolean-prop-naming-convention
  pulse?: boolean;
  testId?: string;
};

// NOTE:
// Pulse color "rgb(101, 84, 192)" derived from "colors.P300"
const baseShadow = `0 0 0 2px ${token('color.border.discovery', P300)}`;
const easing = 'cubic-bezier(0.55, 0.055, 0.675, 0.19)';
const pulseKeyframes = keyframes({
  '0%, 33%': {
    boxShadow: `${baseShadow}, 0 0 0 ${token(
      'color.border.discovery',
      'rgba(101, 84, 192, 1)',
    )}`,
  },
  '66%, 100%': {
    boxShadow: `${baseShadow}, 0 0 0 10px rgba(101, 84, 192, 0.01)`,
  },
});
// This is needed for unit tests
export const pulseKeyframesName = pulseKeyframes.name;
const animationStyles = css({
  animation: `${pulseKeyframes} 3000ms ${easing} infinite`,
});

// IE11 and Edge: z-index needed because fixed position calculates z-index relative
// to body instead of nearest stacking context (Portal in our case).
const baseStyles = css({
  zIndex: layers.spotlight() + 1,
});

const Base: React.FC<BaseProps> = ({
  children,
  bgColor,
  radius,
  style,
  testId,
  ...props
}) => (
  <div
    css={baseStyles}
    data-testid={testId}
    style={
      {
        ...style,
        backgroundColor: bgColor,
        borderRadius: radius ? `${radius}px` : undefined,
      } as React.CSSProperties
    }
    // eslint-disable-next-line @repo/internal/react/no-unsafe-spread-props
    {...props}
  >
    {children}
  </div>
);

/**
 * __Target inner__
 *
 * Used to apply spotlight border and pulse to spotlight targets.
 *
 * @internal
 */
export const TargetInner: React.FC<TargetProps> = ({
  children,
  pulse,
  ...props
}) => (
  // eslint-disable-next-line @repo/internal/react/no-unsafe-spread-props
  <Base {...props} css={[pulse && animationStyles]}>
    {children}
  </Base>
);

const targetOverlayStyles = css({
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
});

/**
 * __Target overlay__
 *
 * Overlays a spotlight target, allowing for custom click events that are intended
 * only for onboarding.
 *
 * @internal
 */
export const TargetOverlay: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props,
) => (
  <div
    // eslint-disable-next-line @repo/internal/react/no-unsafe-spread-props
    {...props}
    css={targetOverlayStyles}
    style={
      {
        cursor: props.onClick ? 'pointer' : 'auto',
      } as React.CSSProperties
    }
  />
);

/**
 * __Pulse__
 *
 * Allows consumers to apply the spotlight pulse effect in a custom way.
 *
 * - [Examples](https://atlaskit.atlassian.com/packages/design-system/onboarding)
 */
export const Pulse: React.FC<TargetProps> = ({
  children,
  pulse = true,
  testId,
  ...props
}) => (
  // eslint-disable-next-line @repo/internal/react/no-unsafe-spread-props
  <Base {...props} css={[pulse && animationStyles]} testId={testId}>
    {children}
  </Base>
);
