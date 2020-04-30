import React from 'react';
import { mount } from 'enzyme';
import { NodeSelection } from 'prosemirror-state';

import createEditorFactory from '@atlaskit/editor-test-helpers/create-editor';
import { doc, extension } from '@atlaskit/editor-test-helpers/schema-builder';
import { createFakeExtensionProvider } from '@atlaskit/editor-test-helpers/extensions';

import {
  combineExtensionProviders,
  ParametersGetter,
  AsyncParametersGetter,
  UpdateExtension,
} from '@atlaskit/editor-common/extensions';
import { ProviderFactory } from '@atlaskit/editor-common/provider-factory';

import EditorContext from '../../../../ui/EditorContext';
import { pluginKey } from '../../../../plugins/extension/plugin-key';
import { EditorProps } from '../../../../types';
import { waitForProvider, flushPromises } from '../../../__helpers/utils';
import { getContextPanel } from '../../../../plugins/extension/context-panel';
import { setEditingContextToContextPanel } from '../../../../plugins/extension/commands';
import EditorActions from '../../../../actions';
import { PublicProps } from '../../../../ui/ConfigPanel/types';

// there are many warnings due to hooks usage and async code that will be solved with the next react update.
// this function will keep then silent so we can still read the tests.
const silenceActErrors = () => {
  let consoleError: jest.SpyInstance;

  beforeAll(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleError.mockRestore();
  });
};

describe('extension context panel', () => {
  const createEditor = createEditorFactory();

  const editor = (
    doc: any,
    props: Partial<EditorProps> = {},
    providerFactory?: ProviderFactory,
  ) => {
    return createEditor({
      doc,
      editorProps: {
        appearance: 'full-page',
        allowBreakout: true,
        allowExtension: {
          allowBreakout: true,
          allowAutoSave: true,
        },
        ...props,
      },
      pluginKey,
      providerFactory,
    });
  };

  const ExtensionHandlerComponent = () => <div>Awesome Extension</div>;

  const transformBefore: ParametersGetter = parameters =>
    parameters.macroParams;
  const transformAfter: AsyncParametersGetter = parameters =>
    Promise.resolve({
      macroParams: parameters,
    });

  const extensionUpdater: UpdateExtension<object> = (data, actions) =>
    new Promise(resolve => {
      actions!.editInContextPanel(transformBefore, transformAfter);
    });

  const extensionProvider = createFakeExtensionProvider(
    'fake.confluence',
    'expand',
    ExtensionHandlerComponent,
    extensionUpdater,
  );

  const providerFactory = ProviderFactory.create({
    extensionProvider: Promise.resolve(
      combineExtensionProviders([extensionProvider]),
    ),
  });

  describe('Saving', () => {
    silenceActErrors();

    const setupConfigPanel = async () => {
      const { editorView, eventDispatcher } = editor(
        doc(
          extension({
            extensionType: 'fake.confluence',
            extensionKey: 'expand',
            parameters: {
              macroParams: {
                title: 'click to see something cool',
                content: 'something cool',
              },
            },
          })(),
        ),
        {},
        providerFactory,
      );

      await waitForProvider(providerFactory)('extensionProvider');

      const tr = editorView.state.tr.setSelection(
        NodeSelection.create(editorView.state.doc, 0),
      );

      editorView.dispatch(tr);

      setEditingContextToContextPanel(transformBefore, transformAfter)(
        editorView.state,
        editorView.dispatch,
      );

      const contextPanel = getContextPanel(true)(editorView.state);

      expect(contextPanel).toBeTruthy();
      const editorActions = new EditorActions();
      const dispatchMock = jest.spyOn(editorView, 'dispatch');
      const emitMock = jest.spyOn(eventDispatcher, 'emit');

      editorActions._privateRegisterEditor(editorView, {} as any);
      const wrapper = mount(
        <EditorContext editorActions={editorActions}>
          {contextPanel!}
        </EditorContext>,
      );

      await flushPromises();

      wrapper.update();

      const props = wrapper.find('FieldsLoader').props() as PublicProps;

      return {
        props,
        dispatchMock,
        editorView,
        emitMock,
      };
    };

    it('should unwrap parameters when injecting into the component', async () => {
      const { props } = await setupConfigPanel();

      expect(props.parameters).toEqual({
        title: 'click to see something cool',
        content: 'something cool',
      });
    });

    it('should wrap parameters back when saving and not scroll into view', async () => {
      const { props, dispatchMock } = await setupConfigPanel();

      props.onChange({
        title: 'changed',
        content: 'not that cool',
      });

      await flushPromises();

      const lastDispatchedTr = dispatchMock.mock.calls.pop();

      expect(
        lastDispatchedTr![0].doc.toJSON().content[0].attrs.parameters,
      ).toEqual({
        macroParams: {
          title: 'changed',
          content: 'not that cool',
        },
      });

      expect((lastDispatchedTr as any).scrolledIntoView).toBeFalsy();
    });

    it('should not call emit on every document change', async () => {
      const { editorView, emitMock } = await setupConfigPanel();
      emitMock.mockClear();
      editorView.dispatch(editorView.state.tr.insertText('hello'));
      editorView.dispatch(editorView.state.tr.insertText(' world'));

      expect(
        emitMock.mock.calls.filter(([e, _]) => e === 'contextPanelPluginKey$')
          .length,
      ).toEqual(1);
    });
  });
});