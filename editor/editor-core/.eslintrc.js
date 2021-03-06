module.exports = {
  overrides: [
    {
      // Temporary override to apply tokens lint rules to a subset of editor packages
      // TODO remove in https://product-fabric.atlassian.net/browse/DSP-4001
      files: [
        './src/keymaps/index.tsx',
        './src/labs/next/full-page.tsx',
        './src/plugins/alignment/**/*',
        './src/plugins/block-type/**/*',
        './src/plugins/breakout/**/*',
        './src/plugins/card/**/*',
        './src/plugins/code-block/**/*',
        './src/plugins/collab-edit/**/*',
        './src/plugins/date/**/*',
        './src/plugins/emoji/**/*',
        './src/plugins/expand/**/*',
        './src/plugins/extension/**/*',
        './src/plugins/fake-text-cursor/**/*',
        './src/plugins/find-replace/**/*',
        './src/plugins/floating-toolbar/**/*',
        './src/plugins/grid/**/*',
        './src/plugins/help-dialog/**/*',
        './src/plugins/hyperlink/**/*',
        './src/plugins/jira-issue/**/*',
        './src/plugins/layout/**/*',
        './src/plugins/media/**/*',
        './src/plugins/mentions/**/*',
        './src/plugins/panel/**/*',
        './src/plugins/placeholder-text/**/*',
        './src/plugins/placeholder/**/*',
        './src/plugins/status/**/*',
        './src/plugins/table/**/*',
        './src/plugins/type-ahead/**/*',
        './src/ui/Addon/**/*',
        './src/ui/Appearance/**/*',
        './src/ui/ChromeCollapsed/**/*',
        './src/ui/ConfigPanel/**/*',
        './src/ui/ContentStyles/**/*',
        './src/ui/ContextPanel/**/*',
        './src/ui/DropdownMenu/**/*',
        './src/ui/ElementBrowser/**/*',
        './src/ui/ElementBrowser/**/*',
        './src/ui/FloatingToolbar/**/*',
        './src/ui/LinkSearch/**/*',
        './src/ui/PanelTextInput/**/*',
        './src/ui/Separator/**/*',
        './src/ui/styles.ts',
        './src/ui/ToolbarFeedback/**/*',
        './src/ui/WithFlash/**/*',
      ],
      rules: {
        '@atlaskit/design-system/ensure-design-token-usage': [
          'error',
          { shouldEnforceFallbacks: true },
        ],
        '@atlaskit/design-system/no-unsafe-design-token-usage': [
          'error',
          { shouldEnforceFallbacks: true },
        ],
        '@atlaskit/design-system/no-deprecated-design-token-usage': ['warn'],
      },
    },
  ],
};
