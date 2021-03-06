import { JsonLd } from 'json-ld-types';
import { CardProviderRenderers } from '@atlaskit/link-provider';
import { FlexibleUiDataContext } from '../../state/flexible-ui-context/types';
import {
  extractLink,
  extractSummary,
  extractTitle,
} from '../common/primitives';
import { extractLozenge } from '../common/lozenge';
import { extractLinkIcon } from './icon';
import {
  extractCommentCount,
  extractCreatedBy,
  extractModifiedBy,
  extractProgrammingLanguage,
  extractSubscriberCount,
  extractViewCount,
  extractReactCount,
  extractVoteCount,
} from './utils';
import { extractPersonCreatedBy } from '../common/person';
import { extractPersonsUpdatedBy } from './collaboratorGroup';
import { extractDateUpdated } from '../common/date/extractDateUpdated';
import {
  extractDateCreated,
  LinkTypeCreated,
} from '../common/date/extractDateCreated';
import extractPriority from './extract-priority';
import extractProviderIcon from './icon/extract-provider-icon';
import extractPreview from './extract-preview';
import { extractLatestCommit } from './latest-commit';

const extractFlexibleUiContext = (
  response?: JsonLd.Response,
  renderers?: CardProviderRenderers,
): FlexibleUiDataContext | undefined => {
  if (!response) {
    return undefined;
  }
  const data = response.data as JsonLd.Data.BaseData;
  const url = extractLink(data);
  return {
    authorGroup: extractPersonCreatedBy(data),
    collaboratorGroup: extractPersonsUpdatedBy(data as JsonLd.Data.Document),
    commentCount: extractCommentCount(data),
    viewCount: extractViewCount(data),
    reactCount: extractReactCount(data),
    voteCount: extractVoteCount(data),
    createdBy: extractCreatedBy(data),
    createdOn: extractDateCreated(data as LinkTypeCreated),
    linkIcon: extractLinkIcon(response, renderers),
    modifiedBy: extractModifiedBy(data),
    modifiedOn: extractDateUpdated(data),
    preview: extractPreview(data),
    priority: extractPriority(data as JsonLd.Data.Task),
    programmingLanguage: extractProgrammingLanguage(data),
    snippet: extractSummary(data) || undefined, // Explicitly set here to remove an empty string
    state: extractLozenge(data),
    subscriberCount: extractSubscriberCount(data),
    title: extractTitle(data) || url,
    provider: extractProviderIcon(data),
    latestCommit: extractLatestCommit(data as JsonLd.Data.SourceCodeRepository),
    url,
  };
};

export default extractFlexibleUiContext;
