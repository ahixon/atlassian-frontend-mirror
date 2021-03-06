import React, { FunctionComponent } from 'react';

import { lazyForPaint, LazySuspense } from 'react-loosely-lazy';

import Spinner from '@atlaskit/spinner';

import { ShareFormWrapper } from '../ShareFormWrapper';

import type { LazyShareFormProps } from './LazyShareForm';
import { SpinnerWrapper } from './styled';

const LazyShareFormLazy = lazyForPaint<FunctionComponent<LazyShareFormProps>>(
  () =>
    import(
      /* webpackChunkName: "@atlaskit-internal_share-form" */
      './LazyShareForm'
    ),
  { ssr: false },
);

const LoadingDialog = ({
  shareFormTitle,
  showTitle,
}: Pick<LazyShareFormProps, 'shareFormTitle' | 'showTitle'>) => (
  <ShareFormWrapper
    shareFormTitle={shareFormTitle}
    // if `showTitle` is passed, we use it. Otherwise, we will show title for loading dialog.
    shouldShowTitle={typeof showTitle === 'boolean' ? showTitle : true}
  >
    <SpinnerWrapper>
      <Spinner />
    </SpinnerWrapper>
  </ShareFormWrapper>
);

export default (props: LazyShareFormProps) => (
  <LazySuspense
    fallback={
      <LoadingDialog
        shareFormTitle={props.shareFormTitle}
        showTitle={props.showTitle}
      />
    }
  >
    <LazyShareFormLazy {...props} />
  </LazySuspense>
);
