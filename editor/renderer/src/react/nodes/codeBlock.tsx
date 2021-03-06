/** @jsx jsx */
import { jsx, css } from '@emotion/react';

import { injectIntl, WrappedComponentProps } from 'react-intl-next';

import { CodeBlock as AkCodeBlock, SupportedLanguages } from '@atlaskit/code';
import {
  overflowShadow,
  relativeFontSizeToBase16,
} from '@atlaskit/editor-shared-styles';
import { N20, DN50 } from '@atlaskit/theme/colors';
import { themed } from '@atlaskit/theme/components';
import { fontSize, gridSize } from '@atlaskit/theme/constants';
import { codeBidiWarningMessages } from '@atlaskit/editor-common/messages';
import { ThemeProps } from '@atlaskit/theme/types';

import { useFeatureFlags } from '../../use-feature-flags';

import CopyButton from './codeBlockCopyButton';

export interface Props {
  text: string;
  language: SupportedLanguages;
  allowCopyToClipboard?: boolean;
  codeBidiWarningTooltipEnabled: boolean;
  className?: string;
}

// TODO: Quality ticket https://product-fabric.atlassian.net/browse/DSP-4118
/* eslint-disable @atlaskit/design-system/ensure-design-token-usage */
const codeBlockStyle = (props?: ThemeProps) =>
  css`
    tab-size: 4;
    [data-ds--code--code-block] {
      font-size: ${relativeFontSizeToBase16(fontSize())};
      line-height: 1.5rem;
      background-image: ${overflowShadow({
        background: themed({ light: N20, dark: DN50 })(props),
        width: `${gridSize()}px`,
      })};
      background-attachment: local, scroll, scroll;
      background-position: 100% 0, 100% 0, 0 0;
    }
  `;
/* eslint-enable */

function CodeBlock(props: Props & WrappedComponentProps) {
  const {
    text,
    language,
    allowCopyToClipboard = false,
    codeBidiWarningTooltipEnabled,
  } = props;
  const featureFlags = useFeatureFlags();

  const codeBidiWarningLabel = props.intl.formatMessage(
    codeBidiWarningMessages.label,
  );

  const className = ['code-block', props.className].join(' ');

  return (
    <div className={className} css={codeBlockStyle}>
      {allowCopyToClipboard ? <CopyButton content={text} /> : null}
      <AkCodeBlock
        language={language}
        text={text}
        codeBidiWarnings={featureFlags?.codeBidiWarnings}
        codeBidiWarningLabel={codeBidiWarningLabel}
        codeBidiWarningTooltipEnabled={codeBidiWarningTooltipEnabled}
      />
    </div>
  );
}

export default injectIntl(CodeBlock);
