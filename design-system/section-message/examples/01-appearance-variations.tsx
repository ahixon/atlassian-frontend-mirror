import React from 'react';

import styled from 'styled-components';

import SectionMessage from '../src';

const Padding = styled.div`
  padding: 8px;
`;

const Example = () => (
  <div id="appearance-example">
    <Padding>
      <SectionMessage appearance="info" title="More">
        <p>I count the steps from one end of my island to the other</p>
        <p>It{"'"}s a hundred steps from where I sleep to the sea</p>
      </SectionMessage>
    </Padding>
    <Padding>
      <SectionMessage
        appearance="warning"
        actions={[
          {
            key: 'outtake',
            href: 'https://www.youtube.com/watch?v=upjbIJESEUU',
            text: 'Outtake',
          },
        ]}
      >
        <p>And when I say I{"'"}ve learned all there is to know</p>
        <p>Well there{"'"}s another little island lesson</p>
        <p>Gramma Tala shows me</p>
      </SectionMessage>
    </Padding>
    <Padding>
      <SectionMessage
        appearance="error"
        actions={[
          {
            key: 'outtake',
            onClick: () => {},
            text: 'Outtake',
          },
          {
            key: 'moana',
            text: 'Moana',
          },
        ]}
      >
        <p>I know where I am from the scent of the breeze</p>
        <p>The ascent of the climb</p>
        <p>From the tangle of the trees</p>
      </SectionMessage>
    </Padding>
    <Padding>
      <SectionMessage appearance="confirmation">
        <p>From the angle of the mountain</p>
        <p>To the sand on our island shore</p>
        <p>I{"'"}ve been here before</p>
      </SectionMessage>
    </Padding>
    <Padding>
      <SectionMessage appearance="change">
        <p>From the angle of the mountain</p>
        <p>To the sand on our island shore</p>
        <p>I{"'"}ve been here before</p>
      </SectionMessage>
    </Padding>
  </div>
);

export default Example;
