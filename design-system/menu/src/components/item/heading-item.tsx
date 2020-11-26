/** @jsx jsx */
import { jsx } from '@emotion/core';

import { HeadingItemProps } from '../types';

import { itemHeadingCSS } from './styles';

const HeadingItem = ({
  children,
  testId,
  id,
  cssFn = () => ({}),
  ...rest
}: HeadingItemProps) => {
  return (
    <div
      css={[itemHeadingCSS, cssFn(undefined)]}
      data-testid={testId}
      data-ds--menu--heading-item
      id={id}
      {...rest}
    >
      {children}
    </div>
  );
};

export default HeadingItem;
