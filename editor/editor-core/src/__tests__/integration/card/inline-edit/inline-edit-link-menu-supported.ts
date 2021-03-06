import { BrowserTestCase } from '@atlaskit/webdriver-runner/runner';
import {
  getDocFromElement,
  editable,
  copyToClipboard,
  gotoEditor,
  linkUrlSelector,
  clearLinkToolbarUrl,
} from '../../_helpers';

import { waitForInlineCardSelection } from '@atlaskit/media-integration-test-helpers';
import Page from '@atlaskit/webdriver-runner/wd-wrapper';

BrowserTestCase(
  `card: selecting an inline card and choosing a new page from edit-link menu should update title and url for supported link`,
  {
    skip: ['safari', 'firefox'],
  },
  async (client: ConstructorParameters<typeof Page>[0], testName: string) => {
    const page = new Page(client);

    // Copy stuff to clipboard
    await copyToClipboard(page, 'https://www.atlassian.com');

    await gotoEditor(page);
    // Paste the link
    await page.paste();
    await page.keys('Enter');

    await waitForInlineCardSelection(page);
    await page.click('button[aria-label="Edit link"]');

    await clearLinkToolbarUrl(page);

    // Choosing a supported link
    await page.type(linkUrlSelector, 'home opt-in');
    await page.keys(['ArrowDown', 'Return']);

    await waitForInlineCardSelection(page);

    const doc = await page.$eval(editable, getDocFromElement);
    expect(doc).toMatchCustomDocSnapshot(testName);
  },
);
