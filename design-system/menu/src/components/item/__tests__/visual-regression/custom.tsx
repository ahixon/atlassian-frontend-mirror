import { getExampleUrl } from '@atlaskit/visual-regression/helper';

import { hover, mouseDown, verifyElementIn } from '../../../__tests__/_helper';

const customItem = '[data-testid="item-custom-em"]';
const customItemDisabled = '[data-testid="item-custom-em-disabled"]';
const customItemRouter = '[data-testid="item-custom-router"]';

const url = getExampleUrl(
  'design-system',
  'menu',
  'item-variations',
  global.__BASEURL__,
);

const verifyElementMatchProductionImage = verifyElementIn(url);

describe('<CustomItem />', () => {
  it('should match the default state', async () => {
    await verifyElementMatchProductionImage(customItem);
  });

  it('should match the hovered state', async () => {
    await verifyElementMatchProductionImage(customItem, hover(customItem));
  });

  it('should match the clicked state', async () => {
    await verifyElementMatchProductionImage(customItem, mouseDown(customItem));
  });

  it('should match the disabled state', async () => {
    await verifyElementMatchProductionImage(customItemDisabled);
  });

  it('should match custom item with router', async () => {
    await verifyElementMatchProductionImage(customItemRouter);
  });
});
