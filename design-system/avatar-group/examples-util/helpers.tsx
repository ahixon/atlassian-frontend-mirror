/* eslint-disable @atlaskit/design-system/ensure-design-token-usage */
import React, { ReactNode } from 'react';

import styled from '@emotion/styled';

import { SizeType } from '@atlaskit/avatar';
import { N100, R400, R50, subtleHeading, text } from '@atlaskit/theme/colors';
import { gridSize as getGridSize } from '@atlaskit/theme/constants';

const gridSize = getGridSize();

const Wrapper = styled.div`
  margin-top: ${gridSize}px;
`;

const ChildrenWrapper = styled.div`
  align-items: baseline;
  color: ${text};
  display: flex;

  > * {
    margin-right: ${gridSize}px;
  }
`;

export const Note = styled.p<{ size?: SizeType }>`
  color: ${N100};
  font-size: ${(props) => (props.size === 'large' ? '1.15em' : '0.9rem')};
  margin-top: ${gridSize / 2}px;
  margin-bottom: ${gridSize * 2}px;
`;

export const Code = styled.code`
  background-color: ${R50};
  border-radius: 0.2em;
  color: ${R400};
  font-size: 0.85em;
  line-height: 1.1;
  padding: 0.1em 0.4em;
`;

export const Gap = styled.span`
  margin-right: ${gridSize}px;
`;

export const Dot = styled(Gap)`
  height: ${gridSize * 3}px;
  width: ${gridSize * 3}px;
`;
export const Heading = styled.div`
  color: ${subtleHeading};
  display: flex;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.5em;
  text-transform: uppercase;
`;

export const ExampleGroup = ({
  children,
  heading,
}: {
  children?: ReactNode;
  heading?: string;
}) => (
  <Wrapper>
    {heading ? <Heading>{heading}</Heading> : null}
    <ChildrenWrapper>{children}</ChildrenWrapper>
  </Wrapper>
);
