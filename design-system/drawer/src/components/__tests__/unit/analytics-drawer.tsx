import React from 'react';

import { mount } from 'enzyme';

import {
  createAndFireEvent,
  withAnalyticsContext,
  withAnalyticsEvents,
} from '@atlaskit/analytics-next';
import Blanket from '@atlaskit/blanket';

import { DrawerBase } from '../../index';

const packageName = process.env._PACKAGE_NAME_ as string;
const packageVersion = process.env._PACKAGE_VERSION_ as string;

// This is a global mock for this file that will mock all components wrapped with analytics
// and replace them with an empty SFC that returns null. This includes components imported
// directly in this file and others imported as dependencies of those imports.
jest.mock('@atlaskit/analytics-next', () => ({
  withAnalyticsEvents: jest.fn(() => jest.fn((args) => args)),
  withAnalyticsContext: jest.fn(() => jest.fn((args) => args)),
  createAndFireEvent: jest.fn(() =>
    jest.fn((payload: {}) => jest.fn((createEvent) => createEvent(payload))),
  ),
}));

const escKeyDown = () => {
  const event = document.createEvent('Events');
  event.initEvent('keydown', true, true);

  // @ts-ignore
  event.key = 'Escape';
  window.dispatchEvent(event);
};

describe('Drawer', () => {
  let aelSpy: jest.SpyInstance;
  let relSpy: jest.SpyInstance;
  beforeEach(() => {
    aelSpy = jest.spyOn(window, 'addEventListener');
    relSpy = jest.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    aelSpy.mockRestore();
    relSpy.mockRestore();
  });

  it('should be wrapped with analytics context', () => {
    expect(withAnalyticsContext).toHaveBeenCalledWith({
      componentName: 'drawer',
      packageName,
      packageVersion,
    });
  });

  it('should be wrapped with analytics events', () => {
    expect(createAndFireEvent).toHaveBeenCalledWith('atlaskit');
    expect(withAnalyticsEvents).toHaveBeenCalledWith();
  });

  it('should create and fire a UI analytics event onClose', () => {
    const myEvent = {};
    const createAnalyticsEventSpy: any = jest.fn(() => myEvent);
    const onCloseSpy = jest.fn();
    const wrapper = mount(
      <DrawerBase
        createAnalyticsEvent={createAnalyticsEventSpy}
        onClose={onCloseSpy}
        isOpen
        testId="test"
        width="narrow"
      >
        <span>Content</span>
      </DrawerBase>,
    );

    expect(createAnalyticsEventSpy).not.toHaveBeenCalled();
    wrapper
      .find('[data-testid="DrawerPrimitiveSidebarCloseButton"]')
      .first()
      .simulate('click');
    // Should call createAnalyticsEvent with correct payload
    expect(createAnalyticsEventSpy).toHaveBeenCalledWith({
      action: 'dismissed',
      actionSubject: 'drawer',
      attributes: {
        componentName: 'drawer',
        packageName,
        packageVersion,
        trigger: 'backButton',
      },
    });

    // Expect event to be fired on correct channel
    expect(createAndFireEvent).toHaveBeenCalledWith('atlaskit');

    // Expect event to be passed through prop callback
    expect(onCloseSpy.mock.calls[0][1]).toEqual(myEvent);
  });

  it('should pass the correct trigger attribute based on how the drawer was dismissed', () => {
    const myEvent = {};
    const createAnalyticsEventSpy: any = jest.fn(() => myEvent);
    const onCloseSpy = jest.fn();
    const wrapper = mount(
      <DrawerBase
        createAnalyticsEvent={createAnalyticsEventSpy}
        onClose={onCloseSpy}
        isOpen
        testId="test"
        width="narrow"
      >
        <span>Content</span>
      </DrawerBase>,
    );

    // Back button
    wrapper
      .find('[data-testid="DrawerPrimitiveSidebarCloseButton"]')
      .first()
      .simulate('click');
    expect(createAnalyticsEventSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          trigger: 'backButton',
        }),
      }),
    );

    // Blanket
    wrapper.find(Blanket).simulate('click');
    expect(createAnalyticsEventSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          trigger: 'blanket',
        }),
      }),
    );

    // Esc key
    escKeyDown();
    expect(createAnalyticsEventSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          trigger: 'escKey',
        }),
      }),
    );
  });
});
