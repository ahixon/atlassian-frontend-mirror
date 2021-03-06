import {
  disableAllAnimations,
  disableAllTransitions,
  getExampleUrl,
  pageSelector,
  waitForTooltip,
  takeElementScreenShot,
  loadPage,
} from '@atlaskit/visual-regression/helper';

export function getURL(testName: string): string {
  return getExampleUrl(
    'linking-platform',
    'link-picker',
    testName,
    global.__BASEURL__,
  );
}

export async function setup(url: string) {
  const { page } = global;
  await loadPage(page, url);
  await page.waitForSelector(pageSelector);

  // disable animations in TextField
  await disableAllAnimations(page);
  await disableAllTransitions(page);
  return page;
}

describe('link-picker', () => {
  let testSelector = '[data-testid="link-picker"]';

  it('should render component with results', async () => {
    const url = getURL('vr');
    const page = await setup(url);
    const image = await takeElementScreenShot(page, testSelector);
    expect(image).toMatchProdImageSnapshot();
  });

  it('Should change list-item background on hover and selection', async () => {
    const url = getURL('vr');
    const page = await setup(url);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.hover('[data-testid="link-search-list-item"]');

    const image = await takeElementScreenShot(page, testSelector);
    expect(image).toMatchProdImageSnapshot();
  });

  it('Should not change the background of selected list-item on hover', async () => {
    const url = getURL('vr');
    const page = await setup(url);
    await page.keyboard.press('ArrowDown');
    await page.hover('[data-testid="link-search-list-item"]');

    const image = await takeElementScreenShot(page, testSelector);
    expect(image).toMatchProdImageSnapshot();
  });

  it('Should change input background on hover', async () => {
    const url = getURL('vr');
    const page = await setup(url);
    await page.hover('[data-testid="link-text-container"]');

    const image = await takeElementScreenShot(page, testSelector);
    expect(image).toMatchProdImageSnapshot();
  });

  it('Should change input border-color on focus', async () => {
    const url = getURL('vr');
    const page = await setup(url);
    await page.focus('[data-testid="link-text"]');

    const image = await takeElementScreenShot(page, testSelector);
    expect(image).toMatchProdImageSnapshot();
  });

  it('Should display ClearText button when input has value', async () => {
    const url = getURL('vr');
    const page = await setup(url);

    await page.keyboard.type('FAB');
    await page.waitForSelector('[data-testid="clear-text"]');

    const image = await takeElementScreenShot(page, testSelector);
    expect(image).toMatchProdImageSnapshot();
  });

  it('Should display ClearText tooltip on hover', async () => {
    const url = getURL('vr');
    const page = await setup(url);

    await page.keyboard.type('FAB');
    await page.hover('[data-testid="clear-text"]');
    await waitForTooltip(page);

    const image = await takeElementScreenShot(page, testSelector);
    expect(image).toMatchProdImageSnapshot();
  });

  it('Should not display text under ClearText button', async () => {
    const url = getURL('vr');
    const page = await setup(url);

    const longText =
      'A text field is an input that allows a user to write or edit text';
    await page.type('[data-testid="link-text"]', longText);

    const image = await takeElementScreenShot(page, testSelector);
    expect(image).toMatchProdImageSnapshot();
  });

  it('Should render Linkpicker within Popup with input focused', async () => {
    const url = getURL('in-popup');
    const page = await setup(url);

    const image = await page.screenshot();
    expect(image).toMatchProdImageSnapshot();
  });

  it('Should render Linkpicker without Plugins', async () => {
    const url = getURL('no-plugins');
    const page = await setup(url);

    const image = await takeElementScreenShot(page, testSelector);
    expect(image).toMatchProdImageSnapshot();
  });

  it('Should display error message and highlight input border for invalid URLs', async () => {
    const url = getURL('vr');
    const page = await setup(url);

    await page.type('[data-testid="link-url"]', 'FAB');
    await page.focus('[data-testid="link-text"]');
    await page.keyboard.press('Enter');
    const image = await takeElementScreenShot(page, testSelector);
    expect(image).toMatchProdImageSnapshot();
  });

  it('Should display subtitle with `Results` after search', async () => {
    const url = getURL('vr');
    const page = await setup(url);

    await page.type('[data-testid="link-url"]', 'FAB');
    const image = await takeElementScreenShot(page, testSelector);
    expect(image).toMatchProdImageSnapshot();
  });
});
