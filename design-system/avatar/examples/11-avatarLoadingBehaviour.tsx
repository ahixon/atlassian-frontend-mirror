import React, { ChangeEvent, FC, FormEvent, useState } from 'react';

import Button from '@atlaskit/button/standard-button';
import { CustomThemeButtonProps } from '@atlaskit/button/types';
import { gridSize } from '@atlaskit/theme/constants';

import { Note } from '../examples-util/helpers';
import Avatar from '../src';

const Btn = (props: CustomThemeButtonProps) => (
  <span style={{ marginLeft: gridSize() }}>
    <Button type="button" {...props} />
  </span>
);

type State = {
  inputValue: string;
  imageUrl: string;
};

const initialState = {
  inputValue:
    'https://pbs.twimg.com/profile_images/568401563538841600/2eTVtXXO_400x400.jpeg',
  imageUrl: '',
};

// eslint-disable-next-line react/no-multi-comp
const ExternalSrcAvatar: FC = props => {
  const [{ inputValue, imageUrl }, setState] = useState<State>(initialState);

  const changeUrl = (event: ChangeEvent<HTMLInputElement>) =>
    setState({ imageUrl, inputValue: event.target.value });

  const loadImage = (event: FormEvent) => {
    event.preventDefault();
    setState({ imageUrl: inputValue, inputValue });
  };

  const resetState = () => setState(initialState);

  let avatarName = 'Default Avatar';
  if (imageUrl === initialState.inputValue) {
    avatarName = 'Mike Cannon-Brookes';
  } else if (imageUrl.length) {
    avatarName = 'Custom Avatar';
  }

  return (
    <form onSubmit={loadImage}>
      <Note size="large">Try pasting a URL to see the loading behavior:</Note>
      <div
        style={{
          display: 'flex',
          marginBottom: gridSize(),
          marginTop: gridSize(),
        }}
      >
        <input
          onChange={changeUrl}
          style={{ flex: 1 }}
          type="text"
          value={inputValue}
        />
        <Btn type="submit" appearance="primary">
          Load Image
        </Btn>
        <Btn onClick={resetState}>Reset</Btn>
      </div>
      <Avatar name={avatarName} size="xlarge" src={imageUrl} />
    </form>
  );
};

export default ExternalSrcAvatar;
