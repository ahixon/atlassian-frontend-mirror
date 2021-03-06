import React from 'react';

import styled from 'styled-components';

import Button from '@atlaskit/button/custom-theme-button';
import { CustomThemeButtonProps } from '@atlaskit/button/types';
import { N500 } from '@atlaskit/theme/colors';
import { token } from '@atlaskit/tokens';

const IntegrationButtonCopyWrapper = styled.span`
  color: ${(props) => props.theme.textColor || token('color.text', N500)};
  display: flex;
  justify-content: left;
`;

const IntegrationIconWrapper = styled.span`
  margin: 1px 8px 0 0;
`;

type Props = CustomThemeButtonProps & {
  text: React.ReactNode;
  IntegrationIcon: React.ComponentType;
  textColor?: string;
};

const IntegrationButton: React.FC<Props> = (props) => {
  const { text, textColor, IntegrationIcon, ...restProps } = props;
  return (
    <Button {...restProps}>
      <IntegrationButtonCopyWrapper theme={{ textColor: textColor }}>
        <IntegrationIconWrapper>
          <IntegrationIcon />
        </IntegrationIconWrapper>
        <span>{text}</span>
      </IntegrationButtonCopyWrapper>
    </Button>
  );
};

IntegrationButton.displayName = 'IntegrationButton';

export default IntegrationButton;
