import React from 'react';

import {
  EmojiInsertionAnalytic,
  recordFailed,
  recordSucceeded,
  ufoExperiences,
} from '../../util/analytics';
import { EmojiId, OnEmojiEvent, OptionalEmojiDescription } from '../../types';
import { EmojiProvider } from '../../api/EmojiResource';

/**
 * A function that will wrap any configured Emoji 'onSelection' function to ensure recordSelection is always
 * called.
 *
 * @param provider the EmojiProvider which will be called on each emoji selection
 * @param onSelect the onSelect function that is explicitly configured on the Emoji component.
 * @param fireAnalytics a function used to fire analytics events.
 */
export const createRecordSelectionDefault = <T>(
  provider: EmojiProvider,
  onSelect?: OnEmojiEvent<T>,
  fireAnalytics?: (producer: EmojiInsertionAnalytic) => void,
): OnEmojiEvent<T> => {
  return (
    emojiId: EmojiId,
    emoji: OptionalEmojiDescription,
    event?: React.SyntheticEvent<T>,
  ) => {
    try {
      if (provider.recordSelection && emoji) {
        ufoExperiences['emoji-selection-recorded'].start();
        provider
          .recordSelection(emoji)
          .then(() => {
            fireAnalytics && fireAnalytics(recordSucceeded);
            ufoExperiences['emoji-selection-recorded'].success();
          })
          .catch(() => {
            fireAnalytics && fireAnalytics(recordFailed);
            ufoExperiences['emoji-selection-recorded'].failure({
              metadata: {
                reason: 'recordSelection error',
                source: 'RecordSelectionDefault',
                data: {
                  emoji: {
                    id: emoji.id,
                    name: emoji.name,
                    shortName: emoji.shortName,
                  },
                },
              },
            });
          });
      }
    } finally {
      if (onSelect) {
        onSelect(emojiId, emoji, event);
      }
    }
  };
};
