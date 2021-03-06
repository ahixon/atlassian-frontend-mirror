# @atlaskit/icon-priority

## 6.3.1

### Patch Changes

- [`b3e5a62a9e3`](https://bitbucket.org/atlassian/atlassian-frontend/commits/b3e5a62a9e3) - Adds `static` techstack to package, enforcing stricter style linting. In this case the package already satisfied this requirement so there have been no changes to styles.

## 6.3.0

### Minor Changes

- [`93d6f8856f2`](https://bitbucket.org/atlassian/atlassian-frontend/commits/93d6f8856f2) - @atlaskit/icon-priority has been deprecated due to low usage. It will be deleted after 9 May 2022. If you rely on these icons, @atlaskit/icon-priority will still be available as a deprecated package on NPM, but we recommend self-hosting and managing.

## 6.2.5

### Patch Changes

- [`378d1cef00f`](https://bitbucket.org/atlassian/atlassian-frontend/commits/378d1cef00f) - Bump `@atlaskit/theme` to version `^11.3.0`.

## 6.2.4

### Patch Changes

- [`df2bb5891ef`](https://bitbucket.org/atlassian/atlassian-frontend/commits/df2bb5891ef) - Use named export of base icon in all icon-\* glyphs

## 6.2.3

### Patch Changes

- [`72ef8bafec9`](https://bitbucket.org/atlassian/atlassian-frontend/commits/72ef8bafec9) - Add "./glyph" entry point.

## 6.2.2

### Patch Changes

- [`877e9e0b9f6`](https://bitbucket.org/atlassian/atlassian-frontend/commits/877e9e0b9f6) - Icon package dependency now uses carat range.

## 6.2.1

### Patch Changes

- [`469f36d9629`](https://bitbucket.org/atlassian/atlassian-frontend/commits/469f36d9629) - Icon build tooling has been updated.
- [`3de10e7652e`](https://bitbucket.org/atlassian/atlassian-frontend/commits/3de10e7652e) - Documentation updates and fixes to types for all icon packages.
- [`d98f1bb1169`](https://bitbucket.org/atlassian/atlassian-frontend/commits/d98f1bb1169) - Local build tooling improvements.
- [`3f36b048938`](https://bitbucket.org/atlassian/atlassian-frontend/commits/3f36b048938) - The color props have been removed from the TypeScript type definitions. The behavior has never worked with the glyphs but was included in the type definitions incorrectly.
- Updated dependencies

## 6.2.0

### Minor Changes

- [`d7a5826fd09`](https://bitbucket.org/atlassian/atlassian-frontend/commits/d7a5826fd09) - Icon priority now utilises the base icon from `@atlaskit/icon`.
- [`6a64d27e250`](https://bitbucket.org/atlassian/atlassian-frontend/commits/6a64d27e250) - Icon priority now ships with cjs, esm, and es2019 bundles for for exported components and utils. Glyphs unfortunately aren't included and still only export cjs bundles.

### Patch Changes

- [`79c23df6340`](https://bitbucket.org/atlassian/atlassian-frontend/commits/79c23df6340) - Use injected package name and version for analytics instead of version.json.
- [`f922302ad53`](https://bitbucket.org/atlassian/atlassian-frontend/commits/f922302ad53) - Icons no longer ship with the `focusable` attribute in their glyph exports. This attribute was only required for IE11 support. This is purely a build change and has no effect on user API.
- Updated dependencies

## 6.1.4

### Patch Changes

- [`0741b1556f6`](https://bitbucket.org/atlassian/atlassian-frontend/commits/0741b1556f6) - All icon glpyhs are now built without inline extends helpers, reducing their bundlesize.
- [`8d6c79b9055`](https://bitbucket.org/atlassian/atlassian-frontend/commits/8d6c79b9055) - Typedefs of glyphs have been updated to reflect an API change that occured in version 15. For context, `onClick` was removed as a functional prop but it was still supported by the types. This may have resulted in a confusing developer experience although the fundamental behaviour has been consistent since version 15.

## 6.1.3

### Patch Changes

- [`b9f0d16300`](https://bitbucket.org/atlassian/atlassian-frontend/commits/b9f0d16300) - Re-generated icons using a newer version of the build process

## 6.1.2

### Patch Changes

- [`c65f28c058`](https://bitbucket.org/atlassian/atlassian-frontend/commits/c65f28c058) - Change codemod to return raw source if it is not transforming a file.

  Otherwise it would run prettier which can lead to some invalid syntax outputted
  in edge cases. This is likely due to an issue in either `codemod-cli` or `jscodeshift`.

## 6.1.1

### Patch Changes

- [`8990bf36a9`](https://bitbucket.org/atlassian/atlassian-frontend/commits/8990bf36a9) - Add a missing codemod for the entrypoint change in 6.1.0

  ***

  **Running the codemod cli**

  To run the codemod: **You first need to have the latest version installed before you can run the codemod**

  `yarn upgrade @atlaskit/PACKAGE@^VERSION`

  Once upgraded, use the Atlaskit codemod-cli;

  `npx @atlaskit/codemod-cli --parser [PARSER] --extensions [FILE_EXTENSIONS] [TARGET_PATH]`

  Or run `npx @atlaskit/codemod-cli -h` for more details on usage.
  For Atlassians, refer to [this doc](https://developer.atlassian.com/cloud/framework/atlassian-frontend/codemods/01-atlassian-codemods/) for more details on the codemod CLI.

## 6.1.0

### Minor Changes

- [`fbdf356800`](https://bitbucket.org/atlassian/atlassian-frontend/commits/fbdf356800) - Remove undocumented metadata export from main entry point. To import metadata instead do it from the /metadata entrypoint.

## 6.0.5

### Patch Changes

- Updated dependencies

## 6.0.4

### Patch Changes

- [`d6ff4c7dce`](https://bitbucket.org/atlassian/atlassian-frontend/commits/d6ff4c7dce) - Removes unused (and incorrect) es2019 key in package.json

## 6.0.3

### Patch Changes

- [`f51e6ff443`](https://bitbucket.org/atlassian/atlassian-frontend/commits/f51e6ff443) - License updated to Apache 2.0 (previously under the ADG license)

## 6.0.2

### Patch Changes

- [`6c525a8229`](https://bitbucket.org/atlassian/atlassian-frontend/commits/6c525a8229) - Upgraded to TypeScript 3.9.6 and tslib to 2.0.0

  Since tslib is a dependency for all our packages we recommend that products also follow this tslib upgrade
  to prevent duplicates of tslib being bundled.

## 6.0.1

### Patch Changes

- [`db053b24d8`](https://bitbucket.org/atlassian/atlassian-frontend/commits/db053b24d8) - Update all the theme imports to be tree-shakable

## 6.0.0

### Major Changes

- [`87f4720f27`](https://bitbucket.org/atlassian/atlassian-frontend/commits/87f4720f27) - Officially dropping IE11 support, from this version onwards there are no warranties of the package working in IE11.
  For more information see: https://community.developer.atlassian.com/t/atlaskit-to-drop-support-for-internet-explorer-11-from-1st-july-2020/39534

### Patch Changes

- Updated dependencies

## 5.0.3

### Patch Changes

- [patch][fd5292fd5a](https://bitbucket.org/atlassian/atlassian-frontend/commits/fd5292fd5a):

  Corrects accessibility behavior for wrapping span. It now will now:

  - conditionally set the `aria-label` if `label` is defined
  - conditionally set the `role` to either `img` if `label` is defined, or `presentation` if it is not defined- Updated dependencies [66dcced7a0](https://bitbucket.org/atlassian/atlassian-frontend/commits/66dcced7a0):

- Updated dependencies [eea5e9bd8c](https://bitbucket.org/atlassian/atlassian-frontend/commits/eea5e9bd8c):
  - @atlaskit/docs@8.4.0
  - @atlaskit/button@13.3.9
  - @atlaskit/modal-dialog@10.5.4
  - @atlaskit/textfield@3.1.9
  - @atlaskit/tooltip@15.2.5

## 5.0.2

### Patch Changes

- [patch][6548261c9a](https://bitbucket.org/atlassian/atlassian-frontend/commits/6548261c9a):

  Remove namespace imports from React, ReactDom, and PropTypes- Updated dependencies [6548261c9a](https://bitbucket.org/atlassian/atlassian-frontend/commits/6548261c9a):

  - @atlaskit/docs@8.3.2
  - @atlaskit/button@13.3.7
  - @atlaskit/modal-dialog@10.5.2
  - @atlaskit/textfield@3.1.6
  - @atlaskit/theme@9.5.1
  - @atlaskit/tooltip@15.2.3

## 5.0.1

### Patch Changes

- [patch][f9b5e24662](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/f9b5e24662):

  @atlaskit/icon-file-type and @atlaskit/icon-object have been converted to TypeScript to provide static typing. Flow types are no longer provided. No API or bahavioural changes.

## 5.0.0

### Major Changes

- [major][3c7bee089a](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/3c7bee089a):

  @atlaskit/icon-priority has been converted to TypeScript to provide static typing. Flow types are no longer provided. No API or bahavioural changes.

## 4.0.9

### Patch Changes

- [patch][4dd459fc56](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/4dd459fc56):

  Dependency 'uuid' is unused in package.jon.

## 4.0.8

### Patch Changes

- [patch][097b696613](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/097b696613):

  Components now depend on TS 3.6 internally, in order to fix an issue with TS resolving non-relative imports as relative imports

## 4.0.7

### Patch Changes

- [patch][ecca4d1dbb](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/ecca4d1dbb):

  Upgraded Typescript to 3.3.x

## 4.0.6

### Patch Changes

- [patch][708028db86](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/708028db86):

  Change all the imports to theme in Core to use multi entry points

## 4.0.5

### Patch Changes

- [patch][de35ce8c67](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/de35ce8c67):

  Updates component maintainers

## 4.0.4

### Patch Changes

- [patch][4615439434](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/4615439434):

  index.ts will now be ignored when publishing to npm

## 4.0.3

- Updated dependencies [67f06f58dd](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/67f06f58dd):
  - @atlaskit/tooltip@15.0.0

## 4.0.2

- [patch][b0ef06c685](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/b0ef06c685):

  - This is just a safety release in case anything strange happened in in the previous one. See Pull Request #5942 for details

## 4.0.1

- Updated dependencies [06c5cccf9d](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/06c5cccf9d):
  - @atlaskit/modal-dialog@10.0.0

## 4.0.0

- [major][7c17b35107](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/7c17b35107):

  - Updates react and react-dom peer dependencies to react@^16.8.0 and react-dom@^16.8.0. To use this package, please ensure you use at least this version of react and react-dom.

## 3.0.5

- Updated dependencies [9c0b4744be](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/9c0b4744be):
  - @atlaskit/docs@7.0.3
  - @atlaskit/button@12.0.3
  - @atlaskit/field-text@8.0.3
  - @atlaskit/modal-dialog@8.0.7
  - @atlaskit/tooltip@13.0.4
  - @atlaskit/theme@8.1.7

## 3.0.4

- Updated dependencies [1e826b2966](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/1e826b2966):
  - @atlaskit/docs@7.0.2
  - @atlaskit/field-text@8.0.2
  - @atlaskit/modal-dialog@8.0.6
  - @atlaskit/theme@8.1.6
  - @atlaskit/tooltip@13.0.3
  - @atlaskit/button@12.0.0

## 3.0.3

- [patch][98e11001ff](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/98e11001ff):

  - Removes duplicate babel-runtime dependency

## 3.0.2

- Updated dependencies [9d5cc39394](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/9d5cc39394):
  - @atlaskit/docs@7.0.1
  - @atlaskit/field-text@8.0.1
  - @atlaskit/modal-dialog@8.0.2
  - @atlaskit/theme@8.0.1
  - @atlaskit/tooltip@13.0.1
  - @atlaskit/button@11.0.0

## 3.0.1

- Updated dependencies [76299208e6](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/76299208e6):
  - @atlaskit/button@10.1.3
  - @atlaskit/docs@7.0.0
  - @atlaskit/field-text@8.0.0
  - @atlaskit/modal-dialog@8.0.0
  - @atlaskit/theme@8.0.0
  - @atlaskit/tooltip@13.0.0

## 3.0.0

- [major][ecf21be58f](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/ecf21be58f):

  - Update the size of blocker and trivial icon to 20px from 18px.

## 2.0.0

- [major][a2653f4453](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/a2653f4453):

  - Update the export name for blocker icon to priority-blocker from priotity-blocker

## 1.0.0

- [major][d0333acfba](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/d0333acfba):

  - First release of the priority icons package
