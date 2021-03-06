/** @jsx jsx */
import { memo, useMemo } from 'react';

import { css, jsx } from '@emotion/core';

import Button from '@atlaskit/button/standard-button';
import ArrowleftIcon from '@atlaskit/icon/glyph/chevron-left-large';
import ArrowrightIcon from '@atlaskit/icon/glyph/chevron-right-large';
import { DN800, N70, N800 } from '@atlaskit/theme/colors';
import { ThemeModes } from '@atlaskit/theme/types';
import { token } from '@atlaskit/tokens';

const headingColor = {
  light: token('color.text', N800),
  dark: token('color.text', DN800),
};

const headingStyles = css({
  display: 'flex',
  padding: '0 0 13px 0',
  color: token('color.text', N800),
  fontWeight: 'bold',
});

const getMonthAndYearStyles = (mode: ThemeModes = 'light') =>
  css({
    flexBasis: '100%',
    color: headingColor[mode],
    textAlign: 'center',
  });

const arrowLeftStyles = css({ marginLeft: 8 });
const arrowRightStyles = css({ marginRight: 8 });

interface Props {
  monthLongTitle: string;
  year: number;
  previousMonthLabel?: string;
  nextMonthLabel?: string;
  handleClickNext?: () => void;
  handleClickPrev?: () => void;
  mode?: ThemeModes;
  testId?: string;
}

const Heading = memo<Props>(function Heading({
  monthLongTitle,
  year,
  previousMonthLabel = 'Last month',
  nextMonthLabel = 'Next month',
  handleClickPrev,
  handleClickNext,
  mode,
  testId,
}) {
  const monthAndYearStyles = useMemo(() => getMonthAndYearStyles(mode), [mode]);
  return (
    <div css={headingStyles} aria-hidden="true">
      <Button
        css={arrowLeftStyles}
        appearance="subtle"
        spacing="none"
        tabIndex={-1}
        onClick={handleClickPrev}
        testId={testId && `${testId}--previous-month`}
        iconBefore={
          <ArrowleftIcon
            label={previousMonthLabel}
            size="medium"
            primaryColor={token('color.text.subtlest', N70)}
            testId={testId && `${testId}--previous-month-icon`}
          />
        }
      />
      <div
        // eslint-disable-next-line @repo/internal/react/consistent-css-prop-usage
        css={monthAndYearStyles}
        data-testid={testId && `${testId}--current-month-year`}
      >
        {`${monthLongTitle} ${year}`}
      </div>
      <Button
        css={arrowRightStyles}
        appearance="subtle"
        spacing="none"
        tabIndex={-1}
        onClick={handleClickNext}
        testId={testId && `${testId}--next-month`}
        iconBefore={
          <ArrowrightIcon
            label={nextMonthLabel}
            size="medium"
            primaryColor={token('color.text.subtlest', N70)}
            testId={testId && `${testId}--next-month-icon`}
          />
        }
      />
    </div>
  );
});

Heading.displayName = 'Heading';

export default Heading;
