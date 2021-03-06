import React from 'react';
import { mount } from 'enzyme';
import {
  inlineExtensionData,
  bodiedExtensionData,
  extensionData,
} from '@atlaskit/editor-test-helpers/mock-extension-data';

import Lozenge, {
  ICON_SIZE,
} from '../../../../../plugins/extension/ui/Extension/Lozenge';

describe('@atlaskit/editor-core/ui/Extension/Lozenge', () => {
  it('should render image if extension has an image param', () => {
    const lozenge = mount(<Lozenge node={inlineExtensionData[0] as any} />);
    expect(lozenge.find('img[className$="-lozenge-image"]')).toHaveLength(1);
  });

  it('should render icon with fallback width and height', () => {
    const lozenge = mount(<Lozenge node={inlineExtensionData[2] as any} />);
    const img = lozenge.find('img[className$="-lozenge-image"]');
    expect(img).toHaveLength(1);
    expect(img.props()).toHaveProperty('height', ICON_SIZE);
    expect(img.props()).toHaveProperty('width', ICON_SIZE);
  });

  it('should generate title from extensionKey if none is provided', () => {
    const lozenges = mount(<Lozenge node={bodiedExtensionData[1] as any} />);
    const extTitleWrapper = lozenges.find('.extension-title');
    const extTitle = extTitleWrapper.text();
    expect(extTitleWrapper).toHaveLength(1);
    expect(extTitle).toEqual('Expand');
  });

  it('should have title when one is provided via macroMetadata (confluence)', () => {
    const lozenges = mount(<Lozenge node={extensionData[2] as any} />);
    const extTitleWrapper = lozenges.find('.extension-title');
    const extTitle = extTitleWrapper.text();
    expect(extTitleWrapper).toHaveLength(1);
    expect(extTitle).toEqual('Table of Contents');
  });

  it('should have title when one is provided via extensionTitle (forge)', () => {
    const lozenges = mount(<Lozenge node={extensionData[3] as any} />);
    const extTitleWrapper = lozenges.find('.extension-title');
    const extTitle = extTitleWrapper.text();
    expect(extTitleWrapper).toHaveLength(1);
    expect(extTitle).toEqual('Forged in Fire');
  });

  it("should render PlaceholderFallback if extension doesn't have an image param", () => {
    const lozenge = mount(<Lozenge node={inlineExtensionData[1] as any} />);
    expect(lozenge.find('[className$="-placeholder-fallback"]')).toHaveLength(
      1,
    );
  });
});
