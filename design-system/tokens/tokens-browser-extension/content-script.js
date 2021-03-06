/* eslint-disable func-names */
/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

// This is included and executed in the inspected page

// local storage helpers
// we store the theme name here for when users refresh the page
// we can quickly check and add the theme tokens back into the page
function getLocalStorage(key) {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return window.localStorage && window.localStorage[key];
}

function setLocalStorage(key, value) {
  if (window && window.localStorage) {
    window.localStorage[key] = value;
  }
}

// these functions are almost identical to the ones in background.js
// we need them here because the extension is isolated from the inspected page
// and has no idea if someone were to delete local storage or change the theme value
// in local storage
// This file is also run on document_start - https://developer.chrome.com/docs/extensions/mv3/content_scripts/#run_time
// which allows the theme CSS to seemingly persist across page refreshes
function removeTheme() {
  const html = document.querySelector('html');
  if (!html) {
    return;
  }
  html.removeAttribute('data-theme');
  setLocalStorage('theme', 'none');
}

function setTheme(themeName = 'light') {
  const html = document.querySelector('html');
  if (!html) {
    return;
  }
  html.setAttribute('data-theme', themeName);
  setLocalStorage('theme', themeName);
}

function handleTheme(theme) {
  if (!theme || theme === 'none') {
    removeTheme();
  } else if (theme === 'light') {
    setTheme(theme);
  } else if (theme === 'dark') {
    setTheme(theme);
  }
}

function init() {
  console.log('tokens extension script attached');
  const theme = getLocalStorage('theme');
  handleTheme(theme);

  const port = chrome.runtime.connect({
    name: 'Theming Communication',
  });
  // tell extension what the theme value was from local storage
  port.postMessage({ theme });

  // tell background script what the theme was from local storage
  chrome.runtime.sendMessage({ text: 'update-icon' });
}

function main() {
  init();

  chrome.runtime.onMessage.addListener(function (
    message,
    sender,
    sendResponse,
  ) {
    // the theme value from panel.html
    if (message && message.clear) {
      const theme = getLocalStorage('theme');

      const tokenSheet = document.querySelector(`style[title='tokenSheet']`);
      if (tokenSheet) {
        const rules = tokenSheet.sheet.cssRules || tokenSheet.sheet.rules;

        const ruleIndex = [...rules].findIndex(
          (rule) => rule.selectorText === `html[data-theme="${theme}"]`,
        );
        if (ruleIndex >= 0) {
          tokenSheet.sheet.deleteRule(ruleIndex);
        }
      }
    } else if (message && message.tokenName && message.newValue) {
      const theme = getLocalStorage('theme');
      let flag = false;

      let tokenSheet = document.querySelector(`style[title='tokenSheet']`);
      if (!tokenSheet) {
        tokenSheet = document.createElement('style');
        tokenSheet.type = 'text/css';
        tokenSheet.innerText = '';
        tokenSheet.title = 'tokenSheet';
        document.head.appendChild(tokenSheet);
      }

      const rules = tokenSheet.sheet.cssRules || tokenSheet.sheet.rules;

      const ruleIndex = [...rules].findIndex(
        (rule) => rule.selectorText === `html[data-theme="${theme}"]`,
      );
      if (ruleIndex >= 0) {
        rules[ruleIndex].style.setProperty(message.tokenName, message.newValue);
        flag = true;
      }

      if (!flag) {
        tokenSheet.sheet.insertRule(
          `html[data-theme='${theme}']{${message.tokenName}: ${message.newValue};}`,
        );
      }

      sendResponse({
        response: `${message.tokenName} : ${message.newValue}`,
      });
    } else if (message && message.queryToken) {
      sendResponse({
        value: getComputedStyle(document.documentElement).getPropertyValue(
          message.queryToken,
        ),
      });
    } else {
      const theme = message || 'none';
      handleTheme(theme);
    }
  });
}
main();
