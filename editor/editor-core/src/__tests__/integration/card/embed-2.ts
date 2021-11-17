import { BrowserTestCase } from '@atlaskit/webdriver-runner/runner';
import { getDocFromElement, editable } from '../_helpers';
import {
  goToEditorTestingWDExample,
  mountEditor,
} from '../../__helpers/testing-example-helpers';
import { ConfluenceCardProvider } from '@atlaskit/editor-test-helpers/confluence-card-provider';
import * as embedCardAdf from './_fixtures_/embed-card.adf.json';
import { waitForEmbedCardSelection } from '@atlaskit/media-integration-test-helpers';

type ClientType = Parameters<typeof goToEditorTestingWDExample>[0];

BrowserTestCase(
  'card: changing the link URL of an embed link to an unsupported url should convert it to a "dumb" link',
  {
    skip: ['safari', 'edge'],
  },
  async (client: ClientType, testName: string) => {
    const page = await goToEditorTestingWDExample(client);

    const cardProviderPromise = Promise.resolve(
      new ConfluenceCardProvider('prod'),
    );

    await mountEditor(page, {
      appearance: 'full-page',
      allowTextAlignment: true,
      defaultValue: JSON.stringify(embedCardAdf),
      smartLinks: {
        provider: cardProviderPromise,
        allowBlockCards: true,
        allowEmbeds: true,
      },
    });

    await waitForEmbedCardSelection(page);

    const editLinkButtonSelector = 'button[aria-label="Edit link"]';
    await page.waitForSelector(editLinkButtonSelector);
    await page.click(editLinkButtonSelector);

    // Clear the Link Label field before typing
    const linkUrlSelector = '[data-testid="link-url"]';
    await page.waitForSelector(linkUrlSelector);
    await page.clear(linkUrlSelector);

    // Change the 'link address' field to another link and press enter
    await page.type(linkUrlSelector, [
      'https://product-fabric.atlassian.net/wiki/spaces/E/overview',
      'Return',
    ]);

    expect(
      await page.$eval(editable, getDocFromElement),
    ).toMatchCustomDocSnapshot(testName);
  },
);
