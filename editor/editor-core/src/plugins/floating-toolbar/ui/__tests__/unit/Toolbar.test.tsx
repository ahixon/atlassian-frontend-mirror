import React from 'react';
import { mount } from 'enzyme';
import { createEditorFactory } from '@atlaskit/editor-test-helpers/create-editor';
import {
  doc,
  table,
  tr,
  thEmpty,
  tdEmpty,
} from '@atlaskit/editor-test-helpers/doc-builder';

import { flushPromises } from '../../../../../__tests__/__helpers/utils';
import Toolbar from '../../Toolbar';

import { ADFEntity } from '@atlaskit/adf-utils';
import {
  createTestExtensionProvider,
  emptyExtensionProvider,
} from '../__helpers/extensions';

describe('<Toolbar />', () => {
  const createEditor = createEditorFactory();
  const docNode = doc(
    table({ layout: 'full-width' })(
      tr(thEmpty, thEmpty, thEmpty),
      tr(tdEmpty, tdEmpty, tdEmpty),
    ),
  );
  const { editorView } = createEditor({
    doc: docNode,
    editorProps: {
      allowTables: true,
      allowExtension: {
        allowExtendFloatingToolbars: true,
      },
    },
  });

  const action = jest
    .fn()
    .mockImplementation(() =>
      Promise.resolve(
        ((editorView.state.doc.firstChild as unknown) as ADFEntity) ||
          undefined,
      ),
    );

  it('renders extension items if provided', async () => {
    let wrapper;
    if (editorView.state.doc.firstChild) {
      wrapper = mount(
        <Toolbar
          node={editorView.state.doc.firstChild}
          editorView={editorView}
          extensionsProvider={createTestExtensionProvider(action)}
          items={[
            {
              type: 'extensions-placeholder',
            },
          ]}
          dispatchAnalyticsEvent={jest.fn()}
          dispatchCommand={jest.fn()}
        />,
      );

      await flushPromises();

      wrapper.update();
    }

    expect(
      wrapper?.find('button[aria-label="Item with icon and label"]').length,
    ).toEqual(1);
    expect(
      wrapper?.find('[tooltipContent="Item with icon and label"]').length,
    ).toEqual(1);

    wrapper
      ?.find('button[aria-label="Item with icon and label"]')
      .simulate('click');
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('does not render when no extension items provided', async () => {
    let wrapper;
    if (editorView.state.doc.firstChild) {
      wrapper = mount(
        <Toolbar
          node={editorView.state.doc.firstChild}
          editorView={editorView}
          extensionsProvider={emptyExtensionProvider}
          items={[
            {
              type: 'extensions-placeholder',
            },
          ]}
          dispatchAnalyticsEvent={jest.fn()}
          dispatchCommand={jest.fn()}
        />,
      );
    }

    expect(wrapper?.find('button').length).toEqual(0);
    expect(wrapper?.find('ExtensionsPlaceholder').length).toEqual(1);
  });
});
