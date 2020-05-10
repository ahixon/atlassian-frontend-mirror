import React, { Component } from 'react';

import styled from 'styled-components';

import Button from '@atlaskit/button';

import { ProgressDots } from '../../src';

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

interface Props {
  selectedIndex: number;
  values: Array<string>;
}

interface State {
  selectedIndex: number;
}

export default class extends Component<Props, State> {
  static defaultProps = {
    selectedIndex: 0,
    values: ['first', 'second', 'third'],
  };

  state = {
    selectedIndex: this.props.selectedIndex,
  };

  /* eslint-disable */
  handleSelect = ({
    event,
    index: selectedIndex,
  }: {
    event: React.MouseEvent<HTMLButtonElement>;
    index: number;
  }): void => {
    this.setState({ selectedIndex });
  };

  handlePrev = () => {
    this.setState(prevState => ({
      selectedIndex: prevState.selectedIndex - 1,
    }));
  };

  handleNext = () => {
    this.setState(prevState => ({
      selectedIndex: prevState.selectedIndex + 1,
    }));
  };

  render() {
    const { values } = this.props;
    const { selectedIndex } = this.state;
    return (
      <Footer>
        <Button isDisabled={selectedIndex === 0} onClick={this.handlePrev}>
          Prev
        </Button>
        <ProgressDots
          selectedIndex={selectedIndex}
          values={values}
          onSelect={this.handleSelect}
        />
        <Button
          isDisabled={selectedIndex === values.length - 1}
          onClick={this.handleNext}
        >
          Next
        </Button>
      </Footer>
    );
  }
}
