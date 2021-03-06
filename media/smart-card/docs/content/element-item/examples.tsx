import React from 'react';
import CustomExample from '../../utils/custom-example';
import customMd from '../../utils/custom-md';

export default customMd`

### Authors

A \`AuthorGroup\` element shows the group of people who have attributed to the link resource.
Its data is mapped to \`atlassian:attributedTo\` from a link resolver.

${(
  <CustomExample
    Component={
      require('../../../examples/content/element-author-group').default
    }
    highlight="9"
    source={require('!!raw-loader!../../../examples/content/element-author-group')}
  />
)}

Use \`size\` to override block sizing on author group.

### Collaborators

A \`CollaboratorGroup\` element shows the person who has updated the link resource.
Its data is mapped to \`atlassian:updatedBy\` from a link resolver.


${(
  <CustomExample
    Component={
      require('../../../examples/content/element-collaborator-group').default
    }
    source={require('!!raw-loader!../../../examples/content/element-collaborator-group')}
  />
)}

Use \`size\` to override block sizing on collaborator group.

### Comments

A \`CommentsCount\` element shows the number of comments on the link resource.
Its data is mapped to \`schema:commentCount\` from a link resolver.


${(
  <CustomExample
    Component={
      require('../../../examples/content/element-comment-count').default
    }
    source={require('!!raw-loader!../../../examples/content/element-comment-count')}
  />
)}

### Created by

A \`CreatedBy\` element shows the name of the person who created the link resource.
Its data is mapped to \`attributedTo\` from a link resolver.

${(
  <CustomExample
    Component={require('../../../examples/content/element-created-by').default}
    source={require('!!raw-loader!../../../examples/content/element-created-by')}
  />
)}

### Created on

A \`CreatedOn\` element shows the relative creation time of the link resource.
Its data is mapped to \`schema:dateCreated\` from a link resolver. The text 'Created on' can be customized by adding a \`text\` field.

${(
  <CustomExample
    Component={require('../../../examples/content/element-created-on').default}
    source={require('!!raw-loader!../../../examples/content/element-created-on')}
  />
)}

### Latest Commit
A \`LatestCommit\` element shows the latest commit to a given repository.

${(
  <CustomExample
    Component={
      require('../../../examples/content/element-latest-commit').default
    }
    source={require('!!raw-loader!../../../examples/content/element-latest-commit')}
  />
)}

### Modified by

A \`ModifiedBy\` element shows the name of the last person who has updated the link resource.
Its data is mapped to \`atlassian:updatedBy\` from a link resolver.

${(
  <CustomExample
    Component={require('../../../examples/content/element-modified-by').default}
    source={require('!!raw-loader!../../../examples/content/element-modified-by')}
  />
)}

### Modified on

A \`ModifiedOn\` element shows the last relative modification time of the link resource.
Its data is mapped to \`updated\` from a link resolver. The text 'Modified on' can be customized by adding a \`text\` field.

${(
  <CustomExample
    Component={require('../../../examples/content/element-modified-on').default}
    source={require('!!raw-loader!../../../examples/content/element-modified-on')}
  />
)}

### Priority

A \`Priority\` element shows the priority of the link resource.
Its data is mapped to \`atlassian:priority\` from a link resolver.
The data is only available from link of task type.

${(
  <CustomExample
    Component={require('../../../examples/content/element-priority').default}
    source={require('!!raw-loader!../../../examples/content/element-priority')}
  />
)}

Following are the different priorities for the priority element.
A link resolver can also specify a icon url to use with the priority element.

${(
  <CustomExample
    Component={
      require('../../../examples/content/element-priority-variants').default
    }
    sourceVisible={false}
  />
)}

### Provider

A \`Provider\` element shows the icon and name of the link provider.
Its data is mapped to \`generator\` from a link resolver.

${(
  <CustomExample
    Component={require('../../../examples/content/element-provider').default}
    source={require('!!raw-loader!../../../examples/content/element-provider')}
  />
)}

### React

A \`ReactCount\` element shows the number of react or likes of the link resource.
Its data is mapped to \`atlassian:reactCount\` from a link resolver.

${(
  <CustomExample
    Component={require('../../../examples/content/element-react-count').default}
    source={require('!!raw-loader!../../../examples/content/element-react-count')}
  />
)}

### State

A \`State\` element can show different things based on the type of the link resource.
For a link of type document, project and pull request, a state element data is mapped to \`atlassian:state\`.
For a link of type task, a state element data can be mapped to \`tag\` or \`atlassian:taskStatus\` or \`atlassian:taskType\`.

${(
  <CustomExample
    Component={require('../../../examples/content/element-state').default}
    source={require('!!raw-loader!../../../examples/content/element-state')}
  />
)}

A state can have different text and appearances as specified by link resolver.

${(
  <CustomExample
    Component={
      require('../../../examples/content/element-state-variants').default
    }
    sourceVisible={false}
  />
)}

### Subscribers

A \`SubscriberCount\` element shows the number of subscribers on the link resource.
Its data is mapped to \`atlassian:subscriberCount\` from a link resolver.


${(
  <CustomExample
    Component={
      require('../../../examples/content/element-subscriber-count').default
    }
    source={require('!!raw-loader!../../../examples/content/element-subscriber-count')}
  />
)}

### Views

A \`ViewCount\` element shows the number of views on the link resource.
Its data is mapped to \`atlassian:viewCount\` from a link resolver.


${(
  <CustomExample
    Component={require('../../../examples/content/element-view-count').default}
    source={require('!!raw-loader!../../../examples/content/element-view-count')}
  />
)}

### Votes

A \`VoteCount\` element shows the number of votes on the link resource.
Its data is mapped to \`atlassian:voteCount\` from a link resolver.

${(
  <CustomExample
    Component={require('../../../examples/content/element-vote-count').default}
    source={require('!!raw-loader!../../../examples/content/element-vote-count')}
  />
)}

`;
