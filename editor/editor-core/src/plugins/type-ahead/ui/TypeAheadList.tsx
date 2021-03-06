/** @jsx jsx */
import React, {
  useMemo,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from 'react';
import { jsx, css } from '@emotion/react';

// eslint-disable-next-line @atlaskit/design-system/no-deprecated-imports
import { ItemGroup } from '@atlaskit/item';
import { SelectItemMode } from '@atlaskit/editor-common/type-ahead';

import type { TypeAheadItem, OnSelectItem } from '../types';
import { ICON_HEIGHT, itemTheme, ITEM_PADDING } from './TypeAheadListItem';
import { VariableSizeList as List } from 'react-window';
import { ResizeObserverProvider } from './hooks/use-resize-observer';
import { useDynamicListHeightCalculation } from './hooks/use-dynamic-list-height-calculation';
import {
  DynamicHeightListItem,
  SelectedIndexContext,
  ListItemActionsContext,
  UpdateListItemHeightContext,
} from './DynamicHeightListItem';
import { WrappedComponentProps, injectIntl } from 'react-intl-next';
import { typeAheadListMessages } from '../messages';

const LIST_ITEM_ESTIMATED_HEIGHT = ICON_HEIGHT + ITEM_PADDING * 2;
const LIST_WIDTH = 320;

type TypeAheadListProps = {
  items: Array<TypeAheadItem>;
  selectedIndex: number;
  onItemHover: OnSelectItem;
  onItemClick: (mode: SelectItemMode, index: number) => void;
  fitHeight: number;
} & WrappedComponentProps;

const TypeAheadListComponent = React.memo(
  ({
    items,
    selectedIndex,
    onItemHover,
    onItemClick,
    intl,
    fitHeight,
  }: TypeAheadListProps) => {
    const listRef = useRef<List<TypeAheadItem[]>>() as React.MutableRefObject<
      List<TypeAheadItem[]>
    >;
    const redrawListAtIndex = useCallback((index: number) => {
      listRef.current.resetAfterIndex(index);
    }, []);
    const lastVisibleIndexes = useRef({
      overscanStartIndex: 0,
      overscanStopIndex: 0,
      visibleStartIndex: 0,
      visibleStopIndex: 0,
    });
    const getFirstVisibleIndex = useCallback(() => {
      return lastVisibleIndexes.current.overscanStartIndex;
    }, []);
    const {
      getListItemHeight,
      setListItemHeight,
      renderedListHeight,
    } = useDynamicListHeightCalculation({
      redrawListAtIndex,
      getFirstVisibleIndex,
      listLength: items.length,
      listMaxHeight: fitHeight,
      listItemEstimatedHeight: LIST_ITEM_ESTIMATED_HEIGHT,
    });

    const onItemsRendered = useCallback((props) => {
      lastVisibleIndexes.current = props;
    }, []);

    const actions = useMemo(() => ({ onItemClick, onItemHover }), [
      onItemClick,
      onItemHover,
    ]);

    const onScroll = useCallback(
      ({ scrollUpdateWasRequested }) => {
        if (!scrollUpdateWasRequested) {
          return;
        }

        // In case the user scroll to a non-visible item like press ArrowUp from the first index
        // We will force the scroll calling the scrollToItem in the useEffect hook
        // When the scroll happens and we render the elements,
        // we still need calculate the items height and re-draw the List.
        // It is possible the item selected became invisible again (because the items height changed)
        // So, we need to wait for height to be calculated. Then we need to check
        // if the selected item is visible or not. If it isn't visible we call the scrollToItem again.
        //
        // We can't do this check in the first frame because that frame is being used by the resetScreenThrottled
        // to calculate each height. THen, we can schedule a new frame when this one finishs.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const { current: indexes } = lastVisibleIndexes;
            const isSelectedItemVisible =
              selectedIndex >= indexes.visibleStartIndex &&
              selectedIndex <= indexes.visibleStopIndex;

            if (!isSelectedItemVisible) {
              listRef.current.scrollToItem(selectedIndex);
            }
          });
        });
      },
      [selectedIndex],
    );

    useEffect(() => {
      if (!listRef.current) {
        return;
      }

      listRef.current.scrollToItem(selectedIndex);
    }, [selectedIndex]);

    useLayoutEffect(() => {
      requestAnimationFrame(() => {
        listRef.current.resetAfterIndex(
          lastVisibleIndexes.current.overscanStartIndex,
        );
      });
    }, [items]);

    if (!Array.isArray(items)) {
      return null;
    }

    const estimatedHeight = items.length * LIST_ITEM_ESTIMATED_HEIGHT;
    const height = Math.min(
      typeof renderedListHeight === 'number'
        ? renderedListHeight
        : estimatedHeight,
      fitHeight,
    );
    return (
      <ItemGroup
        role="listbox"
        aria-live="polite"
        aria-label={intl.formatMessage(
          typeAheadListMessages.typeAheadResultLabel,
        )}
        aria-relevant="additions removals"
        theme={itemTheme}
      >
        <ResizeObserverProvider>
          <UpdateListItemHeightContext.Provider value={setListItemHeight}>
            <ListItemActionsContext.Provider value={actions}>
              <SelectedIndexContext.Provider value={selectedIndex}>
                <List
                  useIsScrolling
                  ref={listRef}
                  itemData={items}
                  itemCount={items.length}
                  estimatedItemSize={LIST_ITEM_ESTIMATED_HEIGHT}
                  onScroll={onScroll}
                  onItemsRendered={onItemsRendered}
                  itemSize={getListItemHeight}
                  width={LIST_WIDTH}
                  height={height}
                  overscanCount={3}
                  css={css`
                    // temporary solution before we migrated off dst/item
                    & span[class^='ItemParts__Before'] {
                      margin-right: 12px;
                    }
                  `}
                >
                  {DynamicHeightListItem}
                </List>
              </SelectedIndexContext.Provider>
            </ListItemActionsContext.Provider>
          </UpdateListItemHeightContext.Provider>
        </ResizeObserverProvider>
      </ItemGroup>
    );
  },
);

export const TypeAheadList = injectIntl(TypeAheadListComponent);

TypeAheadList.displayName = 'TypeAheadList';
