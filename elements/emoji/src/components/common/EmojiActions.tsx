/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PureComponent } from 'react';
import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl-next';
import {
  EmojiDescription,
  EmojiDescriptionWithVariations,
  Message,
  OnToneSelected,
  OnToneSelectorCancelled,
  ToneSelection,
} from '../../types';
import EmojiDeletePreview, {
  OnDeleteEmoji,
} from '../common/EmojiDeletePreview';
import EmojiUploadPicker, { OnUploadEmoji } from '../common/EmojiUploadPicker';
import EmojiPickerListSearch from '../picker/EmojiPickerListSearch';
import ToneSelector from './ToneSelector';
import EmojiButton from './EmojiButton';
import { messages } from '../i18n';
import AkButton from '@atlaskit/button/standard-button';
import AddIcon from '@atlaskit/icon/glyph/add';
import { setSkinToneAriaLabelText } from './setSkinToneAriaLabelText';
import {
  addCustomEmoji,
  addCustomEmojiButton,
  emojiPickerAddEmoji,
  emojiToneSelectorContainer,
} from './styles';
import {
  emojiActionsContainerWithBottomShadow,
  emojiPickerFooter,
} from '../picker/styles';

export interface Props {
  selectedTone?: ToneSelection;
  onToneSelected?: OnToneSelected;
  onToneSelectorCancelled?: OnToneSelectorCancelled;
  toneEmoji?: EmojiDescriptionWithVariations;
  uploading: boolean;
  uploadEnabled: boolean;
  emojiToDelete?: EmojiDescription;
  initialUploadName?: string;
  uploadErrorMessage?: Message;
  onUploadCancelled: () => void;
  onUploadEmoji: OnUploadEmoji;
  onCloseDelete: () => void;
  onDeleteEmoji: OnDeleteEmoji;
  onFileChooserClicked?: () => void;
  onOpenUpload: () => void;
  query?: string;
  onChange: any;
}

interface State {
  selectingTone: boolean;
}

export class EmojiActions extends PureComponent<
  Props & WrappedComponentProps,
  State
> {
  state = {
    selectingTone: false,
  };

  onToneButtonClick = () => {
    this.setState({
      selectingTone: !this.state.selectingTone,
    });
  };

  onToneSelected = (toneValue: number) => {
    this.setState({
      selectingTone: false,
    });

    if (this.props.onToneSelected) {
      this.props.onToneSelected(toneValue);
    }
  };

  onMouseLeave = () => {
    const { selectingTone } = this.state;
    const { onToneSelectorCancelled } = this.props;

    if (selectingTone && onToneSelectorCancelled) {
      onToneSelectorCancelled();
    }

    this.setState({
      selectingTone: false,
    });
  };

  renderTones() {
    const { toneEmoji, selectedTone, intl } = this.props;
    const { formatMessage } = intl;
    if (!toneEmoji) {
      return null;
    }

    let previewEmoji = toneEmoji;
    if (selectedTone && previewEmoji.skinVariations) {
      previewEmoji = previewEmoji.skinVariations[(selectedTone || 1) - 1];
    }

    return (
      <div css={emojiToneSelectorContainer}>
        {this.state.selectingTone && (
          <ToneSelector
            emoji={toneEmoji}
            onToneSelected={this.onToneSelected}
            previewEmojiId={previewEmoji.id as string}
          />
        )}
        <EmojiButton
          ariaExpanded={this.state.selectingTone}
          emoji={previewEmoji}
          selectOnHover={true}
          onSelected={this.onToneButtonClick}
          ariaLabelText={formatMessage(
            messages.emojiSelectSkinToneButtonAriaLabelText,
            {
              selectedTone: `${setSkinToneAriaLabelText(
                previewEmoji.name as string,
              )} selected`,
            },
          )}
        />
      </div>
    );
  }

  // note: emoji-picker-add-emoji className is used by pollinator synthetic checks
  renderAddOwnEmoji() {
    const { onOpenUpload, uploadEnabled, intl } = this.props;
    const { formatMessage } = intl;

    if (!uploadEnabled) {
      return null;
    }
    return (
      <div css={addCustomEmoji}>
        <FormattedMessage {...messages.addCustomEmojiLabel}>
          {(label) => (
            <AkButton
              onClick={onOpenUpload}
              iconBefore={
                <AddIcon
                  label={formatMessage(messages.addCustomEmojiLabel)}
                  size="small"
                />
              }
              appearance="subtle"
              css={addCustomEmojiButton}
              className={emojiPickerAddEmoji}
            >
              {label}
            </AkButton>
          )}
        </FormattedMessage>
      </div>
    );
  }

  render() {
    const {
      initialUploadName,
      onUploadCancelled,
      onUploadEmoji,
      onCloseDelete,
      onDeleteEmoji,
      uploadErrorMessage,
      uploading,
      onFileChooserClicked,
      emojiToDelete,
      onChange,
      query,
    } = this.props;

    const previewFooterClassnames = [
      emojiPickerFooter,
      emojiActionsContainerWithBottomShadow,
    ];

    if (uploading) {
      return (
        <div css={previewFooterClassnames}>
          <EmojiUploadPicker
            onUploadCancelled={onUploadCancelled}
            onUploadEmoji={onUploadEmoji}
            onFileChooserClicked={onFileChooserClicked}
            errorMessage={uploadErrorMessage}
            initialUploadName={initialUploadName}
          />
        </div>
      );
    }

    if (emojiToDelete) {
      return (
        <div css={previewFooterClassnames}>
          <EmojiDeletePreview
            emoji={emojiToDelete}
            onDeleteEmoji={onDeleteEmoji}
            onCloseDelete={onCloseDelete}
          />
        </div>
      );
    }

    return (
      <div css={previewFooterClassnames} onMouseLeave={this.onMouseLeave}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          {!this.state.selectingTone && (
            <EmojiPickerListSearch onChange={onChange} query={query} />
          )}
          {this.renderTones()}
        </div>
        {this.renderAddOwnEmoji()}
      </div>
    );
  }
}

export default injectIntl(EmojiActions);
