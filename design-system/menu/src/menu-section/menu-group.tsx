/** @jsx jsx */
import { css, jsx } from '@emotion/core';

import type { MenuGroupProps } from '../types';

const groupStyles = css({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
});

/**
 * __Menu group__
 *
 * A menu group includes all the actions or items in a menu.
 *
 * - [Examples](https://atlaskit.atlassian.com/packages/design-system/menu/docs/menu-group)
 * - [Code](https://atlaskit.atlassian.com/packages/design-system/menu)
 */
const MenuGroup = ({
  maxWidth,
  minWidth,
  minHeight,
  maxHeight,
  testId,
  role,
  ...rest
}: MenuGroupProps) => (
  <div
    style={{
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
    }}
    css={groupStyles}
    data-testid={testId}
    role={role}
    // eslint-disable-next-line @repo/internal/react/no-unsafe-spread-props
    {...rest}
  />
);

export default MenuGroup;
