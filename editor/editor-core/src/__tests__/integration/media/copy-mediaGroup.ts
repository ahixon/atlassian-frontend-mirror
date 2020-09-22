import { BrowserTestCase } from '@atlaskit/webdriver-runner/runner';
import { testMediaGroup } from '@atlaskit/editor-test-helpers';
import { editable, getDocFromElement, fullpage } from '../_helpers';
import {
  goToEditorTestingExample,
  mountEditor,
} from '../../__helpers/testing-example-helpers';
import { waitForNumImages } from './_utils';

const baseADF = {
  version: 1,
  type: 'doc',
  content: [
    {
      type: 'mediaGroup',
      content: [
        {
          type: 'media',
          attrs: {
            id: testMediaGroup.id,
            type: 'file',
            collection: 'MediaServicesSample',
          },
        },
      ],
    },
    {
      type: 'paragraph',
      content: [],
    },
  ],
};

BrowserTestCase(
  'copy-mediaGroup.ts: Copies and pastes mediaGroup file card on fullpage',
  { skip: ['edge', 'safari'] },
  async (client: any, testCase: string) => {
    const page = await goToEditorTestingExample(client);
    await mountEditor(page, {
      appearance: fullpage.appearance,
      defaultValue: JSON.stringify(baseADF),
      media: {
        allowMediaSingle: true,
      },
    });

    const fileCardSelector =
      '.ProseMirror [data-testid="media-filmstrip"] [data-testid="media-file-card-view"][data-test-status="complete"]';

    await page.waitForSelector(fileCardSelector);
    await page.click(fileCardSelector);
    await page.copy();

    await page.click(editable);
    await page.type(editable, 'pasting');

    await page.paste();

    await waitForNumImages(page, 2);

    const doc = await page.$eval(editable, getDocFromElement);
    expect(doc).toMatchCustomDocSnapshot(testCase);
  },
);
