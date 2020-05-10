import React from 'react';

import TransitionGroup from 'react-transition-group/TransitionGroup';
import styled from 'styled-components';

import { gridSize, layers } from '@atlaskit/theme/constants';
import { multiply } from '@atlaskit/theme/math';

export default styled.div`
  bottom: ${multiply(gridSize, 6)}px;
  left: ${multiply(gridSize, 10)}px;
  position: fixed;
  z-index: ${layers.flag};

  @media (max-width: 560px) {
    bottom: 0;
    left: 0;
  }
`;

export const SROnly: React.ComponentType<{
  tag: string;
}> = styled(({ tag, children, ...props }) =>
  React.createElement(tag, props, children),
)`
  border: 0;
  clip: rect(1px, 1px, 1px, 1px);
  height: 1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

export const Inner = styled(TransitionGroup)`
  position: relative;
`;
