export type CardStatus =
  | 'uploading'
  | 'loading'
  | 'processing'
  | 'loading-preview'
  | 'complete'
  | 'error'
  | 'failed-processing';

export type FilePreviewStatus = {
  hasFilesize: boolean;
  isPreviewable: boolean;
  hasPreview: boolean;
  isSupportedByBrowser: boolean;
};

export type CardAppearance = 'auto' | 'image' | 'square' | 'horizontal';

export declare type CardDimensionValue = number | string;

export type CardPreviewSource =
  | 'local'
  | 'remote'
  | 'ssr-server'
  | 'ssr-client'
  | 'cache-local'
  | 'cache-remote'
  | 'cache-ssr-client'
  | 'cache-ssr-server'
  | 'external';

export interface CardPreview {
  dataURI: string;
  orientation?: number;
  source: CardPreviewSource;
}
