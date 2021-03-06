import React, { useState } from 'react';
import { IntlProvider } from 'react-intl-next';
import Button from '@atlaskit/button';
import Popup from '@atlaskit/popup';
import { AtlassianLinkPickerPlugin } from '@atlassian/link-picker-atlassian-plugin';

import { mockRecentClient, searchProvider } from '../example-helpers/providers';
import { LinkPicker, LinkPickerPlugin } from '../src';

type OnSubmitPayload = Parameters<
  Required<React.ComponentProps<typeof LinkPicker>>['onSubmit']
>[0];

mockRecentClient();

export default function InPopup() {
  const [isOpen, setIsOpen] = useState(true);
  const [link, setLink] = useState<OnSubmitPayload>({
    url: '',
    displayText: null,
    title: null,
    meta: {
      inputMethod: 'manual',
    },
  });

  const handleToggle = () => setIsOpen(!isOpen);
  const onSubmit = (payload: OnSubmitPayload) => {
    setLink(payload);
    setIsOpen(false);
  };

  const plugins: [LinkPickerPlugin] = React.useMemo(
    () => [
      new AtlassianLinkPickerPlugin({
        searchProvider,
        activityClientEndpoint: 'https://pug.jira-dev.com/gateway/api/graphql',
      }),
    ],
    [],
  );

  return (
    <div className="example" style={{ padding: 50 }}>
      <IntlProvider locale="en">
        <Popup
          isOpen={isOpen}
          autoFocus={false}
          onClose={handleToggle}
          content={props => (
            <div>
              <LinkPicker
                {...props}
                plugins={plugins}
                onSubmit={onSubmit}
                onCancel={handleToggle}
              />
            </div>
          )}
          placement="bottom-start"
          trigger={({ ref, ...triggerProps }) => (
            <Button
              {...triggerProps}
              ref={ref}
              appearance="primary"
              isSelected={isOpen}
              onClick={handleToggle}
            >
              Toggle
            </Button>
          )}
        />
        <div>
          <a href={link.url} target="_blank">
            {link.displayText || link.url}
          </a>
        </div>
      </IntlProvider>
    </div>
  );
}
