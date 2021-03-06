import { css } from '@emotion/react';

export const blockMarksSharedStyles = css`
  /**
   * We need to remove margin-top from first item
   * inside doc, tableCell, tableHeader, blockquote, etc.
   */
  *:not(.fabric-editor-block-mark) >,
  /* For nested block marks */
  *:not(.fabric-editor-block-mark) > div.fabric-editor-block-mark:first-of-type {
    p,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    .heading-wrapper {
      :first-child:not(style),
      style:first-child + * {
        margin-top: 0;
      }
    }
  }
`;
