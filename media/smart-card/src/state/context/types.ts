import { Store } from 'redux';
import { CardStore, CardConnections } from '../store/types';
import { CardPlatform } from '../../view/Card';
import CardClient from '../../client';
import { LinkPreview } from '../../extractors/common/preview/extractPreview';

// TODO: Remove once mobile team move to using authentication
// flow https://product-fabric.atlassian.net/browse/SL-347.
export interface CardAuthFlowOpts {
  authFlow?: 'oauth2' | 'disabled';
}

export interface CardContext {
  store: Store<CardStore>;
  prefetchStore: Record<string, boolean>;
  connections: CardConnections;
  config: CardProviderCacheOpts & CardAuthFlowOpts;
  extractors: {
    getPreview: (
      url: string,
      platform?: CardPlatform,
    ) => LinkPreview | undefined;
  };
}

export interface CardProviderCacheOpts {
  maxAge: number;
  maxLoadingDelay: number;
}

export interface CardProviderStoreOpts {
  initialState: CardStore;
}

export type CardProviderProps = {
  client?: CardClient;
  cacheOptions?: CardProviderCacheOpts;
  storeOptions?: CardProviderStoreOpts;
  children: React.ReactNode;
} & CardAuthFlowOpts;
