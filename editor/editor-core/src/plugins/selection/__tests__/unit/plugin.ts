import { Decoration, EditorView } from 'prosemirror-view';
import { NodeSelection, TextSelection } from 'prosemirror-state';
import {
  createProsemirrorEditorFactory,
  Preset,
  LightEditorPlugin,
} from '@atlaskit/editor-test-helpers/create-prosemirror-editor';
import { doc, p, hr } from '@atlaskit/editor-test-helpers/schema-builder';
import { insertText } from '@atlaskit/editor-test-helpers/transactions';
import selectionPlugin from '../..';
import { getPluginState } from '../../plugin';
import rulePlugin from '../../../rule';
import { akEditorSelectedNodeClassName } from '../../../../styles';

describe('selection plugin', () => {
  const createEditor = createProsemirrorEditorFactory();
  const preset = new Preset<LightEditorPlugin>()
    .add(selectionPlugin)
    .add(rulePlugin);

  const editor = (doc: any) => createEditor({ doc, preset });
  const expectedNodeDecoration = (from: number, to: number) =>
    Decoration.node(from, to, {
      class: akEditorSelectedNodeClassName,
    });

  const setNodeSelection = (pos: number) => {
    editorView.dispatch(
      editorView.state.tr.setSelection(
        NodeSelection.create(editorView.state.doc, pos),
      ),
    );
  };
  const setTextSelection = (from: number, to?: number) => {
    editorView.dispatch(
      editorView.state.tr.setSelection(
        TextSelection.create(editorView.state.doc, from, to),
      ),
    );
  };

  const insertTextAndSetNodeSelection = (
    text: string,
    setSelectAtPos: number,
    insertAtPos?: number,
  ) => {
    let tr = editorView.state.tr.insertText(text, insertAtPos);
    tr = tr.setSelection(
      NodeSelection.create(tr.doc, setSelectAtPos + text.length),
    );
    editorView.dispatch(tr);
  };

  const insertTextAndSetTextSelection = (
    text: string,
    setSelectAtPos: number,
    insertAtPos?: number,
  ) => {
    let tr = editorView.state.tr.insertText(text, insertAtPos);
    tr = tr.setSelection(
      TextSelection.create(tr.doc, setSelectAtPos + text.length),
    );
    editorView.dispatch(tr);
  };

  let editorView: EditorView;
  let refs: { [name: string]: number };

  describe('creating plugin state', () => {
    describe('with a NodeSelection', () => {
      it('creates plugin state with decorations', () => {
        ({ editorView, refs } = editor(
          doc(
            p('i like bilbies'),
            '{<node>}',
            '{nodeStart}',
            hr(),
            '{nodeEnd}',
          ),
        ));
        const { decorationSet } = getPluginState(editorView.state);
        expect(decorationSet.find().length).toBe(1);
        expect(decorationSet.find()[0]).toEqual(
          expectedNodeDecoration(refs.nodeStart, refs.nodeEnd),
        );
      });
    });

    describe('with a standard TextSelection', () => {
      it('creates plugin state with no decorations', () => {
        ({ editorView } = editor(doc(p('i like bilbies{<>}'))));
        const { decorationSet } = getPluginState(editorView.state);
        expect(decorationSet.find().length).toBe(0);
      });
    });
  });

  describe('on selection change', () => {
    describe('to a NodeSelection', () => {
      beforeEach(() => {
        ({ editorView, refs } = editor(
          doc(p('i like bilbies{<>}'), '{nodeStart}', hr(), '{nodeEnd}'),
        ));
        setNodeSelection(refs.nodeStart);
      });

      it('creates new decorations', () => {
        const { decorationSet } = getPluginState(editorView.state);
        expect(decorationSet.find().length).toBe(1);
        expect(decorationSet.find()[0]).toEqual(
          expectedNodeDecoration(refs.nodeStart, refs.nodeEnd),
        );
      });

      describe('then back to something else', () => {
        it('removes decorations', () => {
          setTextSelection(1);
          const { decorationSet } = getPluginState(editorView.state);
          expect(decorationSet.find().length).toBe(0);
        });
      });
    });

    describe('to another standard TextSelection', () => {
      it("doesn't update plugin state", () => {
        ({ editorView, refs } = editor(doc(p('i like bilbies{<>}'))));
        const prevPluginState = getPluginState(editorView.state);
        setTextSelection(1);
        expect(getPluginState(editorView.state)).toBe(prevPluginState);
      });
    });
  });

  describe('on document change', () => {
    describe('when no decorations', () => {
      it("doesn't update plugin state", () => {
        ({ editorView } = editor(doc(p('i like bilbies{<>}'))));
        const prevPluginState = getPluginState(editorView.state);
        insertText(editorView, 'hi');
        expect(getPluginState(editorView.state)).toBe(prevPluginState);
      });
    });

    describe('when decorations', () => {
      it('maps decorations', () => {
        ({ editorView, refs } = editor(
          doc(
            p('{paragraphStart}'),
            '{<node>}',
            '{nodeStart}',
            hr(),
            '{nodeEnd}',
          ),
        ));
        insertText(editorView, 'hi', refs.paragraphStart);

        const { decorationSet } = getPluginState(editorView.state);
        expect(decorationSet.find().length).toBe(1);
        expect(decorationSet.find()[0]).toEqual(
          // + 2 for length of "hi"
          expectedNodeDecoration(refs.nodeStart + 2, refs.nodeEnd + 2),
        );
      });
    });

    describe('with selection change', () => {
      describe('to a standard TextSelection', () => {
        describe('and there are no decorations', () => {
          it("doesn't update plugin state", () => {
            ({ editorView } = editor(doc(p('i like bilbies{<>}'))));
            const prevPluginState = getPluginState(editorView.state);
            insertTextAndSetTextSelection('hi', 1);
            expect(getPluginState(editorView.state)).toBe(prevPluginState);
          });

          describe('and there are decorations', () => {
            it('removes decorations', () => {
              ({ editorView, refs } = editor(
                doc(p('i like bilbies{<>}'), '{nodeStart}', hr(), '{nodeEnd}'),
              ));
              setNodeSelection(refs.nodeStart);
              insertTextAndSetTextSelection('hi', 1);
              const { decorationSet } = getPluginState(editorView.state);
              expect(decorationSet.find().length).toBe(0);
            });
          });
        });
      });

      describe('to a NodeSelection', () => {
        describe('and there are no decorations', () => {
          it('creates new decorations', () => {
            ({ editorView, refs } = editor(
              doc(p('i like bilbies{<>}'), '{nodeStart}', hr(), '{nodeEnd}'),
            ));
            insertTextAndSetNodeSelection('hi', refs.nodeStart);

            const { decorationSet } = getPluginState(editorView.state);
            expect(decorationSet.find().length).toBe(1);
            expect(decorationSet.find()[0]).toEqual(
              // + 2 for length of "hi"
              expectedNodeDecoration(refs.nodeStart + 2, refs.nodeEnd + 2),
            );
          });
        });

        describe('and there are decorations', () => {
          it('updates decorations', () => {
            ({ editorView, refs } = editor(
              doc(
                p('i like bilbies'),
                '{<node>}',
                '{firstNodeStart}',
                hr(),
                '{firstNodeEnd}',
                '{secondNodeStart}',
                hr(),
                '{secondNodeEnd}',
              ),
            ));
            insertTextAndSetNodeSelection('hi', refs.secondNodeStart, 1);

            const { decorationSet } = getPluginState(editorView.state);
            expect(decorationSet.find().length).toBe(1);
            expect(decorationSet.find()[0]).toEqual(
              expectedNodeDecoration(
                // + 2 for length of "hi"
                refs.secondNodeStart + 2,
                refs.secondNodeEnd + 2,
              ),
            );
          });
        });
      });
    });
  });
});
