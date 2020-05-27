import React from 'react';

import { ThemeContext } from '@emotion/core';

import Button from '@atlaskit/button';
import Theme from '@atlaskit/theme';

import { DatePicker } from '../src';

export default () => {
  return (
    <>
      <Theme.Provider value={() => ({ mode: 'dark' })}>
        <DatePicker testId="date-picker-real-dark-mode" />
        <Button>Real dark mode</Button>
      </Theme.Provider>
      <ThemeContext.Provider value={{ mode: {} }}>
        <DatePicker testId="date-picker-theme-jank" />
        <Button>Fake dark mode</Button>
      </ThemeContext.Provider>
    </>
  );
};