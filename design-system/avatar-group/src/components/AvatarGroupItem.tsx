import React, { FC } from 'react';

import Avatar from '@atlaskit/avatar';
import {
  ButtonItem,
  CustomItem,
  CustomItemComponentProps,
  LinkItem,
} from '@atlaskit/menu';

import { AvatarProps, onAvatarClickHandler } from './types';

export interface AvatarGroupItemProps {
  avatar: AvatarProps;
  isActive?: boolean;
  isHover?: boolean;
  index: number;
  onAvatarClick?: onAvatarClickHandler;
  testId?: string;
}

const AvatarGroupItem: FC<AvatarGroupItemProps> = ({
  avatar,
  onAvatarClick,
  testId,
  index,
}) => {
  const { href, onClick, ...rest } = avatar;

  const CustomComponent: React.FC<CustomItemComponentProps> = ({
    children,
    ...props
  }) => {
    return <span {...props}>{children}</span>;
  };

  const AvatarIcon = (
    <Avatar
      {...rest}
      testId={testId && `${testId}--avatar`}
      borderColor="transparent"
      size="small"
    />
  );

  if (href) {
    return (
      <LinkItem
        href={href}
        target={avatar.target}
        rel={avatar.target === '_blank' ? 'noopener noreferrer' : undefined}
        iconBefore={AvatarIcon}
        testId={testId}
      >
        {avatar.name}
      </LinkItem>
    );
  }
  if (typeof onAvatarClick === 'function') {
    return (
      <ButtonItem
        onClick={event =>
          onAvatarClick &&
          onAvatarClick(event as React.MouseEvent<Element>, undefined, index)
        }
        iconBefore={AvatarIcon}
        testId={testId}
      >
        {avatar.name}
      </ButtonItem>
    );
  }
  return (
    <CustomItem
      iconBefore={AvatarIcon}
      component={CustomComponent}
      testId={testId}
    >
      {avatar.name}
    </CustomItem>
  );
};

export default AvatarGroupItem;
