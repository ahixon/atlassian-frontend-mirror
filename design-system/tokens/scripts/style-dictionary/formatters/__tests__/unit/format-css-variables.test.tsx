import { CSS_PREFIX } from '../../../../../src/constants';
import { cssVariableFormatter as formatter } from '../../format-css-variables';

describe('formatter', () => {
  it('should parse token', () => {
    const result = formatter({
      dictionary: {
        allTokens: [
          {
            name: 'brand',
            value: '#ffffff',
            path: ['color', 'brand'],
            attributes: { group: 'paint' },
          },
        ],
      },
      options: {
        themeName: 'atlassian-dark',
      },
    } as any)
      .split('html')
      .pop();

    expect(result).toEqual(`[data-theme="dark"] {
  --${CSS_PREFIX}-brand: #ffffff;
}
`);
  });

  it('should preserve camelCase tokens', () => {
    const result = formatter({
      dictionary: {
        allTokens: [
          {
            name: 'colorAccent',
            value: '#ffffff',
            path: ['color', 'colorAccent'],
            attributes: { group: 'paint' },
          },
        ],
      },
      options: {
        themeName: 'atlassian-dark',
      },
    } as any)
      .split('html')
      .pop();

    expect(result).toEqual(`[data-theme="dark"] {
  --${CSS_PREFIX}-colorAccent: #ffffff;
}
`);
  });

  it('should omit palette tokens', () => {
    const result = formatter({
      dictionary: {
        allTokens: [
          {
            name: 'B900',
            value: '#ffffff',
            path: ['color', 'B900'],
            attributes: {
              group: 'palette',
            },
          },
        ],
      },
      options: {
        themeName: 'atlassian-dark',
      },
    } as any)
      .split('html')
      .pop();

    expect(result).toEqual('[data-theme="dark"] {\n}\n');
  });

  it('should parse nested token', () => {
    const result = formatter({
      dictionary: {
        allTokens: [
          {
            name: 'accent',
            value: '#ffffff',
            path: ['color', 'accent'],
            attributes: { group: 'paint' },
          },
        ],
      },
      options: {
        themeName: 'atlassian-dark',
      },
    } as any)
      .split('html')
      .pop();

    expect(result).toEqual(`[data-theme="dark"] {
  --${CSS_PREFIX}-accent: #ffffff;
}
`);
  });

  it('should parse deeply nested token', () => {
    const result = formatter({
      dictionary: {
        allTokens: [
          {
            name: 'brand',
            value: '#ffffff',
            path: ['color', 'accent', 'brand'],
            attributes: { group: 'paint' },
          },
        ],
      },
      options: {
        themeName: 'atlassian-dark',
      },
    } as any)
      .split('html')
      .pop();

    expect(result).toEqual(`[data-theme="dark"] {
  --${CSS_PREFIX}-accent-brand: #ffffff;
}
`);
  });

  it('should omit [default] keywords in token paths', () => {
    const result = formatter({
      dictionary: {
        allTokens: [
          {
            name: '[default]',
            value: '#ffffff',
            path: ['color', 'background', 'brand', '[default]'],
            attributes: {
              group: 'paint',
            },
          },
        ],
      },
      options: {
        themeName: 'atlassian-dark',
      },
    } as any)
      .split('html')
      .pop();

    expect(result).toEqual(`[data-theme="dark"] {
  --${CSS_PREFIX}-background-brand: #ffffff;
}
`);
  });

  it('should omit nested [default] keywords in token paths', () => {
    const result = formatter({
      dictionary: {
        allTokens: [
          {
            name: '[default]',
            value: '#ffffff',
            path: ['color', 'background', 'brand', '[default]', '[default]'],
            attributes: {
              group: 'paint',
            },
          },
        ],
      },
      options: {
        themeName: 'atlassian-dark',
      },
    } as any)
      .split('html')
      .pop();

    expect(result).toEqual(`[data-theme="dark"] {
  --${CSS_PREFIX}-background-brand: #ffffff;
}
`);
  });

  it('should omit nested [default] keywords in the middle of token paths', () => {
    const result = formatter({
      dictionary: {
        allTokens: [
          {
            name: '[default]',
            value: '#ffffff',
            path: [
              'color',
              'background',
              'brand',
              '[default]',
              '[default]',
              'pressed',
            ],
            attributes: {
              group: 'paint',
            },
          },
        ],
      },
      options: {
        themeName: 'atlassian-dark',
      },
    } as any)
      .split('html')
      .pop();

    expect(result).toEqual(`[data-theme="dark"] {
  --${CSS_PREFIX}-background-brand-pressed: #ffffff;
}
`);
  });
});
