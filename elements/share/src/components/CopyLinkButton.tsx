import React from 'react';

import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl-next';
import styled from 'styled-components';

import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';
import LinkFilledIcon from '@atlaskit/icon/glyph/link-filled';
import Popup, { TriggerProps } from '@atlaskit/popup';
import { G300 } from '@atlaskit/theme/colors';
import { layers } from '@atlaskit/theme/constants';
import { token } from '@atlaskit/tokens';
import Tooltip from '@atlaskit/tooltip';

import { messages } from '../i18n';

import { InlineDialogContentWrapper } from './ShareFormWrapper/styled';
import Button from './styles';

const Z_INDEX = layers.modal();

const AUTO_DISMISS_SECONDS = 8;

export const AUTO_DISMISS_MS = AUTO_DISMISS_SECONDS * 1000;

export const MessageContainer = styled.div`
  display: flex;
  align-items: center;
  margin: -8px -16px;
`;

const isSafari = navigator.userAgent.indexOf('Safari');

const MessageSpan = styled.span`
  text-indent: 6px;
`;

type InputProps = {
  text: string;
};

export const HiddenInput = React.forwardRef<HTMLInputElement, InputProps>(
  // we need a hidden input to reliably copy to clipboard across all browsers.
  (props, ref) => (
    <input
      style={{ position: 'absolute', left: '-9999px' }}
      tabIndex={-1}
      aria-hidden={true}
      ref={ref}
      value={props.text}
      readOnly
    />
  ),
);

export type Props = {
  onLinkCopy?: (link: string) => void;
  link: string;
  isDisabled?: boolean;
  isPublicLink?: boolean;
  copyTooltipText?: string;
};

export type State = {
  shouldShowCopiedMessage: boolean;
};

// eslint-disable-next-line @repo/internal/react/no-class-components
export class CopyLinkButton extends React.Component<
  Props & WrappedComponentProps,
  State
> {
  private autoDismiss: ReturnType<typeof setTimeout> | undefined;
  private inputRef: React.RefObject<HTMLInputElement> = React.createRef();

  state = {
    shouldShowCopiedMessage: false,
  };

  componentWillUnmount() {
    this.clearAutoDismiss();
  }

  private clearAutoDismiss = () => {
    if (this.autoDismiss) {
      clearTimeout(this.autoDismiss);
      this.autoDismiss = undefined;
    }
  };

  private handleClick = () => {
    this.inputRef.current!.select();
    document.execCommand('copy');

    if (this.props.onLinkCopy) {
      this.props.onLinkCopy!(this.props.link);
    }

    this.setState({ shouldShowCopiedMessage: true }, () => {
      this.clearAutoDismiss();
      this.autoDismiss = setTimeout(() => {
        this.setState({ shouldShowCopiedMessage: false });
      }, AUTO_DISMISS_MS);
    });
  };

  private handleDismissCopiedMessage = () => {
    this.clearAutoDismiss();
    this.setState({ shouldShowCopiedMessage: false });
  };

  renderTriggerButton = (triggerProps: TriggerProps) => {
    const {
      intl: { formatMessage },
      isDisabled,
      isPublicLink,
    } = this.props;
    return (
      <Button
        aria-label={formatMessage(
          isPublicLink
            ? messages.copyPublicLinkButtonText
            : messages.copyLinkButtonText,
        )}
        isDisabled={isDisabled}
        appearance="subtle-link"
        iconBefore={<LinkFilledIcon label="" size="medium" />}
        onClick={this.handleClick}
        {...triggerProps}
      >
        <FormattedMessage
          {...(isPublicLink
            ? messages.copyPublicLinkButtonText
            : messages.copyLinkButtonText)}
        />
      </Button>
    );
  };

  render() {
    const { shouldShowCopiedMessage } = this.state;
    const {
      intl: { formatMessage },
      copyTooltipText,
    } = this.props;

    return (
      <>
        {/* Added ARIA live region specifically for VoiceOver + Safari since the status */}
        {/* message 'Link copied to clipboard' is not announced by VO */}
        {isSafari && (
          <div className="assistive" aria-live="assertive">
            {shouldShowCopiedMessage &&
              formatMessage(messages.copiedToClipboardMessage)}
          </div>
        )}
        <HiddenInput ref={this.inputRef} text={this.props.link} />
        <Popup
          zIndex={Z_INDEX}
          content={() => (
            <InlineDialogContentWrapper>
              <MessageContainer>
                <CheckCircleIcon
                  label=""
                  primaryColor={token('color.icon.success', G300)}
                />
                <MessageSpan>
                  <FormattedMessage {...messages.copiedToClipboardMessage} />
                </MessageSpan>
              </MessageContainer>
            </InlineDialogContentWrapper>
          )}
          isOpen={shouldShowCopiedMessage}
          onClose={this.handleDismissCopiedMessage}
          placement="top-start"
          trigger={(triggerProps: TriggerProps) =>
            copyTooltipText ? (
              <Tooltip content={copyTooltipText} position="bottom-start">
                {this.renderTriggerButton(triggerProps)}
              </Tooltip>
            ) : (
              this.renderTriggerButton(triggerProps)
            )
          }
        />
      </>
    );
  }
}

export default injectIntl(CopyLinkButton);
