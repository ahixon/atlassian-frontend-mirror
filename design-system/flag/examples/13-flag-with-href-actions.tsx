import React, { Fragment, ReactElement } from 'react';

import Tick from '@atlaskit/icon/glyph/check-circle';
import Error from '@atlaskit/icon/glyph/error';
import Info from '@atlaskit/icon/glyph/info';
import Warning from '@atlaskit/icon/glyph/warning';
import { G400, N0, N500, R300, Y300 } from '@atlaskit/theme/colors';
import { token } from '@atlaskit/tokens';

import Flag, { AppearanceTypes } from '../src';

type FlagType = {
  appearance: AppearanceTypes;
  description: string;
  title: string;
  icon: ReactElement;
};

const FlagActions = [
  {
    content: 'with onClick',
    onClick: () => {
      console.log('flag action clicked');
    },
  },
  {
    content: 'with href',
    href: 'https://atlaskit.atlassian.com/',
    target: '_blank',
  },
];

const flagTypes: Array<FlagType> = [
  {
    appearance: 'error',
    description: 'You need to take action, something has gone terribly wrong!',
    title: 'error flag',
    icon: (
      <Error
        label="Error"
        secondaryColor={token('color.iconBorder.danger', R300)}
      />
    ),
  },
  {
    appearance: 'info',
    description:
      "This alert needs your attention, but it's not super important.",
    title: 'info flag',
    icon: (
      <Info
        label="Info"
        secondaryColor={token('color.iconBorder.discovery', N500)}
      />
    ),
  },
  {
    appearance: 'success',
    description: 'Nothing to worry about, everything is going great!',
    title: 'success flag',
    icon: (
      <Tick
        label="Success"
        secondaryColor={token('color.iconBorder.success', G400)}
      />
    ),
  },
  {
    appearance: 'warning',
    description: 'Pay attention to me, things are not going according to plan.',
    title: 'warning flag',
    icon: (
      <Warning
        label="Warning"
        secondaryColor={token('color.iconBorder.warning', Y300)}
      />
    ),
  },
  {
    appearance: 'normal',
    description: 'There is new update available',
    title: 'normal flag',
    icon: (
      <Tick
        label="Success"
        secondaryColor={token('color.iconBorder.brand', N0)}
      />
    ),
  },
];

export default () => (
  <Fragment>
    {flagTypes.map((flag: FlagType) => (
      <div key={flag.appearance} style={{ marginBottom: '10px' }}>
        <Flag
          appearance={flag.appearance}
          actions={FlagActions}
          description={flag.description}
          icon={flag.icon}
          id="1"
          key="1"
          title={flag.title}
        />
      </div>
    ))}
  </Fragment>
);
