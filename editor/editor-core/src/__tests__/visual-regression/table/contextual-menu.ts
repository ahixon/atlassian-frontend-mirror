import { PuppeteerPage } from '@atlaskit/visual-regression/helper';
import { snapshot, initFullPageEditorWithAdf } from '../_utils';
import adf from './__fixtures__/default-table.adf.json';
import {
  clickFirstCell,
  selectTableOption,
  clickCellOptions,
  tableSelectors,
} from '../../__helpers/page-objects/_table';

describe('Table contextual menu: fullpage', () => {
  let page: PuppeteerPage;

  beforeAll(async () => {
    page = global.page;
    await initFullPageEditorWithAdf(page, adf);
    await clickFirstCell(page);
  });

  it('update contextual menu button position when number column changes', async () => {
    await selectTableOption(page, 'Numbered column');
    await page.mouse.move(0, 0);
    await snapshot(page);
  });

  it('toggles the context menu correctly', async () => {
    await clickCellOptions(page);
    await snapshot(page);
    await clickCellOptions(page);
    await snapshot(page);
  });

  it('ensures contextual menu button styles are correct', async () => {
    await page.mouse.move(0, 0);
    await snapshot(page, {}, tableSelectors.topLeftCell);
  });
});
