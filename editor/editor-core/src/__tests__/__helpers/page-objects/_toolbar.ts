import { PuppeteerPage, TestPage } from './_types';
import { getBoundingRect } from '../../__helpers/page-objects/_editor';
export { waitForFloatingControl } from '@atlaskit/visual-regression/helper';
export enum ToolbarMenuItem {
  table,
  insertBlock,
  italic,
  bold,
  moreFormatting,
  alignment,
  alignmentLeft,
  alignmentCenter,
  alignmentRight,
  textColor,
  bulletList,
  numberedList,
  action,
  link,
  filesAndImages,
  layouts,
  mention,
  emoji,
  removeTable,
  fontStyle,
  toolbarDropList,
  insertMenu,
  expand,
  status,
  undo,
  redo,
}

export const mainToolbarSelector = '[data-testid="ak-editor-main-toolbar"]';

export const toolbarMenuItemsSelectors = {
  [ToolbarMenuItem.table]: `[aria-label="Table"]`,
  [ToolbarMenuItem.insertBlock]: `[aria-label="Insert"]`,
  [ToolbarMenuItem.italic]: `[aria-label="Italic"]`,
  [ToolbarMenuItem.bold]: `[aria-label="Bold"]`,
  [ToolbarMenuItem.moreFormatting]: `[aria-label="More formatting"]`,
  [ToolbarMenuItem.alignment]: `[aria-label="Text alignment"]`,
  [ToolbarMenuItem.alignmentLeft]: `[aria-label="Align left"]`,
  [ToolbarMenuItem.alignmentCenter]: `[aria-label="Align center"]`,
  [ToolbarMenuItem.alignmentRight]: `[aria-label="Align right"]`,
  [ToolbarMenuItem.textColor]: `[aria-label="Text color"]`,
  [ToolbarMenuItem.bulletList]: `[aria-label="Bullet list"]`,
  [ToolbarMenuItem.numberedList]: `[aria-label="Numbered List"]`,
  [ToolbarMenuItem.layouts]: `[aria-label="Layouts"]`,
  [ToolbarMenuItem.action]: `[aria-label="Action item"]`,
  [ToolbarMenuItem.link]: `[aria-label="Link"]`,
  [ToolbarMenuItem.filesAndImages]: `[aria-label=""Files & images]`,
  [ToolbarMenuItem.mention]: `[aria-label="Mention"]`,
  [ToolbarMenuItem.emoji]: `[aria-label="Emoji"]`,
  [ToolbarMenuItem.removeTable]: `[aria-label="Remove"]`,
  [ToolbarMenuItem.fontStyle]: `[aria-label="Text styles"]`,
  [ToolbarMenuItem.toolbarDropList]: '[data-role="droplistContent"]',
  [ToolbarMenuItem.insertMenu]: '[aria-label="Insert"]',
  [ToolbarMenuItem.expand]: '[aria-label="Expand"]',
  [ToolbarMenuItem.status]: '[aria-label="Status"]',
  [ToolbarMenuItem.undo]: '[aria-label="Undo"]',
  [ToolbarMenuItem.redo]: '[aria-label="Redo"]',
};

export const toolbarDropdownMenuSelectors = {
  textColor: '[data-testid="text-color-palette"]',
  emoji: '[data-emoji-picker-container]',
};

export async function clickToolbarMenu(page: TestPage, menu: ToolbarMenuItem) {
  await page.waitForSelector(toolbarMenuItemsSelectors[menu]);
  await page.click(toolbarMenuItemsSelectors[menu]);
}

const getTextSelection = (page: PuppeteerPage) =>
  page.evaluate(() => document.getSelection()?.toString());

export const retryUntilStablePosition = async (
  page: any,
  callback: () => Promise<any>,
  stablePosTargetSelector: string,
  stableDuration: number = 1000,
  // ED:10448 - Because retries may involve click-based
  // and other operations that modify text selection, we
  // now support consumers explicitly declaring whether
  // they expect text selection to remain stable between
  // retries too.
  stableTextSelection?: boolean,
) => {
  return new Promise<void>(async (resolve) => {
    let [prevLeft, prevTop] = [0, 0];
    let textSelection = await getTextSelection(page);
    const intervalId = setInterval(async () => {
      await callback();
      if (
        (stableTextSelection === true &&
          textSelection === (await getTextSelection(page))) ||
        stableTextSelection !== true
      ) {
        const { left, top } = await getBoundingRect(
          page,
          stablePosTargetSelector,
        );
        if (left === prevLeft && top === prevTop) {
          clearInterval(intervalId);
          resolve();
        } else {
          prevLeft = left;
          prevTop = top;
        }
      }
    }, stableDuration);
  });
};

export const triggerHyperLinkToolBar = async (page: PuppeteerPage) => {
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyK');
  await page.keyboard.up('Control');

  await page.waitForSelector('[data-testid="link-url"]', {
    visible: true,
  });
};
