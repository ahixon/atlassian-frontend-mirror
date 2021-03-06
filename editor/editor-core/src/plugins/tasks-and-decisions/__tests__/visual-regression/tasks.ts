import { PuppeteerPage } from '@atlaskit/visual-regression/helper';
import {
  Appearance,
  initEditorWithAdf,
  snapshot,
} from '../../../../__tests__/visual-regression/_utils';
import tasksAdf from '../__fixtures__/basic-tasks-adf.json';
import { animationFrame } from '../../../../__tests__/__helpers/page-objects/_editor';

describe('tasks', () => {
  let page: PuppeteerPage;
  beforeAll(() => {
    page = global.page;
  });

  it('should display tasks as action items', async () => {
    await initEditorWithAdf(page, {
      appearance: Appearance.fullPage,
      adf: tasksAdf,
      viewport: { width: 1040, height: 400 },
    });
    await animationFrame(page);
    await snapshot(page);
  });
});
