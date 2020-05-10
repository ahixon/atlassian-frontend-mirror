import {
  createProsemirrorEditorFactory,
  Preset,
  LightEditorPlugin,
} from '@atlaskit/editor-test-helpers/create-prosemirror-editor';
import { doc, panel, p } from '@atlaskit/editor-test-helpers/schema-builder';
import { CreateUIAnalyticsEvent } from '@atlaskit/analytics-next';
import { PanelType } from '@atlaskit/adf-schema';
import {
  removePanel,
  changePanelType,
} from '../../../../plugins/panel/actions';
import panelPlugin from '../../../../plugins/panel';
import analyticsPlugin from '../../../../plugins/analytics';

describe('panel actions', () => {
  const createEditor = createProsemirrorEditorFactory();
  let createAnalyticsEvent: CreateUIAnalyticsEvent;

  const editor = (doc: any) => {
    createAnalyticsEvent = jest.fn().mockReturnValue({ fire() {} });
    const preset = new Preset<LightEditorPlugin>()
      .add(panelPlugin)
      .add([analyticsPlugin, { createAnalyticsEvent }]);

    return createEditor({ doc, preset });
  };

  describe('remove panel', () => {
    it('deletes panel when selection inside panel', () => {
      const { editorView } = editor(
        doc(panel({ panelType: 'info' })(p('text{<>}')), p('hello')),
      );

      removePanel()(editorView.state, editorView.dispatch);
      expect(editorView.state).toEqualDocumentAndSelection(doc(p('{<>}hello')));
    });

    it('deletes panel when selection is panel node selection', () => {
      const { editorView } = editor(
        doc('{<node>}', panel({ panelType: 'info' })(p('text')), p('hello')),
      );

      removePanel()(editorView.state, editorView.dispatch);
      expect(editorView.state).toEqualDocumentAndSelection(doc(p('{<>}hello')));
    });

    it('trigger GAS3 analytics when deleted via toolbar', () => {
      const { editorView } = editor(
        doc(panel({ panelType: 'info' })(p('text{<>}'))),
      );

      removePanel()(editorView.state, editorView.dispatch);
      expect(createAnalyticsEvent).toHaveBeenCalledWith({
        action: 'deleted',
        actionSubject: 'panel',
        attributes: { inputMethod: 'toolbar' },
        eventType: 'track',
      });
    });

    // Postponing as deletion of panels via keyboard is broken: https://product-fabric.atlassian.net/browse/ED-6504
    it.skip('trigger GAS3 analytics when deleted via keyboard', () => {
      const { editorView } = editor(
        doc(panel({ panelType: 'info' })(p('text{<>}'))),
      );

      removePanel()(editorView.state, editorView.dispatch);
      expect(createAnalyticsEvent).toHaveBeenCalledWith({
        action: 'deleted',
        actionSubject: 'panel',
        attributes: { inputMethod: 'keyboard' },
        eventType: 'track',
      });
    });
  });

  describe('change panel type', () => {
    const panelTypes: PanelType[] = [
      'info',
      'note',
      'tip',
      'warning',
      'error',
      'success',
    ];

    panelTypes.forEach(type => {
      it(`trigger GAS3 analytics when changing panel type to ${type}`, () => {
        let startType = type === 'info' ? 'note' : 'info';
        const { editorView } = editor(
          doc(panel({ panelType: startType })(p('text{<>}'))),
        );

        changePanelType(type)(editorView.state, editorView.dispatch);
        expect(createAnalyticsEvent).toHaveBeenCalledWith({
          action: 'changedType',
          actionSubject: 'panel',
          attributes: { newType: type, previousType: startType },
          eventType: 'track',
        });
      });
    });
  });
});
