/** @jsx jsx */
import React from 'react';

import { jsx } from '@emotion/core';

import deprecationWarning from '@atlaskit/ds-lib/deprecation-warning';

import { Theme } from '../theme';
import { DefaultProgressBarProps, ThemeTokens } from '../types';

const maxValue = 1;

const Bar = ({
  isIndeterminate,
  tokens,
}: {
  isIndeterminate: boolean;
  tokens: ThemeTokens;
}) => {
  if (isIndeterminate) {
    return (
      <React.Fragment>
        <span css={[tokens.bar, tokens.increasingBar]} />
        <span css={[tokens.bar, tokens.decreasingBar]} />
      </React.Fragment>
    );
  }
  return <span css={[tokens.bar, tokens.determinateBar]} />;
};

export default class ProgressBar extends React.PureComponent<
  DefaultProgressBarProps
> {
  static defaultProps = {
    value: 0,
    isIndeterminate: false,
  };

  render() {
    const { ariaLabel, value, isIndeterminate, theme } = this.props;
    const valueParsed = isIndeterminate
      ? 0
      : Math.max(0, Math.min(value, maxValue));

    deprecationWarning(
      '@atlaskit/progress-bar',
      '`theme` prop',
      'If you depend on `theme`, we recommend migrating to one of its variants.',
    );

    return (
      <Theme.Provider value={theme}>
        <Theme.Consumer value={value}>
          {(tokens) => (
            <div
              css={tokens.container}
              role="progressbar"
              aria-label={ariaLabel}
              aria-valuemin={0}
              aria-valuenow={valueParsed}
              aria-valuemax={maxValue}
              tabIndex={0}
              data-testid="progress-bar"
            >
              <Bar isIndeterminate={isIndeterminate} tokens={tokens} />
            </div>
          )}
        </Theme.Consumer>
      </Theme.Provider>
    );
  }
}
