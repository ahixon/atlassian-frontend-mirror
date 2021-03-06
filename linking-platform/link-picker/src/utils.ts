import { KeyboardEvent } from 'react';

import { browser } from './browser';

const KeyZCode = 90;
const KeyYCode = 89;

export const isUndoEvent = (e: KeyboardEvent<HTMLInputElement>) => {
  return (
    e.keyCode === KeyZCode &&
    // cmd + z for mac
    ((browser.mac && e.metaKey && !e.shiftKey) ||
      // ctrl + z for non-mac
      (!browser.mac && e.ctrlKey))
  );
};

export const isRedoEvent = (e: KeyboardEvent<HTMLInputElement>) => {
  return (
    // ctrl + y for non-mac
    (!browser.mac && e.ctrlKey && e.keyCode === KeyYCode) ||
    (browser.mac && e.metaKey && e.shiftKey && e.keyCode === KeyZCode) ||
    (e.ctrlKey && e.shiftKey && e.keyCode === KeyZCode)
  );
};
