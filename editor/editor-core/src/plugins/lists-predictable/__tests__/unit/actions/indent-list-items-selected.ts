import { Schema } from 'prosemirror-model';
import sampleSchema from '@atlaskit/editor-test-helpers/schema';
import {
  p,
  ul,
  li,
  doc,
  code_block,
  RefsNode,
} from '@atlaskit/editor-test-helpers/schema-builder';
import { createEditorState } from '@atlaskit/editor-test-helpers/create-editor-state';
import { indentListItemsSelected } from '../../../actions/indent-list-items-selected';

type DocumentType = (schema: Schema) => RefsNode;

describe('indent-list-items-selected', () => {
  const case0: [string, DocumentType, DocumentType] = [
    'cursor selection is inside of a nested list item',
    // Scenario
    // prettier-ignore
    doc(
      ul(
        li(p('A')),
        li(
          p('B'),
          ul(
            li(p('B1')),
            li(p('B2{<>}')),
            li(p('B3')),
          ),
        ),
        li(p('C')),
      ),
    ),
    // Expected Result
    // prettier-ignore
    doc(
      ul(
        li(p('A')),
        li(
          p('B'),
          ul(
            li(
              p('B1'),
              ul(li(p('B2{<>}'))),
            ),
            li(p('B3')),
          ),
        ),
        li(p('C')),
      ),
    ),
  ];

  const case1: [string, DocumentType, DocumentType] = [
    'cursor selection is at list item with nested list',
    // Scenario
    // prettier-ignore
    doc(
      ul(
        li(p('A')),
        li(
          p('B{<>}'),
          ul(
            li(p('B1')),
            li(p('B2')),
            li(p('B3')),
          ),
        ),
        li(p('C')),
      ),
    ),
    // Expected Result
    // prettier-ignore
    doc(
      ul(
        li(
          p('A'),
          ul(
            li(p('B{<>}')),
            li(p('B1')),
            li(p('B2')),
            li(p('B3')),
          ),
        ),
        li(p('C')),
      ),
    ),
  ];

  const case2: [string, DocumentType, DocumentType] = [
    'cursor selection is at the last list item inside a nested list',
    // Scenario
    // prettier-ignore
    doc(
      ul(
        li(p('A')),
        li(
          p('B'),
          ul(
            li(p('B1')),
            li(p('B2')),
            li(p('B3{<>}')),
          ),
        ),
        li(p('C')),
      ),
    ),
    // Expected Result
    // prettier-ignore
    doc(
      ul(
        li(
          p('A'),
        ),
        li(
          p('B'),
          ul(
            li(p('B1')),
            li(
              p('B2'),
              ul(
                li(p('B3{<>}')),
              ),
            ),
          ),
        ),
        li(p('C')),
      ),
    ),
  ];

  const case3: [string, DocumentType, DocumentType] = [
    'range are selecting two sibling list items',
    // Scenario
    // prettier-ignore
    doc(
      ul(
        li(p('A')),
        li(
          p('{<}B'),
          ul(
            li(p('B1')),
            li(p('B2{>}')),
            li(p('B3')),
          ),
        ),
        li(p('C')),
      ),
    ),
    // Expected Result
    // prettier-ignore
    doc(
      ul(
        li(
          p('A'),
          ul(
            li(
              p('{<}B'),
              ul(
                li(p('B1')),
                li(p('B2{>}')),
              ),
            ),
            li(p('B3')),
          ),
        ),
        li(p('C')),
      ),
    ),
  ];

  const case4: [string, DocumentType, DocumentType] = [
    'range is selecting list item with nested list before',
    // Scenario
    // prettier-ignore
    doc(
      ul(
        li(p('A')),
        li(
          p('B'),
          ul(
            li(p('B1')),
            li(p('B2')),
            li(p('B3')),
          ),
        ),
        li(p('C{<>}')),
      ),
    ),
    // Expected Result
    // prettier-ignore
    doc(
      ul(
        li(p('A')),
        li(
          p('B'),
          ul(
            li(p('B1')),
            li(p('B2')),
            li(p('B3')),
            li(p('C{<>}')),
          ),
        ),
      ),
    ),
  ];
  const case5: [string, DocumentType, DocumentType] = [
    'range are selecting from a nested list to an outer list item',
    // Scenario
    // prettier-ignore
    doc(
      ul(
        li(p('A')),
        li(
          p('B'),
          ul(
            li(p('B1')),
            li(p('{<}B2')),
            li(p('B3')),
          ),
        ),
        li(p('C{>}')),
      ),
    ),
    // Expected Result
    // prettier-ignore
    doc(
      ul(
        li(p('A')),
        li(
          p('B'),
          ul(
            li(
              p('B1'),
              ul(
                li(p('{<}B2')),
                li(p('B3')),
              ),
            ),
            li(p('C{>}')),
          ),
        ),
      ),
    ),
  ];

  const case6: [string, DocumentType, DocumentType] = [
    'range are selecting from a list item with nested list to a sibling list item',
    // Scenario
    // prettier-ignore
    doc(
      ul(
        li(p('A')),
        li(
          p('{<}B'),
          ul(
            li(p('B1')),
            li(p('B2')),
            li(p('B3')),
          ),
        ),
        li(p('C{>}')),
      ),
    ),
    // Expected Result
    // prettier-ignore
    doc(
      ul(
        li(
          p('A'),
          ul(
            li(
              p('{<}B'),
              ul(
                li(p('B1')),
                li(p('B2')),
                li(p('B3')),
              ),
            ),
            li(p('C{>}')),
          ),
        ),
      ),
    ),
  ];

  const case7: [string, DocumentType, DocumentType] = [
    'range are selecting from a list item with nested list to a sibling list item and previous node has nested list',
    // Scenario
    // prettier-ignore
    doc(
      ul(
        li(
          p('A'),
          ul(
            li(p('A1')),
          ),
        ),
        li(
          p('{<}B'),
          ul(
            li(p('B1')),
            li(p('B2')),
            li(p('B3')),
          ),
        ),
        li(p('C{>}')),
      ),
    ),
    // Expected Result
    // prettier-ignore
    doc(
      ul(
        li(
          p('A'),
          ul(
            li(p('A1')),
            li(
              p('{<}B'),
              ul(
                li(p('B1')),
                li(p('B2')),
                li(p('B3')),
              ),
            ),
            li(p('C{>}')),
          ),
        ),
      ),
    ),
  ];

  const case8: [string, DocumentType, DocumentType] = [
    'range are selecting the entire list item with nested list and previous node has nested list',
    // Scenario
    // prettier-ignore
    doc(
      ul(
        li(
          p('A'),
          ul(
            li(p('A1')),
          ),
        ),
        li(
          p('{<}B'),
          ul(
            li(p('B1')),
            li(p('B2')),
            li(p('B3{>}')),
          ),
        ),
        li(p('C')),
      ),
    ),
    // Expected Result
    // prettier-ignore
    doc(
      ul(
        li(
          p('A'),
          ul(
            li(p('A1')),
            li(
              p('{<}B'),
              ul(
                li(p('B1')),
                li(p('B2')),
                li(p('B3{>}')),
              ),
            ),
          ),
        ),
        li(p('C')),
      ),
    ),
  ];

  const case9: [string, DocumentType, DocumentType] = [
    'range are selecting the part of a list item with nested list and previous node has nested list',
    // Scenario
    // prettier-ignore
    doc(
      ul(
        li(
          p('A'),
          ul(
            li(p('A1')),
          ),
        ),
        li(
          p('{<}B'),
          ul(
            li(p('B1')),
            li(p('B2{>}')),
            li(p('B3')),
          ),
        ),
        li(p('C')),
      ),
    ),
    // Expected Result
    // prettier-ignore
    doc(
      ul(
        li(
          p('A'),
          ul(
            li(p('A1')),
            li(
              p('{<}B'),
              ul(
                li(p('B1')),
                li(p('B2{>}')),
              ),
            ),
            li(p('B3')),
          ),
        ),
        li(p('C')),
      ),
    ),
  ];

  const case10: [string, DocumentType, DocumentType] = [
    'cursor selection is in the last list item and and previous node has nested list',
    // Scenario
    // prettier-ignore
    doc(
      ul(
        li(
          p('A'),
          ul(
            li(p('A1')),
          ),
        ),
        li(
          p('B'),
          ul(
            li(p('B1')),
            li(p('B2')),
            li(p('B3')),
          ),
        ),
        li(p('C{<>}')),
      ),
    ),
    // Expected
    // prettier-ignore
    doc(
      ul(
        li(
          p('A'),
          ul(
            li(p('A1')),
          ),
        ),
        li(
          p('B'),
          ul(
            li(p('B1')),
            li(p('B2')),
            li(p('B3')),
            li(p('C{<>}')),
          ),
        ),
      ),
    ),
  ];

  const case11: [string, DocumentType, DocumentType] = [
    'cursor selection is in first list item',
    // Scenario
    // prettier-ignore
    doc(
      ul(
        li(
          p('A{<>}'),
          ul(
            li(p('A1')),
          ),
        ),
        li(
          p('B'),
          ul(
            li(p('B1')),
            li(p('B2')),
            li(p('B3')),
          ),
        ),
        li(p('C')),
      ),
    ),
    // Expected
    // prettier-ignore
    doc(
      ul(
        li(
          p('A{<>}'),
          ul(
            li(p('A1')),
          ),
        ),
        li(
          p('B'),
          ul(
            li(p('B1')),
            li(p('B2')),
            li(p('B3')),
          ),
        ),
        li(p('C')),
      ),
    ),
  ];

  const case12: [string, DocumentType, DocumentType] = [
    'range selection is wrapping two different lists',
    // Scenario
    // prettier-ignore
    doc(
      ul(
        li(
          p('A{<}'),
          ul(
            li(p('A1')),
          ),
        ),
        li(
          p('B'),
          ul(
            li(p('B1')),
            li(p('B2')),
            li(p('B3')),
          ),
        ),
        li(p('C')),
      ),
      p('--------'),
      ul(
        li(
          p('A{>}'),
          ul(
            li(p('A1')),
          ),
        ),
        li(
          p('B'),
          ul(
            li(p('B1')),
            li(p('B2')),
            li(p('B3')),
          ),
        ),
        li(p('C')),
      ),
    ),
    // Expected
    // prettier-ignore
    doc(
      ul(
        li(
          p('A{<}'),
          ul(
            li(p('A1')),
          ),
        ),
        li(
          p('B'),
          ul(
            li(p('B1')),
            li(p('B2')),
            li(p('B3')),
          ),
        ),
        li(p('C')),
      ),
      p('--------'),
      ul(
        li(
          p('A{>}'),
          ul(
            li(p('A1')),
          ),
        ),
        li(
          p('B'),
          ul(
            li(p('B1')),
            li(p('B2')),
            li(p('B3')),
          ),
        ),
        li(p('C')),
      ),
    ),
  ];

  const case13: [string, DocumentType, DocumentType] = [
    'range are selecting the part of a list item with nested list and previous node has deep nested list',
    // Scenario
    // prettier-ignore
    doc(
      ul(
        li(
          p('A'),
          ul(
            li(
              p('A1'),
              ul(li(p('A1.1'))),
            ),
          ),
        ),
        li(
          p('{<}B'),
          ul(
            li(p('B1')),
            li(p('B2{>}')),
            li(p('B3')),
          ),
        ),
        li(p('C')),
      ),
    ),
    // Expected Result
    // prettier-ignore
    doc(
      ul(
        li(
          p('A'),
          ul(
            li(
              p('A1'),
              ul(li(p('A1.1'))),
            ),
            li(
              p('{<}B'),
              ul(
                li(p('B1')),
                li(p('B2{>}')),
              ),
            ),
            li(p('B3')),
          ),
        ),
        li(p('C')),
      ),
    ),
  ];

  const case14: [string, DocumentType, DocumentType] = [
    'cursor selection is at list item with nested list and previous node has nested list',
    // Scenario
    // prettier-ignore
    doc(
      ul(
        li(
          p('A'),
          ul(li(p('A1'))),
        ),
        li(
          p('B{<>}'),
          ul(
            li(p('B1')),
            li(p('B2')),
            li(p('B3')),
          ),
        ),
        li(p('C')),
      ),
    ),
    // Expected Result
    // prettier-ignore
    doc(
      ul(
        li(
          p('A'),
          ul(
            li(p('A1')),
            li(p('B{<>}')),
            li(p('B1')),
            li(p('B2')),
            li(p('B3')),
          ),
        ),
        li(p('C')),
      ),
    ),
  ];

  const case15: [string, DocumentType, DocumentType] = [
    'range selection is coming from an outter list item to a nested list item',
    // Scenario
    // prettier-ignore
    doc(
      ul(
        li(p('A')),
        li(
          p('B'),
          ul(
            li(
              p('B1'),
              ul(
                li(p('X')),
                li(p('Y{<}Y')),
              ),
            ),
            li(p('B2{>}')),
            li(p('B3')),
          ),
        ),
      ),
    ),
    // Expected Result
    // prettier-ignore
    doc(
      ul(
        li(p('A')),
        li(
          p('B'),
          ul(
            li(
              p('B1'),
              ul(
                li(
                  p('X'),
                  ul(
                    li(p('Y{<}Y')),
                  ),
                ),
                li(p('B2{>}')),
              ),
            ),
            li(p('B3')),
          ),
        ),
      ),
    ),
  ];

  const case16: [string, DocumentType, DocumentType] = [
    'cursor is a gapcursor followed by a code block inside of a list item',
    // Scenario
    // prettier-ignore
    doc(
      ul(
        li(p('text')),
        li('{<gap|>}', code_block()('text')),
        li(p('text')),
      ),
    ),
    // Expected Result
    // prettier-ignore
    doc(
      ul(
        li(
          p('text'),
          ul(
            li('{<gap|>}', code_block()('text')),
          ),
        ),
        li(p('text')),
      ),
    ),
  ];

  const case17: [string, DocumentType, DocumentType] = [
    'range selection is coming from a root list item to the middle nested list children',
    // Scenario
    // prettier-ignore
    doc(
      ul(
        li(p('A')),
        li(
          p('{<}B'),
          ul(
            li(
              p('B1'),
              ul(
                li(p('B2{>}')),
                li(p('B3')),
              ),
            ),
          ),
        ),
        li(p('C')),
      ),
    ),
    // Expected Result
    // prettier-ignore
    doc(
      ul(
        li(
          p('A'),
          ul(
            li(
              p('{<}B'),
              ul(
                li(
                  p('B1'),
                  ul(
                    li(p('B2{>}')),
                  ),
                ),
                li(p('B3')),
              ),
            ),
          ),
        ),
        li(p('C')),
      ),
    ),
  ];

  const case18: [string, DocumentType, DocumentType] = [
    'there is a non-visible selection in the range selection coming from a root list item to the middle nested list children',
    // Scenario
    // prettier-ignore
    doc(
      ul(
        li(p('A{<}')),
        li(
          p('B'),
          ul(
            li(
              p('B1'),
              ul(
                li(p('B2')),
                li(p('{>}B3')),
              ),
            ),
          ),
        ),
        li(p('C')),
      ),
    ),
    // Expected Result
    // prettier-ignore
    doc(
      ul(
        li(
          p('A'),
          ul(
            li(
              p('{<}B'),
              ul(
                li(
                  p('B1'),
                  ul(
                    li(p('B2{>}')),
                  ),
                ),
                li(p('B3')),
              ),
            ),
          ),
        ),
        li(p('C')),
      ),
    ),
  ];

  describe.each<[string, DocumentType, DocumentType]>([
    // prettier-ignore
    case0,
    case1,
    case2,
    case3,
    case4,
    case5,
    case6,
    case7,
    case8,
    case9,
    case10,
    case11,
    case12,
    case13,
    case14,
    case15,
    case16,
    case17,
    case18,
  ])('[case%#] when %s', (_scenario, previousDocument, expectedDocument) => {
    it('should match the expected document and keep the selection', () => {
      const myState = createEditorState(previousDocument);
      const { tr } = myState;

      indentListItemsSelected(tr);

      expect(tr).toEqualDocumentAndSelection(expectedDocument(sampleSchema));
    });
  });
});
