import {
  ContentBridge,
  AnnotationBridge,
  AnnotationPayloadsByType,
  AnnotationWithRectPayloadsByType,
  AnnotationTypesAvailableOnCurrentSelection,
} from './bridge';
import { JSONDocNode } from '@atlaskit/editor-json-transformer';
import { sendToBridge } from '../../bridge-utils';

class WebRendererBridge {
  call = sendToBridge;
}

class Bridge implements AnnotationBridge, ContentBridge {
  onAnnotationClick(annotations?: AnnotationPayloadsByType[]) {
    if (annotations) {
      sendToBridge('annotationBridge', 'onAnnotationClick', {
        payload: JSON.stringify(annotations),
      });
    } else {
      sendToBridge('annotationBridge', 'onAnnotationClick');
    }
  }

  onAnnotationClickWithRect(annotations?: AnnotationWithRectPayloadsByType[]) {
    if (annotations && annotations.length) {
      sendToBridge('annotationBridge', 'onAnnotationClickWithRect', {
        payload: JSON.stringify(annotations),
      });
    } else {
      sendToBridge('annotationBridge', 'onAnnotationClickWithRect');
    }
  }

  fetchAnnotationStates(annotations: AnnotationPayloadsByType[]) {
    sendToBridge('annotationBridge', 'fetchAnnotationStates', {
      payload: JSON.stringify(annotations),
    });
  }

  setContent(adf: JSONDocNode) {
    sendToBridge('contentBridge', 'setContent', {
      payload: JSON.stringify(adf),
    });
  }

  canApplyAnnotationOnCurrentSelection(
    payload: AnnotationTypesAvailableOnCurrentSelection[],
  ) {
    sendToBridge('annotationBridge', 'canApplyAnnotationOnCurrentSelection', {
      payload: JSON.stringify(payload),
    });
  }
}

export const toNativeBridge = new WebRendererBridge();
export const nativeBridgeAPI = new Bridge();
