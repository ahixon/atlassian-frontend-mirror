import {
  getExampleUrl,
  loadPage,
  waitForLoadedImageElements,
} from '@atlaskit/visual-regression/helper';

describe('@atlaskit/comment', () => {
  it('Comment example should match production example', async () => {
    const url = getExampleUrl(
      'design-system',
      'comment',
      'example-comment',
      global.__BASEURL__,
    );
    const { page } = global;
    await loadPage(page, url);

    // Wait for avatar to download
    await waitForLoadedImageElements(page, 3000);
    // Wait for lock icon and action buttons
    await page.waitForSelector('span[role="presentation"] > svg');
    await page.waitForSelector('button[type="button"]');
    const element = await page.waitForSelector('[data-testid="comment"]');

    const image = await element?.screenshot();
    expect(image).toMatchProdImageSnapshot();
  });
});
