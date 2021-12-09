// This works only by calling before importing Popup
// eslint-disable-next-line import/order
import mockPopper from '../_mockPopper';
mockPopper();

import React from 'react';

import { mount, ReactWrapper } from 'enzyme';
import { IntlShape, WrappedComponentProps } from 'react-intl-next';

import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';
import Popup from '@atlaskit/popup';
import Tooltip from '@atlaskit/tooltip';

import {
  CopyLinkButton,
  HiddenInput,
  MessageContainer,
  Props,
  State,
} from '../../../components/CopyLinkButton';
import Button from '../../../components/styles';

const mockFormatMessage = (descriptor: any) => descriptor.defaultMessage;
const mockIntl = { formatMessage: mockFormatMessage };

jest.mock('react-intl-next', () => {
  return {
    ...(jest.requireActual('react-intl-next') as any),
    FormattedMessage: (descriptor: any) => (
      <span>{descriptor.defaultMessage}</span>
    ),
    injectIntl: (Node: any) => (props: any) => (
      <Node {...props} intl={mockIntl} />
    ),
  };
});

const mockIntlProps: WrappedComponentProps = {
  intl: ({ formatMessage: mockFormatMessage } as unknown) as IntlShape,
};

const mockLink = 'link';

const props = {
  link: mockLink,
  ...mockIntlProps,
};

describe('CopyLinkButton', () => {
  let originalExecCommand: (
    commandId: string,
    showUI?: boolean,
    value?: string,
  ) => boolean;
  let mockLink: string = 'link';
  let mockTooltipText: string = 'tooltip text';
  const spiedExecCommand: jest.Mock = jest.fn();

  beforeAll(() => {
    originalExecCommand = document.execCommand;
    document.execCommand = spiedExecCommand;
  });

  afterEach(() => {
    spiedExecCommand.mockReset();
  });

  afterAll(() => {
    document.execCommand = originalExecCommand;
  });

  it('should render', () => {
    const wrapper: ReactWrapper<
      Props & WrappedComponentProps,
      State,
      any
    > = mount<Props & WrappedComponentProps, State>(
      <CopyLinkButton {...props} />,
    );

    expect(wrapper.text()).toContain('Copy link');

    const inlineDialog = wrapper.find(Popup);
    expect(inlineDialog).toHaveLength(1);
    expect(inlineDialog.prop('placement')).toEqual('top-start');

    const button = wrapper.find(Button);
    expect(button).toHaveLength(1);
    expect(button.prop('appearance')).toEqual('subtle-link');

    const hiddenInput = wrapper.find(HiddenInput);
    expect(hiddenInput).toHaveLength(1);
    expect(hiddenInput.prop('text')).toEqual(mockLink);

    expect(wrapper.find(Tooltip)).toHaveLength(0);

    expect(
      // @ts-ignore accessing private property just for testing purpose
      wrapper.instance().inputRef.current instanceof HTMLInputElement,
    ).toBeTruthy();
  });

  it('should render for public link', () => {
    const wrapper: ReactWrapper<
      Props & WrappedComponentProps,
      State,
      any
    > = mount<Props & WrappedComponentProps, State>(
      <CopyLinkButton {...props} isPublicLink={true} />,
    );

    expect(wrapper.text()).toContain('Copy public link');

    const inlineDialog = wrapper.find(Popup);
    expect(inlineDialog).toHaveLength(1);
    expect(inlineDialog.prop('placement')).toEqual('top-start');

    const button = wrapper.find(Button);
    expect(button).toHaveLength(1);
    expect(button.prop('appearance')).toEqual('subtle-link');
    expect(button.prop('isDisabled')).not.toEqual(true);

    const hiddenInput = wrapper.find(HiddenInput);
    expect(hiddenInput).toHaveLength(1);
    expect(hiddenInput.prop('text')).toEqual(mockLink);

    expect(
      // @ts-ignore accessing private property just for testing purpose
      wrapper.instance().inputRef.current instanceof HTMLInputElement,
    ).toBeTruthy();
  });

  it('should render for public link', () => {
    const wrapper: ReactWrapper<
      Props & WrappedComponentProps,
      State,
      any
    > = mount<Props & WrappedComponentProps, State>(
      <CopyLinkButton {...props} isPublicLink={true} isDisabled={true} />,
    );

    expect(wrapper.text()).toContain('Copy public link');

    const inlineDialog = wrapper.find(Popup);
    expect(inlineDialog).toHaveLength(1);
    expect(inlineDialog.prop('placement')).toEqual('top-start');

    const button = wrapper.find(Button);
    expect(button).toHaveLength(1);
    expect(button.prop('appearance')).toEqual('subtle-link');
    expect(button.prop('isDisabled')).toEqual(true);

    const hiddenInput = wrapper.find(HiddenInput);
    expect(hiddenInput).toHaveLength(1);
    expect(hiddenInput.prop('text')).toEqual(mockLink);

    expect(
      // @ts-ignore accessing private property just for testing purpose
      wrapper.instance().inputRef.current instanceof HTMLInputElement,
    ).toBeTruthy();
  });

  it('should render a copy link tooltip if copyTooltipText prop exists', () => {
    const wrapper: ReactWrapper<
      Props & WrappedComponentProps,
      State,
      any
    > = mount<Props & WrappedComponentProps, State>(
      <CopyLinkButton
        {...props}
        link={mockLink}
        copyTooltipText={mockTooltipText}
      />,
    );

    const tooltip = wrapper.find(Tooltip);
    expect(tooltip).toHaveLength(1);
    expect(tooltip.prop('content')).toEqual(mockTooltipText);
  });

  describe('componentWillUnmount', () => {
    it('should clear this.autoDismiss', () => {
      const wrapper: ReactWrapper<
        Props & WrappedComponentProps,
        State,
        any
      > = mount<Props & WrappedComponentProps, State>(
        <CopyLinkButton {...props} />,
      );
      wrapper.find(Button).simulate('click');
      expect(wrapper.instance().autoDismiss).not.toBeUndefined();
      wrapper.instance().componentWillUnmount();
      expect(wrapper.instance().autoDismiss).toBeUndefined();
    });
  });

  describe('shouldShowCopiedMessage state', () => {
    it('should render the copied to clip board message, and dismiss the message when click outside the Inline Dialog', () => {
      const wrapper: ReactWrapper<
        Props & WrappedComponentProps,
        State,
        any
      > = mount<Props & WrappedComponentProps, State>(
        <CopyLinkButton {...props} />,
      );
      wrapper.find(Button).simulate('click');
      expect(wrapper.find(CheckCircleIcon)).toHaveLength(1);
      expect(wrapper.find(MessageContainer)).toHaveLength(1);
      expect(wrapper.instance().autoDismiss).not.toBeUndefined();

      wrapper.instance().handleDismissCopiedMessage();
      wrapper.update();

      expect(wrapper.state().shouldShowCopiedMessage).toBeFalsy();
      expect(wrapper.find(CheckCircleIcon)).toHaveLength(0);
      expect(wrapper.find(MessageContainer)).toHaveLength(0);
      expect(wrapper.instance().autoDismiss).toBeUndefined();
    });
  });

  describe('handleClick', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.clearAllTimers();
    });

    it('should copy the text from the HiddenInput and call onLinkCopy prop if given when the user clicks on the button', () => {
      const spiedOnLinkCopy: jest.Mock = jest.fn();
      const wrapper: ReactWrapper<
        Props & WrappedComponentProps,
        State,
        any
      > = mount<Props & WrappedComponentProps, State>(
        <CopyLinkButton {...props} onLinkCopy={spiedOnLinkCopy} />,
      );
      const spiedInputSelect: jest.SpyInstance = jest.spyOn(
        // @ts-ignore accessing private property just for testing purpose
        wrapper.instance().inputRef.current,
        'select',
      );
      wrapper.find(Button).simulate('click');
      expect(spiedInputSelect).toHaveBeenCalledTimes(1);
      expect(spiedExecCommand).toHaveBeenCalledTimes(1);
      expect(spiedOnLinkCopy).toHaveBeenCalledTimes(1);
      expect(spiedOnLinkCopy.mock.calls[0][0]).toEqual(mockLink);
      expect(wrapper.state().shouldShowCopiedMessage).toBeTruthy();
      jest.runOnlyPendingTimers();
      // The setTimout test was removed, as it's can't be reliable
      // tested with new Popup component. The setTimoeout is then called by
      // `react-test-renderer` with `_flushCallback` additional x times.
      expect(wrapper.state().shouldShowCopiedMessage).toBeFalsy();
    });
  });
});
