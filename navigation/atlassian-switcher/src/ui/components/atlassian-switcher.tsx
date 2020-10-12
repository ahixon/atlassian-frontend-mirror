import React from 'react';
import ErrorBoundary from './error-boundary';
import { Product, AtlassianSwitcherProps } from '../../types';
import IntlProvider from './intl-provider';
import {
  analyticsAttributes,
  NavigationAnalyticsContext,
  SWITCHER_COMPONENT,
  SWITCHER_SOURCE,
} from '../../common/utils/analytics';
import packageContext from '../../common/utils/package-context';
import mapPropsToFeatures from '../../common/utils/map-props-to-features';

import {
  JiraSwitcherLoader,
  ConfluenceSwitcherLoader,
  GenericSwitcherLoader,
  TrelloSwitcherLoader,
} from './loaders';

const getAnalyticsContext = (attributes: object) => ({
  source: SWITCHER_SOURCE,
  componentName: SWITCHER_COMPONENT,
  ...packageContext,
  ...analyticsAttributes(attributes),
});

const defaultProps: Partial<AtlassianSwitcherProps> = {
  appearance: 'drawer',
};

const AtlassianSwitcher = (rawProps: AtlassianSwitcherProps) => {
  const props = Object.assign({}, defaultProps, rawProps);
  const { product, appearance } = props;

  let Switcher: React.ElementType;
  switch (product) {
    case Product.JIRA:
      Switcher = JiraSwitcherLoader;
      break;
    case Product.CONFLUENCE:
      Switcher = ConfluenceSwitcherLoader;
      break;
    case Product.TRELLO:
      Switcher = TrelloSwitcherLoader;
      break;
    default:
      Switcher = GenericSwitcherLoader;
  }

  const features = mapPropsToFeatures(props);

  return (
    <IntlProvider>
      <NavigationAnalyticsContext
        data={getAnalyticsContext({ featureFlags: features })}
      >
        <ErrorBoundary appearance={appearance} product={product as Product}>
          <Switcher {...props} features={features} />
        </ErrorBoundary>
      </NavigationAnalyticsContext>
    </IntlProvider>
  );
};

export default AtlassianSwitcher;
