/* eslint-disable @atlaskit/design-system/ensure-design-token-usage */
/** @jsx jsx */
import { css, jsx } from '@emotion/core';

import DynamicTable from '../src';

import { head, rows } from './content/sample-data';

const wrapperStyles = css({
  position: 'relative',
  table: {
    width: 1000,
  },
});

const overflow = css({
  overflowX: 'auto',
  '::after': {
    top: 0,
    position: 'absolute',
    left: 'calc(100% - 8px)',
    height: '100%',
    width: 8,
    content: "''",
    background: `linear-gradient(to right, rgba(99, 114, 130, 0) 0px, rgba(9, 30, 66, 0.13) 100%)`,
  },
});

const HeadlessExample = () => (
  <div css={wrapperStyles}>
    <div css={overflow}>
      <DynamicTable head={head} rows={rows.slice(0, 10)} />
    </div>
  </div>
);

export default HeadlessExample;
