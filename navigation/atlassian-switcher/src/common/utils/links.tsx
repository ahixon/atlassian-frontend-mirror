import React from 'react';
import { FormattedMessage as FormattedMessageNamespace } from 'react-intl';
import MarketplaceGlyph from '@atlaskit/icon/glyph/marketplace';
import {
  AtlassianIcon,
  BitbucketIcon,
  ConfluenceIcon,
  JiraSoftwareIcon,
  JiraServiceDeskIcon,
  JiraCoreIcon,
  OpsGenieIcon,
  StatuspageIcon,
  TrelloIcon,
} from '@atlaskit/logo';
import FormattedMessage from '../../ui/primitives/formatted-message';
import {
  RecentContainerType,
  AvailableProductsResponse,
  AvailableProduct,
  SwitcherProductType,
  ProductKey,
  Product,
  ProvisionedProducts,
  CurrentSite,
  CollaborationGraphRecentContainer,
  CollaborationGraphRecentContainerType,
} from '../../types';
import messages from './messages';
import { CustomLink, RecentContainer, SwitcherChildItem } from '../../types';
import WorldIcon from '@atlaskit/icon/glyph/world';
import { createIcon, createImageIcon, IconType } from './icon-themes';
import { getProductDataWithMystiqueFF } from './map-to-switcher-props-with-mystique-ff';

interface MessagesDict {
  [index: string]: FormattedMessageNamespace.MessageDescriptor;
}

export type SwitcherItemType = {
  key: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  Icon: IconType;
  href: string;
  childItems?: SwitcherChildItem[];
  productType?: SwitcherProductType;
  analyticsAttributes?: { [key: string]: string };
};

export type RecentItemType = SwitcherItemType & {
  type: string;
  description: React.ReactNode;
};

export const OBJECT_TYPE_TO_LABEL_MAP: MessagesDict = {
  // pf-activity specific object types. To be removed when pf-activity is deprecated
  'jira-project': messages.jiraProject,
  'confluence-space': messages.confluenceSpace,
  jiraProject: messages.jiraProject,
  confluenceSpace: messages.confluenceSpace,
};

export const getObjectTypeLabel = (type: string): React.ReactNode => {
  return OBJECT_TYPE_TO_LABEL_MAP[type] ? (
    <FormattedMessage {...OBJECT_TYPE_TO_LABEL_MAP[type]} />
  ) : (
    type
  );
};

export type AvailableProductDetails = Pick<
  SwitcherItemType,
  'label' | 'Icon' | 'href' | 'description'
>;

export const AVAILABLE_PRODUCT_DATA_MAP: {
  [productKey in SwitcherProductType]: AvailableProductDetails;
} = {
  [SwitcherProductType.BITBUCKET]: {
    label: 'Bitbucket',
    Icon: createIcon(BitbucketIcon, { size: 'small' }),
    href: '/dashboard/overview',
  },
  [SwitcherProductType.CONFLUENCE]: {
    label: 'Confluence',
    Icon: createIcon(ConfluenceIcon, { size: 'small' }),
    href: '/wiki',
    description: (
      <FormattedMessage {...messages.productDescriptionConfluence} />
    ),
  },
  [SwitcherProductType.JIRA_BUSINESS]: {
    label: 'Jira Core',
    Icon: createIcon(JiraCoreIcon, { size: 'small' }),
    href: '/secure/BrowseProjects.jspa?selectedProjectType=business',
  },
  [SwitcherProductType.JIRA_SOFTWARE]: {
    label: 'Jira Software',
    Icon: createIcon(JiraSoftwareIcon, { size: 'small' }),
    href: '/secure/BrowseProjects.jspa?selectedProjectType=software',
    description: (
      <FormattedMessage {...messages.productDescriptionJiraSoftware} />
    ),
  },
  [SwitcherProductType.JIRA_SERVICE_DESK]: {
    label: 'Jira Service Desk',
    Icon: createIcon(JiraServiceDeskIcon, { size: 'small' }),
    href: '/secure/BrowseProjects.jspa?selectedProjectType=service_desk',
    description: (
      <FormattedMessage {...messages.productDescriptionJiraServiceDesk} />
    ),
  },
  [SwitcherProductType.JIRA_SERVICE_DESK_MYSTIQUE]: {
    label: 'Jira Service Management',
    // TODO: JSM and JSD logos will look the same, but replace with JSM logo when it is available in @atlaskit
    Icon: createIcon(JiraServiceDeskIcon, { size: 'small' }),
    href: '/secure/BrowseProjects.jspa?selectedProjectType=service_desk',
    description: (
      <FormattedMessage
        {...messages.productDescriptionJiraServiceDeskMystique}
      />
    ),
  },
  [SwitcherProductType.DRAGONFRUIT]: {
    label: 'Dragonfruit',
    Icon: createIcon(AtlassianIcon, { size: 'small' }),
    href: '/dragonfruit',
    description: (
      <FormattedMessage {...messages.productDescriptionDragonfruit} />
    ),
  },
  [SwitcherProductType.OPSGENIE]: {
    label: 'Opsgenie',
    Icon: createIcon(OpsGenieIcon, { size: 'small' }),
    href: 'https://app.opsgenie.com',
    description: <FormattedMessage {...messages.productDescriptionOpsgenie} />,
  },
  [SwitcherProductType.STATUSPAGE]: {
    label: 'Statuspage',
    Icon: createIcon(StatuspageIcon, { size: 'small' }),
    href: 'https://statuspage.io',
  },
  [SwitcherProductType.TRELLO]: {
    label: 'Trello',
    Icon: createIcon(TrelloIcon, { size: 'small' }),
    href: 'https://trello.com',
  },
};

export const FREE_EDITION_AVAILABLE_PRODUCT_DATA_MAP: {
  [productKey in SwitcherProductType]: AvailableProductDetails;
} = {
  ...AVAILABLE_PRODUCT_DATA_MAP,
  [SwitcherProductType.CONFLUENCE]: {
    ...AVAILABLE_PRODUCT_DATA_MAP[SwitcherProductType.CONFLUENCE],
    description: (
      <FormattedMessage {...messages.freeEditionProductDescriptionConfluence} />
    ),
  },
  [SwitcherProductType.JIRA_SOFTWARE]: {
    ...AVAILABLE_PRODUCT_DATA_MAP[SwitcherProductType.JIRA_SOFTWARE],
    description: (
      <FormattedMessage
        {...messages.freeEditionProductDescriptionJiraSoftware}
      />
    ),
  },
  [SwitcherProductType.JIRA_SERVICE_DESK]: {
    ...AVAILABLE_PRODUCT_DATA_MAP[SwitcherProductType.JIRA_SERVICE_DESK],
    description: (
      <FormattedMessage
        {...messages.freeEditionProductDescriptionJiraServiceDesk}
      />
    ),
  },
  [SwitcherProductType.JIRA_SERVICE_DESK_MYSTIQUE]: {
    ...AVAILABLE_PRODUCT_DATA_MAP[
      SwitcherProductType.JIRA_SERVICE_DESK_MYSTIQUE
    ],
    description: (
      <FormattedMessage
        {...messages.freeEditionProductDescriptionJiraServiceManagement}
      />
    ),
  },
};

const PRODUCT_ORDER = [
  SwitcherProductType.JIRA_SOFTWARE,
  SwitcherProductType.JIRA_SERVICE_DESK,
  SwitcherProductType.JIRA_BUSINESS,
  SwitcherProductType.CONFLUENCE,
  SwitcherProductType.DRAGONFRUIT,
  SwitcherProductType.OPSGENIE,
  SwitcherProductType.BITBUCKET,
  SwitcherProductType.STATUSPAGE,
  SwitcherProductType.TRELLO,
];

export const BROWSE_APPS_URL: { [Key in Product]?: string | undefined } = {
  [Product.JIRA]: '/plugins/servlet/ac/com.atlassian.jira.emcee/discover',
  [Product.CONFLUENCE]:
    '/wiki/plugins/servlet/ac/com.atlassian.confluence.emcee/discover',
};

export const TO_SWITCHER_PRODUCT_KEY: {
  [Key in ProductKey]: SwitcherProductType;
} = {
  [ProductKey.CONFLUENCE]: SwitcherProductType.CONFLUENCE,
  [ProductKey.JIRA_CORE]: SwitcherProductType.JIRA_BUSINESS,
  [ProductKey.JIRA_SERVICE_DESK]: SwitcherProductType.JIRA_SERVICE_DESK,
  [ProductKey.JIRA_SOFTWARE]: SwitcherProductType.JIRA_SOFTWARE,
  [ProductKey.OPSGENIE]: SwitcherProductType.OPSGENIE,
  [ProductKey.BITBUCKET]: SwitcherProductType.BITBUCKET,
  [ProductKey.STATUSPAGE]: SwitcherProductType.STATUSPAGE,
  [ProductKey.TRELLO]: SwitcherProductType.TRELLO,
  [ProductKey.DRAGONFRUIT]: SwitcherProductType.DRAGONFRUIT,
};

interface ConnectedSite {
  avatar: string | null;
  product: AvailableProduct;
  isCurrentSite: boolean;
  siteName: string;
  siteUrl: string;
}

const getProductSiteUrl = (connectedSite: ConnectedSite): string => {
  const { product, siteUrl } = connectedSite;

  if (
    product.productType === SwitcherProductType.OPSGENIE ||
    product.productType === SwitcherProductType.STATUSPAGE ||
    product.productType === SwitcherProductType.TRELLO
  ) {
    return product.url;
  }

  return siteUrl + AVAILABLE_PRODUCT_DATA_MAP[product.productType].href;
};

const getAvailableProductLinkFromSiteProduct = (
  connectedSites: ConnectedSite[],
  isMystiqueEnabled: boolean,
): SwitcherItemType => {
  const topSite =
    connectedSites.find(site => site.isCurrentSite) ||
    connectedSites.sort((a, b) => a.siteName.localeCompare(b.siteName))[0];
  const productType = topSite.product.productType;
  const productLinkProperties = getProductDataWithMystiqueFF(
    productType,
    isMystiqueEnabled,
  );

  return {
    ...productLinkProperties,
    key: productType + topSite.siteName,
    href: getProductSiteUrl(topSite),
    description: topSite.siteName,
    productType,
    childItems:
      connectedSites.length > 1
        ? connectedSites
            .map(site => ({
              href: getProductSiteUrl(site),
              label: site.siteName,
              avatar: site.avatar,
            }))
            .sort((a, b) => a.label.localeCompare(b.label))
        : [],
  };
};

export const getAvailableProductLinks = (
  availableProducts: AvailableProductsResponse,
  cloudId: string | null | undefined,
  features: {
    isMystiqueEnabled: boolean;
  },
): SwitcherItemType[] => {
  const productsMap: { [key: string]: ConnectedSite[] } = {};
  availableProducts.sites.forEach(site => {
    const { availableProducts, avatar, displayName, url } = site;
    availableProducts.forEach(product => {
      const { productType } = product;

      if (!productsMap[productType]) {
        productsMap[productType] = [];
      }

      productsMap[productType].push({
        product,
        isCurrentSite: Boolean(cloudId) && site.cloudId === cloudId,
        siteName: displayName,
        siteUrl: url,
        avatar,
      });
    });
  });

  return PRODUCT_ORDER.map(productType => {
    const connectedSites = productsMap[productType];
    return (
      connectedSites &&
      getAvailableProductLinkFromSiteProduct(
        connectedSites,
        features.isMystiqueEnabled,
      )
    );
  }).filter(link => !!link);
};

export const getEmceeLink = (
  product?: Product,
): SwitcherItemType | undefined => {
  const emceeLink = product && BROWSE_APPS_URL[product];

  if (emceeLink) {
    return {
      key: 'browse-apps',
      label: <FormattedMessage {...messages.browseApps} />,
      Icon: createIcon(MarketplaceGlyph, { size: 'medium' }),
      href: `${emceeLink}#!/discover?source=app_switcher`,
    };
  }
};

export const getProvisionedProducts = (
  availableProducts: AvailableProductsResponse,
): ProvisionedProducts => {
  const provisionedProducts = {} as ProvisionedProducts;
  availableProducts.sites.forEach(site =>
    site.availableProducts.forEach(
      product => (provisionedProducts[product.productType] = true),
    ),
  );
  return provisionedProducts;
};

export const getCustomLinkItems = (
  list: Array<CustomLink>,
  currentSite: CurrentSite,
): SwitcherItemType[] => {
  const defaultProductCustomLinks = [
    `${currentSite.url}/secure/MyJiraHome.jspa`,
    `${currentSite.url}/wiki/`,
  ];
  return list
    .filter(
      customLink => defaultProductCustomLinks.indexOf(customLink.link) === -1,
    )
    .map(customLink => ({
      key: customLink.key,
      label: customLink.label,
      Icon: createIcon(WorldIcon),
      href: customLink.link,
      analyticsAttributes: {
        linkType: customLink.local ? 'customLink' : 'applink',
      },
    }));
};

export const getRecentLinkItems = (
  list: Array<RecentContainer>,
  currentSite: CurrentSite,
): RecentItemType[] => {
  const isAnyJiraProductActive = Boolean(
    currentSite.products.find(
      product =>
        product.productType === SwitcherProductType.JIRA_BUSINESS ||
        product.productType === SwitcherProductType.JIRA_SERVICE_DESK ||
        product.productType === SwitcherProductType.JIRA_SOFTWARE,
    ),
  );
  const isConfluenceActive = Boolean(
    currentSite.products.find(
      product => product.productType === SwitcherProductType.CONFLUENCE,
    ),
  );
  return list
    .filter((recent: RecentContainer) => {
      return (
        (recent.type === RecentContainerType.JIRA_PROJECT &&
          isAnyJiraProductActive) ||
        (recent.type === RecentContainerType.CONFLUENCE_SPACE &&
          isConfluenceActive) ||
        [
          RecentContainerType.JIRA_PROJECT,
          RecentContainerType.CONFLUENCE_SPACE,
        ].indexOf(recent.type) === -1
      );
    })
    .slice(0, 6)
    .map(recentLink => ({
      key: recentLink.objectId,
      label: recentLink.name,
      Icon: createImageIcon(recentLink.iconUrl),
      href: recentLink.url,
      type: recentLink.type,
      description: getObjectTypeLabel(recentLink.type),
    }));
};

export const getRecentLinkItemsCollaborationGraph = (
  list: Array<CollaborationGraphRecentContainer>,
  currentSite: CurrentSite,
): RecentItemType[] => {
  const isAnyJiraProductActive = Boolean(
    currentSite.products.find(
      product =>
        product.productType === SwitcherProductType.JIRA_BUSINESS ||
        product.productType === SwitcherProductType.JIRA_SERVICE_DESK ||
        product.productType === SwitcherProductType.JIRA_SOFTWARE,
    ),
  );
  const isConfluenceActive = Boolean(
    currentSite.products.find(
      product => product.productType === SwitcherProductType.CONFLUENCE,
    ),
  );

  return list
    .filter((recent: CollaborationGraphRecentContainer) => {
      return (
        (recent.containerType ===
          CollaborationGraphRecentContainerType.JIRA_PROJECT &&
          isAnyJiraProductActive) ||
        (recent.containerType ===
          CollaborationGraphRecentContainerType.CONFLUENCE_SPACE &&
          isConfluenceActive) ||
        [
          CollaborationGraphRecentContainerType.JIRA_PROJECT.toString(),
          CollaborationGraphRecentContainerType.CONFLUENCE_SPACE.toString(),
        ].indexOf(recent.containerType) === -1
      );
    })
    .slice(0, 6)
    .map(recentLink => ({
      key: recentLink.id,
      label: recentLink.containerDetails.name,
      Icon: createImageIcon(recentLink.containerDetails.iconUrl),
      href: recentLink.containerDetails.url,
      type: recentLink.containerType,
      description: getObjectTypeLabel(recentLink.containerType),
    }));
};
