import { MouseEvent } from 'react';
import {
  FileDetails,
  MediaClient,
  Identifier,
  ImageResizeMode,
  FileState,
} from '@atlaskit/media-client';
import { UIAnalyticsEvent } from '@atlaskit/analytics-next';
import {
  MediaFeatureFlags,
  NumericalCardDimensions,
  SSR,
} from '@atlaskit/media-common';
import { CardAction } from './actions';
import { MediaViewerDataSource } from '@atlaskit/media-viewer';
import { CardPreview, CardStatus, CardAppearance } from './types';
import { MediaCardError } from './errors';
import { CardDimensions } from './utils';
export type { CardDimensions } from './utils';

export type { NumericalCardDimensions } from '@atlaskit/media-common';

export { Card, MediaInlineCard } from './root';

export type { CardAction, CardEventHandler } from './actions';

export type {
  CardStatus,
  CardAppearance,
  CardDimensionValue,
  CardPreview,
} from './types';

export type TitleBoxIcon = 'LockFilledIcon';

export interface CardEvent {
  event: MouseEvent<HTMLElement>;
  mediaItemDetails?: FileDetails;
}

export interface SharedCardProps {
  // only relevant to file card with image appearance
  readonly disableOverlay?: boolean;
  readonly resizeMode?: ImageResizeMode;
  readonly featureFlags?: MediaFeatureFlags;
  readonly appearance?: CardAppearance;
  readonly dimensions?: CardDimensions;
  readonly originalDimensions?: NumericalCardDimensions;
  readonly actions?: Array<CardAction>;
  readonly selectable?: boolean;
  readonly selected?: boolean;
  readonly alt?: string;
  readonly testId?: string;
  readonly titleBoxBgColor?: string;
  readonly titleBoxIcon?: TitleBoxIcon;
}

export interface CardOnClickCallback {
  (result: CardEvent, analyticsEvent?: UIAnalyticsEvent): void;
}

export interface CardEventProps {
  readonly onClick?: CardOnClickCallback;
  readonly onMouseEnter?: (result: CardEvent) => void;
  /** Callback function to be called when video enters and exit fullscreen.
   * `fullscreen = true` indicates video enters fullscreen
   * `fullscreen = false` indicates video exits fullscreen
   */
  readonly onFullscreenChange?: (fullscreen: boolean) => void;
}

export interface CardProps extends SharedCardProps, CardEventProps {
  readonly mediaClient: MediaClient;
  readonly identifier: Identifier;
  readonly isLazy?: boolean;
  readonly useInlinePlayer?: boolean;
  readonly shouldOpenMediaViewer?: boolean;
  readonly mediaViewerDataSource?: MediaViewerDataSource;
  readonly contextId?: string;
  readonly shouldEnableDownloadButton?: boolean;
  readonly ssr?: SSR;
}

export interface CardState {
  status: CardStatus;
  isCardVisible: boolean;
  shouldAutoplay?: boolean;
  isPlayingFile: boolean;
  mediaViewerSelectedItem?: Identifier;
  fileState?: FileState;
  progress?: number;
  cardPreview?: CardPreview;
  error?: MediaCardError;
  cardRef: HTMLDivElement | null;
  isBannedLocalPreview: boolean;
  previewDidRender: boolean;
}

export { CardLoading } from './utils/lightCards/cardLoading';
export { CardError } from './utils/lightCards/cardError';
export { defaultImageCardDimensions } from './utils/cardDimensions';
export {
  fileCardImageViewSelector,
  fileCardImageViewSelectedSelector,
} from './files/cardImageView/classnames';
export { inlinePlayerClassName } from './root/inlinePlayer';
export { newFileExperienceClassName } from './root/card/cardConstants';
