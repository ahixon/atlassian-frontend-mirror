import scrubAdf from '../../../scrub/scrub-adf';

describe('scrubAdf', () => {
  it('should replace text in nodes with dummy text of the same length', () => {
    const adf = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Boooo',
            },
          ],
        },
      ],
    };

    const scrubbedAdf = scrubAdf(adf);

    expect(scrubbedAdf).toEqual({
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Lorem',
            },
          ],
        },
      ],
    });
  });

  it('should replace link marks in nodes', () => {
    const adf = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'atlassian',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'https://www.atlassian.com',
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const scrubbedAdf = scrubAdf(adf);

    expect(scrubbedAdf).toEqual({
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'loremipsu',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'https://www.google.com',
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('should replace attributes values in nodes with dummy values of the same length', () => {
    const adf = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'status',
              attrs: {
                text: 'DONE',
                localId: 'e6764f45-4d69-49f8-9e0a-3a83fb9c0db7',
              },
            },
          ],
        },
      ],
    };

    const scrubbedAdf = scrubAdf(adf);

    expect(scrubbedAdf).toEqual({
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'status',
              attrs: {
                text: 'LORE',
                localId: 'l7435o18-2r43-91e0-7m3i-1p02su3m9do0',
              },
            },
          ],
        },
      ],
    });
  });

  it('should replace unknown attributes values in nodes with dummy values of the same length', () => {
    const adf = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'unknown',
          content: [
            {
              type: 'unknown',
              attrs: {
                text: 'some text',
                unknownAttr: 'some value',
              },
            },
          ],
        },
      ],
    };

    const scrubbedAdf = scrubAdf(adf);

    expect(scrubbedAdf).toEqual({
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'unknown',
          content: [
            {
              type: 'unknown',
              attrs: {
                text: 'lore mips',
                unknownAttr: 'lore mipsu',
              },
            },
          ],
        },
      ],
    });
  });

  it('should throw an error if attrs is not an object', () => {
    const adf = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'status',
              attrs: [],
            },
          ],
        },
      ],
    };

    expect(() => {
      scrubAdf(adf);
    }).toThrowError(/scrubAttrs: encountered unsupported attributes type/);
  });

  it('should replace nested attributes values in nodes with dummy values of the same length', () => {
    const adf = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'extension',
          attrs: {
            parameters: {
              extensionId: 'e6764f45-4d69-49f8-9e0a-3a83fb9c0db7',
              localId: '0',
              text: 'Extension',
              macroMetadata: {
                macroId: {
                  value: 1598252695991,
                },
                schemaVersion: {
                  value: '2',
                },
              },
            },
          },
        },
      ],
    };

    const scrubbedAdf = scrubAdf(adf);

    expect(scrubbedAdf).toEqual({
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'extension',
          attrs: {
            parameters: {
              extensionId: 'l7435o18-2r43-91e0-7m3i-1p02su3m9do0',
              localId: '2',
              text: 'Loremipsu',
              macroMetadata: {
                macroId: {
                  value: 2743591802743,
                },
                schemaVersion: {
                  value: '2',
                },
              },
            },
          },
        },
      ],
    });
  });

  it('should replace emoji nodes', () => {
    const adf = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'emoji',
          attrs: {
            shortName: ':rocket:',
            id: '1f680',
            text: '🚀',
          },
        },
      ],
    };

    const scrubbedAdf = scrubAdf(adf);

    expect(scrubbedAdf).toEqual({
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'emoji',
          attrs: {
            id: '123',
            text: '😀',
            shortName: ':grinning:',
          },
        },
      ],
    });
  });

  it('should not replace any attributes from the ignored list', () => {
    const adf = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'status',
              attrs: {
                color: 'green',
                style: 'bold',
              },
            },
          ],
        },
        {
          type: 'codeBlock',
          attrs: {
            language: 'javascript',
          },
        },
        {
          type: 'panel',
          attrs: {
            panelType: 'success',
          },
        },
        {
          type: 'heading',
          attrs: {
            level: 5,
          },
        },
        {
          type: 'embedCard',
          attrs: {
            originalHeight: 1874,
            originalWidth: 1078,
          },
        },
        {
          type: 'extension',
          attrs: {
            extensionType: 'confluence.macro',
            extensionKey: 'awesome:item',
            parameters: {},
          },
        },
        {
          type: 'orderedList',
          attrs: { order: 1 },
        },
        {
          type: 'decisionItem',
          attrs: {
            state: 'DECIDED',
          },
        },
        {
          type: 'mediaSingle',
          attrs: {
            layout: 'center',
          },
          content: [
            {
              type: 'media',
              attrs: {
                width: 1874,
                height: 1078,
                __fileSize: 123456,
                __fileMimeType: 'image/jpeg',
              },
            },
            {
              type: 'table',
              content: [
                {
                  type: 'tableRow',
                  content: [
                    {
                      type: 'tableHeader',
                      attrs: {
                        colspan: 2,
                        colwidth: [233, 100],
                      },
                    },
                    {
                      type: 'tableHeader',
                      attrs: {
                        background: '#DEEBFF',
                      },
                    },
                  ],
                },
                {
                  type: 'tableRow',
                  content: [
                    {
                      type: 'tableCell',
                      attrs: {
                        colspan: 1,
                        rowspan: 1,
                        background: null,
                      },
                    },
                    {
                      type: 'tableCell',
                    },
                    {
                      type: 'tableCell',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const scrubbedAdf = scrubAdf(adf);

    expect(scrubbedAdf).toEqual(adf);
  });
});
