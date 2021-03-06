import React from 'react';
import LockFilledIcon from '@atlaskit/icon/glyph/lock-filled';
import { injectIntl, WrappedComponentProps } from 'react-intl-next';
import { TitleBoxIcon as TitleBoxIconType } from '../../../index';
import {
  TitleBoxWrapper,
  TitleBoxHeader,
  TitleBoxFooter,
  TitleBoxIcon,
} from './styled';
import { Breakpoint } from '../common';
import { Truncate } from '@atlaskit/media-ui/truncateText';

import { formatDate } from '@atlaskit/media-ui/formatDate';

export type TitleBoxProps = {
  name: string;
  breakpoint: Breakpoint;
  createdAt?: number;
  titleBoxBgColor?: string;
  titleBoxIcon?: TitleBoxIconType;
};

type FormattedDateProps = { timestamp: number };

export const FormattedDate: React.ComponentType<FormattedDateProps> = injectIntl(
  ({ timestamp, intl }: FormattedDateProps & WrappedComponentProps) => {
    const { locale = 'en' } = intl || { locale: 'en' };
    return <>{formatDate(timestamp, locale)}</>;
  },
);

export const TitleBox = ({
  name,
  createdAt,
  breakpoint,
  titleBoxBgColor,
  titleBoxIcon,
}: TitleBoxProps) => (
  <TitleBoxWrapper breakpoint={breakpoint} titleBoxBgColor={titleBoxBgColor}>
    <TitleBoxHeader hasIconOverlap={!!titleBoxIcon && !createdAt}>
      <Truncate text={name} />
    </TitleBoxHeader>
    {createdAt ? (
      <TitleBoxFooter hasIconOverlap={!!titleBoxIcon}>
        <FormattedDate timestamp={createdAt} />
      </TitleBoxFooter>
    ) : null}
    {titleBoxIcon === 'LockFilledIcon' && (
      <TitleBoxIcon>
        <LockFilledIcon label="" size="small" />
      </TitleBoxIcon>
    )}
  </TitleBoxWrapper>
);
