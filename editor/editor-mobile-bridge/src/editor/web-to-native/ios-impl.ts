import { Color as StatusColor } from '@atlaskit/status/element';
import NativeBridge, { EditorBridges, EditorBridgeNames } from './bridge';
import { sendToBridge } from '../../bridge-utils';
import {
  EditorLifecycleActions,
  EditorLifecycleAnalyticsEvents,
} from '../../analytics/lifecycle';
import { ActionSubject, EventType } from '../../analytics/enums';

export default class IosBridge implements NativeBridge {
  private _editorReady: boolean = false;
  private _startWebBundle: boolean = false;
  private window: Window;

  constructor(win: Window = window) {
    this.window = win;
  }

  showMentions(query: string) {
    if (
      this.window.webkit &&
      this.window.webkit.messageHandlers.mentionBridge
    ) {
      this.window.webkit.messageHandlers.mentionBridge.postMessage({
        name: 'showMentions',
        query: query,
      });
    }
  }

  dismissMentions() {
    if (
      this.window.webkit &&
      this.window.webkit.messageHandlers.mentionBridge
    ) {
      this.window.webkit.messageHandlers.mentionBridge.postMessage({
        name: 'dismissMentions',
      });
    }
  }
  updateTextFormat(markStates: string) {
    if (
      this.window.webkit &&
      this.window.webkit.messageHandlers.textFormatBridge
    ) {
      this.window.webkit.messageHandlers.textFormatBridge.postMessage({
        name: 'updateTextFormat',
        states: markStates,
      });
    }
  }
  updateText(content: string) {
    if (
      this.window.webkit &&
      this.window.webkit.messageHandlers.textFormatBridge
    ) {
      this.window.webkit.messageHandlers.textFormatBridge.postMessage({
        name: 'updateText',
        query: content,
      });
    }
  }
  getServiceHost(): string {
    if (this.window.mediaBridge) {
      return this.window.mediaBridge.getServiceHost();
    } else {
      // ¯\_(ツ)_/¯ ugly, I know, but we need this data, and don't want call native side
      return 'http://www.atlassian.com';
    }
  }

  getCollection(): string {
    if (this.window.mediaBridge) {
      return this.window.mediaBridge.getCollection();
    } else {
      // ¯\_(ツ)_/¯ @see #getServiceHost()
      return 'FabricMediaSampleCollection';
    }
  }

  submitPromise(name: string, uuid: string, args: string) {
    if (
      this.window.webkit &&
      this.window.webkit.messageHandlers.promiseBridge
    ) {
      this.window.webkit.messageHandlers.promiseBridge.postMessage({
        name: 'submitPromise',
        promise: {
          name: name,
          uuid: uuid,
        },
        args: args,
      });
    }
  }

  updateBlockState(currentBlockType: string) {
    if (
      this.window.webkit &&
      this.window.webkit.messageHandlers.blockFormatBridge
    ) {
      this.window.webkit.messageHandlers.blockFormatBridge.postMessage({
        name: 'updateBlockState',
        states: currentBlockType,
      });
    }
  }

  updateListState(listState: string) {
    if (this.window.webkit && this.window.webkit.messageHandlers.listBridge) {
      this.window.webkit.messageHandlers.listBridge.postMessage({
        name: 'updateListState',
        states: listState,
      });
    }
  }

  showStatusPicker(
    text: string,
    color: StatusColor,
    uuid: string,
    isNew: boolean,
  ) {
    if (this.window.webkit && this.window.webkit.messageHandlers.statusBridge) {
      this.window.webkit.messageHandlers.statusBridge.postMessage({
        name: 'showStatusPicker',
        text,
        color,
        uuid,
        isNew,
      });
    }
  }

  dismissStatusPicker(isNew: boolean) {
    if (this.window.webkit && this.window.webkit.messageHandlers.statusBridge) {
      this.window.webkit.messageHandlers.statusBridge.postMessage({
        name: 'dismissStatusPicker',
        isNew,
      });
    }
  }

  currentSelection(
    text: string,
    url: string,
    top: number,
    right: number,
    bottom: number,
    left: number,
  ) {
    if (this.window.webkit && this.window.webkit.messageHandlers.linkBridge) {
      this.window.webkit.messageHandlers.linkBridge.postMessage({
        name: 'currentSelection',
        text,
        url,
        top,
        right,
        bottom,
        left,
      });
    }
  }

  stateChanged(canUndo: boolean, canRedo: boolean) {
    if (
      this.window.webkit &&
      this.window.webkit.messageHandlers.undoRedoBridge
    ) {
      this.window.webkit.messageHandlers.undoRedoBridge.postMessage({
        name: 'stateChanged',
        canUndo,
        canRedo,
      });
    }
  }

  trackEvent(event: string) {
    if (
      this.window.webkit &&
      this.window.webkit.messageHandlers.analyticsBridge
    ) {
      this.window.webkit.messageHandlers.analyticsBridge.postMessage({
        name: 'trackEvent',
        event,
      });
    }
  }

  connectToCollabService(path: string): void {
    if (this.window.webkit && this.window.webkit.messageHandlers.collabBridge) {
      this.window.webkit.messageHandlers.collabBridge.postMessage({
        name: 'connect',
        path,
      });
    }
  }

  disconnectFromCollabService(): void {
    if (this.window.webkit && this.window.webkit.messageHandlers.collabBridge) {
      this.window.webkit.messageHandlers.collabBridge.postMessage({
        name: 'disconnect',
      });
    }
  }

  emitCollabChanges(event: string, jsonArgs: string): void {
    if (this.window.webkit && this.window.webkit.messageHandlers.collabBridge) {
      this.window.webkit.messageHandlers.collabBridge.postMessage({
        name: 'emit',
        event,
        jsonArgs,
      });
    }
  }

  call<T extends EditorBridgeNames>(
    bridge: T,
    event: keyof Required<EditorBridges>[T],
    ...args: any[]
  ) {
    sendToBridge(bridge, event, ...args);
  }

  updateTextColor() {}

  editorDestroyed(): void {
    if (
      this.window.webkit &&
      this.window.webkit.messageHandlers.lifecycleBridge
    ) {
      this.window.webkit.messageHandlers.lifecycleBridge.postMessage({
        name: 'editorDestroyed',
      });
    }
  }

  editorError(error: string, errorInfo?: string): void {
    const editorError: EditorLifecycleAnalyticsEvents = {
      action: EditorLifecycleActions.EDITOR_ERROR,
      actionSubject: ActionSubject.EDITOR,
      eventType: EventType.OPERATIONAL,
      attributes: {
        isBridgeSetup: !!(
          this.window.webkit &&
          this.window.webkit.messageHandlers.lifecycleBridge
        ),
        errorMessage: error,
      },
    };
    this.trackEvent(JSON.stringify(editorError));

    if (
      this.window.webkit &&
      this.window.webkit.messageHandlers.lifecycleBridge
    ) {
      this.window.webkit.messageHandlers.lifecycleBridge.postMessage({
        name: 'editorError',
        error,
        errorInfo,
      });
    }
  }

  startWebBundle(): void {
    if (
      !this.window.webkit ||
      !this.window.webkit.messageHandlers.lifecycleBridge
    ) {
      const webBundleStartTwice: EditorLifecycleAnalyticsEvents = {
        action:
          EditorLifecycleActions.START_WEB_BUNDLE_CALLED_BEFORE_LIFECYCLE_BRIDGE_SETUP,
        actionSubject: ActionSubject.EDITOR,
        eventType: EventType.TRACK,
      };
      this.trackEvent(JSON.stringify(webBundleStartTwice));
      return;
    }

    if (this._startWebBundle) {
      const webBundleStartTwice: EditorLifecycleAnalyticsEvents = {
        action: EditorLifecycleActions.START_WEB_BUNDLE_CALLED_TWICE,
        actionSubject: ActionSubject.EDITOR,
        eventType: EventType.OPERATIONAL,
      };
      this.trackEvent(JSON.stringify(webBundleStartTwice));
      return;
    }

    this._startWebBundle = true;
    this.window.webkit.messageHandlers.lifecycleBridge.postMessage({
      name: 'startWebBundle',
    });
  }

  editorReady(): void {
    if (
      !this.window.webkit ||
      !this.window.webkit.messageHandlers.lifecycleBridge
    ) {
      const editorReadyTwice: EditorLifecycleAnalyticsEvents = {
        action:
          EditorLifecycleActions.EDITOR_READY_CALLED_BEFORE_LIFECYCLE_BRIDGE_SETUP,
        actionSubject: ActionSubject.EDITOR,
        eventType: EventType.TRACK,
      };
      this.trackEvent(JSON.stringify(editorReadyTwice));
      return;
    }

    if (this._editorReady) {
      const editorReadyTwice: EditorLifecycleAnalyticsEvents = {
        action: EditorLifecycleActions.EDITOR_READY_CALLED_TWICE,
        actionSubject: ActionSubject.EDITOR,
        eventType: EventType.OPERATIONAL,
      };
      this.trackEvent(JSON.stringify(editorReadyTwice));
      return;
    }
    this._editorReady = true;
    this.window.webkit.messageHandlers.lifecycleBridge.postMessage({
      name: 'editorReady',
    });
  }

  onRenderedContentHeightChanged(height: number): void {
    if (window.webkit && window.webkit.messageHandlers.contentBridge) {
      window.webkit.messageHandlers.contentBridge.postMessage({
        name: 'onRenderedContentHeightChanged',
        height,
      });
    }
  }
}
