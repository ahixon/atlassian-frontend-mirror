/** @jsx jsx */
import { css, jsx } from '@emotion/core';

import Lozenge from '@atlaskit/lozenge';

import { getTokenId } from '../../../src/utils/token-ids';
import type { TransformedTokenMerged } from '../types';

import CopyButton from './copy-button';

const tokenItemNameStyles = css({
  display: 'flex',
  alignItems: 'center',
});

const tokenItemNameButtonStyles = css({
  marginRight: 10,
});

enum LozengeAppearance {
  deprecated = 'moved',
  deleted = 'removed',
}
interface TokenItemNameProps
  extends Pick<TransformedTokenMerged, 'name' | 'attributes'> {
  className?: string;
}

const TokenItemName = ({ name, attributes, className }: TokenItemNameProps) => {
  const cleanName = getTokenId(name);

  return (
    <div css={tokenItemNameStyles} className={className}>
      <CopyButton copyValue={cleanName} css={tokenItemNameButtonStyles}>
        {cleanName}
      </CopyButton>
      {attributes.state !== 'active' && (
        <Lozenge appearance={LozengeAppearance[attributes.state]}>
          {attributes.state}
        </Lozenge>
      )}
    </div>
  );
};

export default TokenItemName;
