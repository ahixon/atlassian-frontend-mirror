import { PuppeteerPage } from '@atlaskit/visual-regression/helper';
import {
  snapshot,
  initFullPageEditorWithAdf,
  Device,
} from '../../../../../__tests__/visual-regression/_utils';
import textListADF from './__fixtures__/text-and-list.adf.json';

async function initEditor(page: PuppeteerPage, adf: Object) {
  await initFullPageEditorWithAdf(page, adf, Device.LaptopMDPI, undefined, {});
}

describe('Snapshot Test: list commands', () => {
  let page: PuppeteerPage;

  beforeEach(() => {
    page = global.page;
  });

  describe('when all text are selected and toggled', () => {
    it('should convert all text to list', async () => {
      await initEditor(page, textListADF);

      // select all through keyboard
      await page.focus('div[aria-label="Main content area"]');
      await page.keyboard.down('Control');
      await page.keyboard.press('A');

      await page.click('#editor-toolbar__bulletList');

      await snapshot(page);
    });
  });
});
