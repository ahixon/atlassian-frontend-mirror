import {
  name as packageName,
  version as packageVersion,
} from '../../version.json';
import { CreateUIAnalyticsEvent } from '@atlaskit/analytics-next';
import { APIError, CardType } from '@atlaskit/linking-common';

import { AnalyticsPayload } from '../types';
import { ErrorInfo } from 'react';
import { CardInnerAppearance } from '../../view/Card/types';
import {
  PreviewDisplay,
  PreviewInvokeMethod,
} from '../../view/HoverCard/types';
import { getMeasure } from '../performance';
import { DestinationProduct, DestinationSubproduct } from './types';

export const ANALYTICS_CHANNEL = 'media';

export const context = {
  componentName: 'smart-cards',
  packageName,
  packageVersion,
};

const uiActionSubjectIds: Record<string, string> = {
  DownloadAction: 'downloadDocument',
  PreviewAction: 'invokePreviewScreen',
  ViewAction: 'shortcutGoToLink',
};

export class SmartLinkEvents {
  public insertSmartLink(
    url: string,
    type: CardInnerAppearance,
    createAnalyticsEvent?: CreateUIAnalyticsEvent,
  ) {
    fireSmartLinkEvent(
      {
        action: 'inserted',
        actionSubject: 'smartLink',
        eventType: 'track',
        attributes: {
          type,
        },
        nonPrivacySafeAttributes: {
          domainName: url,
        },
      },
      createAnalyticsEvent,
    );
  }
}

export const fireSmartLinkEvent = (
  payload: AnalyticsPayload,
  createAnalyticsEvent?: CreateUIAnalyticsEvent,
) => {
  if (createAnalyticsEvent) {
    createAnalyticsEvent(payload).fire(ANALYTICS_CHANNEL);
  }
};

export const resolvedEvent = (
  id: string,
  definitionId?: string,
  extensionKey?: string,
  resourceType?: string,
): AnalyticsPayload => ({
  action: 'resolved',
  actionSubject: 'smartLink',
  eventType: 'operational',
  attributes: {
    id,
    ...context,
    ...(definitionId ? { definitionId } : {}),
    ...(extensionKey ? { extensionKey } : {}),
    ...(resourceType ? { resourceType } : {}),
  },
});

export const unresolvedEvent = (
  id: string,
  status: string,
  definitionId?: string,
  extensionKey?: string,
  resourceType?: string,
  error?: APIError,
): AnalyticsPayload => ({
  action: 'unresolved',
  actionSubject: 'smartLink',
  eventType: 'operational',
  attributes: {
    id,
    ...context,
    ...(definitionId ? { definitionId } : {}),
    ...(extensionKey ? { extensionKey } : {}),
    ...(resourceType ? { resourceType } : {}),
    reason: status,
    error: error
      ? {
          message: error.message,
          kind: error.kind,
          type: error.type,
        }
      : undefined,
  },
});

export const invokeSucceededEvent = (
  id: string,
  actionType: string,
  display: CardInnerAppearance,
  extensionKey?: string,
): AnalyticsPayload => {
  const measure = getMeasure(id, 'resolved') || { duration: undefined };
  return {
    action: 'resolved',
    actionSubject: 'smartLinkAction',
    eventType: 'operational',
    attributes: {
      ...context,
      id,
      actionType,
      display,
      extensionKey: extensionKey || '',
      duration: measure.duration,
    },
  };
};

export const invokeFailedEvent = (
  id: string,
  actionType: string,
  display: CardInnerAppearance,
  reason: string,
  extensionKey?: string,
): AnalyticsPayload => {
  const measure = getMeasure(id, 'errored') || { duration: undefined };
  return {
    action: 'unresolved',
    actionSubject: 'smartLinkAction',
    eventType: 'operational',
    attributes: {
      ...context,
      id,
      actionType,
      display,
      extensionKey: extensionKey || '',
      duration: measure.duration,
      reason,
    },
  };
};

export const connectSucceededEvent = (
  definitionId?: string,
  extensionKey?: string,
): AnalyticsPayload => ({
  action: 'connectSucceeded',
  actionSubject: 'smartLink',
  eventType: 'operational',
  attributes: {
    ...context,
    ...(definitionId ? { definitionId } : {}),
    ...(extensionKey ? { extensionKey } : {}),
  },
});

export const connectFailedEvent = (
  definitionId?: string,
  extensionKey?: string,
  reason?: string,
): AnalyticsPayload => ({
  action: 'connectFailed',
  actionSubject: 'smartLink',
  actionSubjectId: reason,
  eventType: 'operational',
  attributes: {
    ...context,
    ...(reason ? { reason: reason } : {}),
    ...(definitionId ? { definitionId } : {}),
    ...(extensionKey ? { extensionKey } : {}),
  },
});

export const trackAppAccountConnected = (
  definitionId?: string,
  extensionKey?: string,
): AnalyticsPayload => ({
  action: 'connected',
  actionSubject: 'applicationAccount',
  eventType: 'track',
  attributes: {
    ...context,
    ...(definitionId ? { definitionId } : {}),
    ...(extensionKey ? { extensionKey } : {}),
  },
});

export const uiAuthEvent = (
  display: CardInnerAppearance,
  definitionId?: string,
  extensionKey?: string,
): AnalyticsPayload => ({
  action: 'clicked',
  actionSubject: 'button',
  actionSubjectId: 'connectAccount',
  eventType: 'ui',
  attributes: {
    ...context,
    definitionId: definitionId || '',
    extensionKey: extensionKey || '',
    display,
  },
});

export const uiAuthAlternateAccountEvent = (
  display: CardInnerAppearance,
  definitionId?: string,
  extensionKey?: string,
): AnalyticsPayload => ({
  action: 'clicked',
  actionSubject: 'smartLink',
  actionSubjectId: 'tryAnotherAccount',
  eventType: 'ui',
  attributes: {
    ...context,
    definitionId: definitionId || '',
    extensionKey: extensionKey || '',
    display,
  },
});

export const uiCardClickedEvent = (
  id: string,
  display: CardInnerAppearance,
  status: CardType,
  definitionId?: string,
  extensionKey?: string,
  isModifierKeyPressed?: boolean,
  location?: string,
  destinationProduct?: DestinationProduct | string,
  destinationSubproduct?: DestinationSubproduct | string,
): AnalyticsPayload => ({
  action: 'clicked',
  actionSubject: 'smartLink',
  actionSubjectId: 'titleGoToLink',
  eventType: 'ui',
  attributes: {
    ...context,
    id,
    status,
    definitionId: definitionId || '',
    extensionKey: extensionKey || '',
    display,
    isModifierKeyPressed,
    location,
    destinationProduct,
    destinationSubproduct,
  },
});

export const uiActionClickedEvent = (
  id: string,
  actionType: string,
  extensionKey?: string,
  display?: CardInnerAppearance,
): AnalyticsPayload => ({
  action: 'clicked',
  actionSubject: 'button',
  actionSubjectId: uiActionSubjectIds[actionType],
  eventType: 'ui',
  attributes: {
    ...context,
    id,
    display,
    extensionKey: extensionKey || '',
    actionType: actionType,
  },
});

export const uiClosedAuthEvent = (
  display: CardInnerAppearance,
  definitionId?: string,
  extensionKey?: string,
): AnalyticsPayload => ({
  action: 'closed',
  actionSubject: 'consentModal',
  eventType: 'ui',
  attributes: {
    ...context,
    definitionId: definitionId || '',
    extensionKey: extensionKey || '',
    display,
  },
});

export const screenAuthPopupEvent = (
  definitionId?: string,
  extensionKey?: string,
): AnalyticsPayload => ({
  actionSubject: 'consentModal',
  eventType: 'screen',
  attributes: {
    ...context,
    definitionId: definitionId || '',
    extensionKey: extensionKey || '',
  },
});

export const uiRenderSuccessEvent = (
  display: CardInnerAppearance,
  status: CardType,
  definitionId?: string,
  extensionKey?: string,
): AnalyticsPayload => ({
  action: 'renderSuccess',
  actionSubject: 'smartLink',
  eventType: 'ui',
  attributes: {
    ...context,
    status,
    definitionId: definitionId || '',
    extensionKey: extensionKey || '',
    display,
  },
});

export const uiRenderFailedEvent = (
  display: CardInnerAppearance,
  error: Error,
  errorInfo: ErrorInfo,
): AnalyticsPayload => ({
  actionSubject: 'smartLink',
  action: 'renderFailed',
  eventType: 'ui',
  attributes: {
    error,
    errorInfo,
    display,
  },
});

export const uiHoverCardViewedEvent = (
  id: string,
  previewDisplay: PreviewDisplay,
  definitionId?: string,
  extensionKey?: string,
  previewInvokeMethod?: PreviewInvokeMethod,
): AnalyticsPayload => ({
  action: 'viewed',
  actionSubject: 'hoverCard',
  eventType: 'ui',
  attributes: {
    ...context,
    id,
    definitionId: definitionId || '',
    extensionKey: extensionKey || '',
    previewDisplay,
    previewInvokeMethod,
  },
});

export const uiHoverCardDismissedEvent = (
  id: string,
  previewDisplay: PreviewDisplay,
  hoverTime: number,
  definitionId?: string,
  extensionKey?: string,
  previewInvokeMethod?: PreviewInvokeMethod,
): AnalyticsPayload => ({
  action: 'dismissed',
  actionSubject: 'hoverCard',
  eventType: 'ui',
  attributes: {
    ...context,
    id,
    definitionId: definitionId || '',
    extensionKey: extensionKey || '',
    hoverTime,
    previewDisplay,
    previewInvokeMethod,
  },
});

export const uiHoverCardOpenLinkClickedEvent = (
  id: string,
  previewDisplay: string,
  definitionId?: string,
  extensionKey?: string,
  previewInvokeMethod?: PreviewInvokeMethod,
): AnalyticsPayload => ({
  action: 'clicked',
  actionSubject: 'button',
  actionSubjectId: 'shortcutGoToLink',
  eventType: 'ui',
  attributes: {
    ...context,
    id,
    definitionId: definitionId || '',
    extensionKey: extensionKey || '',
    previewDisplay,
    previewInvokeMethod,
  },
});
