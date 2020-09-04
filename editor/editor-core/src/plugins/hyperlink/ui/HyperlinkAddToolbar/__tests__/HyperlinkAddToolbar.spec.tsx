import React from 'react';
import {
  HyperlinkLinkAddToolbarWithIntl,
  Props as HyperlinkAddToolbarProps,
} from '../HyperlinkAddToolbar';
import Issue16Icon from '@atlaskit/icon-object/glyph/issue/16';
import Bug16Icon from '@atlaskit/icon-object/glyph/bug/16';
import Story16Icon from '@atlaskit/icon-object/glyph/story/16';
import Task16Icon from '@atlaskit/icon-object/glyph/task/16';
import Page16Icon from '@atlaskit/icon-object/glyph/page/16';
import Blog16Icon from '@atlaskit/icon-object/glyph/blog/16';
import { CreateUIAnalyticsEvent } from '@atlaskit/analytics-next';
import LinkSearchListItem from '../../../../../ui/LinkSearch/LinkSearchListItem';
import LinkSearchList from '../../../../../ui/LinkSearch/LinkSearchList';
import { mountWithIntl } from '@atlaskit/editor-test-helpers/enzyme';
import {
  activityProviderMockResults,
  generateActivityProviderMockResults,
  searchProviderMockResults,
  generateSearchproviderMockResults,
} from './__helpers';
import { ActivityProvider, ActivityError } from '@atlaskit/activity-provider';
import {
  expectToEqual,
  expectFunctionToHaveBeenCalledWith,
  nextTick,
} from '@atlaskit/media-test-helpers';
import { SearchProvider } from '@atlaskit/editor-common';
import { INPUT_METHOD } from '../../../../analytics';
import { shallow } from 'enzyme';
import { LinkSearchListItemData } from '../../../../../ui/LinkSearch/types';
import sinon from 'sinon';

interface SetupArgumentObject {
  recentItemsPromise?: ReturnType<ActivityProvider['getRecentItems']>;
  searchRecentPromise?: ReturnType<ActivityProvider['searchRecent']>;
  quickSearchPromise?: ReturnType<SearchProvider['quickSearch']>;
  displayUrl?: string;
  waitForResolves?: boolean;
  provideActivityProvider?: boolean;
  provideSearchProvider?: boolean;
}

interface Props {
  child: React.ReactChild;
}

const clock = sinon.useFakeTimers();
jest.unmock('lodash/debounce');

jest.mock('date-fns/difference_in_calendar_days', () => {
  return jest.fn().mockImplementation(() => -5);
});

jest.mock('date-fns/distance_in_words_to_now', () => ({
  __esModule: true,
  default: () => 'just a minute',
}));

jest.mock('@atlaskit/editor-common', () => ({
  startMeasure: () => {},
  stopMeasure: (
    _name: string,
    cb: (duration: number, startTime: number) => void,
  ) => cb(1, 1),
}));

class TestingWrapper extends React.Component<Props, {}> {
  render() {
    return <>{this.props.child}</>;
  }
}

const assertIcon = (item: LinkSearchListItemData, iconComponent: any) => {
  const icon = item.icon;
  if (!icon) {
    throw expect(icon).toBeDefined();
  }
  const mountedIcon = shallow(<TestingWrapper child={icon} />);
  expect(mountedIcon.find(iconComponent)).toHaveLength(1);
};

describe('HyperlinkAddToolbar', () => {
  afterAll(() => {
    jest.restoreAllMocks();
    clock.restore();
  });
  afterEach(() => {
    clock.reset();
  });

  const setup = async (options: SetupArgumentObject = {}) => {
    const {
      waitForResolves = true,
      provideActivityProvider = true,
      provideSearchProvider = true,
      displayUrl,
      recentItemsPromise = Promise.resolve(activityProviderMockResults),
      searchRecentPromise = Promise.resolve(activityProviderMockResults),
      quickSearchPromise = Promise.resolve(searchProviderMockResults),
    } = options;
    const createAnalyticsEvent: CreateUIAnalyticsEvent = jest
      .fn()
      .mockReturnValue({
        update: () => {},
        fire() {},
        attributes: { foo: 'bar' },
      });
    const activityProvider: ActivityProvider = {
      getRecentItems: jest.fn<
        ReturnType<ActivityProvider['getRecentItems']>,
        Parameters<ActivityProvider['getRecentItems']>
      >(() => recentItemsPromise),
      searchRecent: jest.fn<
        ReturnType<ActivityProvider['searchRecent']>,
        Parameters<ActivityProvider['searchRecent']>
      >(() => searchRecentPromise),
    };

    const searchProvider: SearchProvider = {
      quickSearch: jest.fn<
        ReturnType<SearchProvider['quickSearch']>,
        Parameters<SearchProvider['quickSearch']>
      >(() => quickSearchPromise),
    };

    let activityProviderPromise: HyperlinkAddToolbarProps['activityProvider'] = Promise.resolve(
      activityProvider,
    );
    let searchProviderPromise: HyperlinkAddToolbarProps['searchProvider'] = Promise.resolve(
      searchProvider,
    );

    const onSubmit = jest.fn<
      ReturnType<Required<HyperlinkAddToolbarProps>['onSubmit']>,
      Parameters<Required<HyperlinkAddToolbarProps>['onSubmit']>
    >();

    if (!provideActivityProvider) {
      activityProviderPromise = undefined;
    }
    if (!provideSearchProvider) {
      searchProviderPromise = undefined;
    }

    const component = mountWithIntl(
      <HyperlinkLinkAddToolbarWithIntl
        displayUrl={displayUrl}
        onSubmit={onSubmit}
        activityProvider={activityProviderPromise}
        searchProvider={searchProviderPromise}
        createAnalyticsEvent={createAnalyticsEvent}
      />,
    );

    if (waitForResolves) {
      await activityProviderPromise;
      await searchProviderPromise;
      await recentItemsPromise;
      await nextTick();
      component.update();
    }

    const updateInputField = (testId: string, value: string) => {
      const linkUrlInput = component.find(`input[data-testid="${testId}"]`);
      (linkUrlInput.getDOMNode() as HTMLInputElement).value = value;
      linkUrlInput.simulate('change', {
        target: { name: undefined, value },
      });
    };

    const pressReturnInputField = (testId: string) => {
      const linkUrlInput = component.find(`input[data-testid="${testId}"]`);
      linkUrlInput.simulate('keydown', {
        keyCode: 13,
      });
    };

    const pressDownArrowInputField = (testId: string) => {
      const linkUrlInput = component.find(`input[data-testid="${testId}"]`);
      linkUrlInput.simulate('keydown', {
        keyCode: 40,
      });
    };

    return {
      component,
      onSubmit,
      activityProviderPromise,
      searchProviderPromise,
      recentItemsPromise,
      searchRecentPromise,
      quickSearchPromise,
      updateInputField,
      pressReturnInputField,
      pressDownArrowInputField,
      createAnalyticsEvent,
    };
  };

  describe('when activity provider returns 5 or more results initially', () => {
    it('should have isLoading before recent activity results are resolved', async () => {
      const {
        component,
        activityProviderPromise,
        searchProviderPromise,
      } = await setup({ waitForResolves: false });
      await activityProviderPromise;
      await searchProviderPromise;
      component.update();
      expectToEqual(component.find(LinkSearchList).props().isLoading, true);
    });

    it("should still keep isLoading when activityProvider is resolved but not it's results", async () => {
      const { component, activityProviderPromise } = await setup({
        recentItemsPromise: new Promise(() => {}),
        waitForResolves: false,
      });
      await activityProviderPromise;
      component.update();
      expectToEqual(component.find(LinkSearchList).props().isLoading, true);
    });

    it("should put isLoading to false when activity provider's results are recieved", async () => {
      const { component } = await setup();

      expectToEqual(component.find(LinkSearchList).props().isLoading, false);
    });

    it('should put isLoading to false when activity provider rejects', async () => {
      const recentItemsPromise = Promise.reject('some-error');
      const {
        component,
        activityProviderPromise,
        searchProviderPromise,
      } = await setup({
        waitForResolves: false,
        recentItemsPromise,
      });
      await activityProviderPromise;
      await searchProviderPromise;
      try {
        await recentItemsPromise;
      } catch (e) {}
      component.update();
      expectToEqual(component.find(LinkSearchList).props().isLoading, false);
    });

    it('should not load items nor show isLoading when displayUrl provided', async () => {
      const { component } = await setup({
        displayUrl: 'http://some-url.com',
      });
      expect(component.find(LinkSearchList).props().items).toHaveLength(0);
      expectToEqual(component.find(LinkSearchList).props().isLoading, false);
    });

    it('should render a list of recent activity items', async () => {
      const { component } = await setup({ waitForResolves: true });
      const items = component.find(LinkSearchList).props().items;
      if (!items) {
        return expect(items).toBeDefined();
      }
      expect(items).toHaveLength(5);
      expectToEqual(items[0], {
        objectId: 'some-activity-id-1',
        name: 'some-activity-name-1',
        url: 'some-activity-url-1.com',
        container: 'some-activity-container-1',
        iconUrl: 'some-activity-icon-url-1.com',
        lastViewedDate: new Date('2020-04-16T00:00:00+00:00'),
      });

      expectToEqual(component.find(LinkSearchList).props().isLoading, false);
    });

    it('should filter recent activity items by input text', async () => {
      const {
        component,
        activityProviderPromise,
        updateInputField,
        searchRecentPromise,
      } = await setup({
        searchRecentPromise: Promise.resolve(
          generateActivityProviderMockResults(7),
        ),
      });

      if (!activityProviderPromise) {
        return expect(activityProviderPromise).toBeDefined();
      }

      const activityProvider = await activityProviderPromise;

      updateInputField('link-url', 'some-value');
      clock.tick(500);
      await searchRecentPromise;
      component.update();
      const items = component.find(LinkSearchList).props().items;
      if (!items) {
        return expect(items).toBeDefined();
      }
      expect(items).toHaveLength(5);
      expectToEqual(items[0], {
        objectId: 'some-activity-id-1',
        name: 'some-activity-name-1',
        url: 'some-activity-url-1.com',
        container: 'some-activity-container-1',
        iconUrl: 'some-activity-icon-url-1.com',
        lastViewedDate: new Date('2020-04-16T00:00:00+00:00'),
      });

      expect(activityProvider.searchRecent).toHaveBeenCalledTimes(1);
      expectFunctionToHaveBeenCalledWith(activityProvider.searchRecent, [
        'some-value',
      ]);
    });

    it('should make default activity items call when input is cleared', async () => {
      const {
        component,
        activityProviderPromise,
        updateInputField,
        searchRecentPromise,
        recentItemsPromise,
      } = await setup({
        recentItemsPromise: Promise.resolve(
          generateActivityProviderMockResults(7),
        ),
        searchRecentPromise: Promise.resolve(
          generateActivityProviderMockResults(1),
        ),
      });

      if (!activityProviderPromise) {
        return expect(activityProviderPromise).toBeDefined();
      }

      await activityProviderPromise;

      updateInputField('link-url', 'some-value');
      await recentItemsPromise;
      await searchRecentPromise;
      clock.tick(500);
      component.update();

      updateInputField('link-url', '');
      await searchRecentPromise;
      await recentItemsPromise;
      component.update();

      let listComponentProps = component.find(LinkSearchList).props();

      const items = listComponentProps.items;
      if (!items) {
        return expect(items).toBeDefined();
      }
      expect(items).toHaveLength(5);
      expect(items).toMatchSnapshot();
      expect(listComponentProps.selectedIndex).toEqual(-1);
    });

    it('should submit with selected activity item when clicked', async () => {
      const { component, onSubmit } = await setup();

      component
        .find(LinkSearchListItem)
        .at(1)
        .simulate('mousedown');

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith(
        'some-activity-url-2.com',
        'some-activity-name-2',
        undefined,
        'typeAhead',
      );
    });

    it('should submit with selected activity item when enter is pressed', async () => {
      const {
        component,
        onSubmit,
        searchRecentPromise,
        updateInputField,
        pressReturnInputField,
        pressDownArrowInputField,
      } = await setup();

      updateInputField('link-url', 'some-value');

      await searchRecentPromise;
      component.update();
      pressDownArrowInputField('link-url');
      pressDownArrowInputField('link-url');
      pressReturnInputField('link-url');

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith(
        'http://some-activity-url-2.com',
        'some-activity-name-2',
        undefined,
        'typeAhead',
      );
    });

    it('should submit with selected activity item when navigated to via keyboard and enter pressed', async () => {
      const {
        onSubmit,
        pressDownArrowInputField,
        pressReturnInputField,
      } = await setup();

      pressDownArrowInputField('link-url');
      pressDownArrowInputField('link-url');
      pressReturnInputField('link-url');

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith(
        'http://some-activity-url-2.com',
        'some-activity-name-2',
        undefined,
        'typeAhead',
      );
    });

    it('should not submit when URL is invalid and there is no result', async () => {
      const {
        component,
        onSubmit,
        searchRecentPromise,
        updateInputField,
        pressReturnInputField,
      } = await setup({
        searchRecentPromise: Promise.resolve([]),
      });

      updateInputField('link-url', 'javascript:alert(1)');

      await searchRecentPromise;
      component.update();

      pressReturnInputField('link-url');

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should submit arbitrary link', async () => {
      const {
        component,
        onSubmit,
        searchRecentPromise,
        updateInputField,
        pressReturnInputField,
      } = await setup({
        searchRecentPromise: Promise.resolve([]),
      });

      updateInputField('link-url', 'example.com');

      await searchRecentPromise;

      pressReturnInputField('link-url');
      component.update();

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith(
        'http://example.com',
        'example.com',
        undefined,
        'manual',
      );
    });

    it('should display a valid URL on load', async () => {
      const { component } = await setup({
        displayUrl: 'https://www.atlassian.com',
      });

      expectToEqual(
        (component
          .find('input[data-testid="link-url"]')
          .getDOMNode() as HTMLInputElement).value,
        'https://www.atlassian.com',
      );
    });

    it('should NOT display an invalid URL on load', async () => {
      const { component } = await setup({
        displayUrl: 'javascript:alert(1)',
      });

      expectToEqual(
        (component
          .find('input[data-testid="link-url"]')
          .getDOMNode() as HTMLInputElement).value,
        '',
      );
    });

    it('should NOT render a list of recent activity items', async () => {
      const { component } = await setup({
        provideActivityProvider: false,
      });

      expect(component.find(LinkSearchListItem)).toHaveLength(0);
      expect(component.find(LinkSearchList).props().isLoading).toBe(false);
    });

    describe('when activity provider returns less then 5 results initially', () => {
      const setup2 = async (config: SetupArgumentObject = {}) => {
        const { component } = await setup({
          ...config,
          recentItemsPromise: Promise.resolve(
            activityProviderMockResults.slice(0, 2),
          ),
        });

        return { component };
      };

      it('should not show loading for the search part of the list', async () => {
        const { component } = await setup2();

        expectToEqual(component.find(LinkSearchList).props().isLoading, false);
        expect(component.find(LinkSearchList).props().items).toHaveLength(2);
      });
    });
  });

  describe('when activity provider returns less then 5 results after user input', () => {
    const setup2 = async (config: SetupArgumentObject = {}) => {
      const results = await setup({
        searchRecentPromise: Promise.resolve(
          activityProviderMockResults.slice(0, 2),
        ),
        quickSearchPromise: Promise.resolve(
          searchProviderMockResults.slice(0, 3),
        ),
        ...config,
      });
      const { component, searchRecentPromise, updateInputField } = results;

      updateInputField('link-url', 'some-value');

      await searchRecentPromise;
      component.update();

      return results;
    };

    it('should show loading for the search part of the list', async () => {
      const { component } = await setup2();

      expectToEqual(component.find(LinkSearchList).props().isLoading, true);
      expect(component.find(LinkSearchList).props().items).toHaveLength(2);
    });

    it('should not show loading for the search part of the list when searchProvider is not defined', async () => {
      const { component } = await setup2({
        provideSearchProvider: false,
      });

      expectToEqual(component.find(LinkSearchList).props().isLoading, false);
      expect(component.find(LinkSearchList).props().items).toHaveLength(2);
    });

    it('should call searchProvider', async () => {
      const {
        component,
        quickSearchPromise,
        searchProviderPromise,
      } = await setup2();

      if (!searchProviderPromise) {
        return expect(searchProviderPromise).toBeDefined();
      }
      const searchProvider = await searchProviderPromise;

      await quickSearchPromise;

      component.update();
      clock.tick(500);
      expectFunctionToHaveBeenCalledWith(searchProvider.quickSearch, [
        'some-value',
        3,
      ]);
    });

    it('should populate link search list with quick search results', async () => {
      const {
        component,
        searchRecentPromise,
        quickSearchPromise,
      } = await setup2();

      const searchRecentItems = await searchRecentPromise;
      clock.tick(500);
      const quickSearchItems = await quickSearchPromise;

      component.update();

      const items = component.find(LinkSearchList).props().items;
      if (!items) {
        return expect(items).toBeDefined();
      }
      expect(items).toHaveLength(
        searchRecentItems.length + quickSearchItems.length,
      );

      // Double check that activity results goes first.
      // Assert First item is a first item from activity provider result
      expectToEqual(items[0].name, activityProviderMockResults[0].name);
      expectToEqual(
        items[0].container,
        activityProviderMockResults[0].container,
      );

      // Then assert that next result item after all activity providers is the one from
      // quick search results.
      expectToEqual(items[searchRecentItems.length], {
        objectId: 'some-quick-search-id-1',
        name: 'some-quick-search-title-1',
        container: 'some-quick-search-container-1',
        url: 'some-quick-search-url-1.com',
        lastUpdatedDate: new Date('2020-04-15T00:00:00+00:00'),
        icon: expect.anything(),
      });
    });

    it('should not show loading when quick search results are in', async () => {
      const {
        component,
        searchRecentPromise,
        quickSearchPromise,
      } = await setup2();

      await searchRecentPromise;
      clock.tick(500);
      await quickSearchPromise;

      component.update();

      expectToEqual(component.find(LinkSearchList).props().isLoading, false);
      expect(component.find(LinkSearchList).props().items).toHaveLength(5);
    });

    it('show appropriate issue icon in quick search results based on contentType', async () => {
      const {
        component,
        searchRecentPromise,
        quickSearchPromise,
      } = await setup2({
        searchRecentPromise: Promise.resolve([]),
        quickSearchPromise: Promise.resolve(
          generateSearchproviderMockResults(1, 'jira.issue'),
        ),
      });

      await searchRecentPromise;
      clock.tick(500);
      await quickSearchPromise;

      component.update();
      const { items } = component.find(LinkSearchList).props();
      if (!items) {
        return expect(items).toBeDefined();
      }
      assertIcon(items[0], Issue16Icon);
    });

    it('show appropriate bug icon in quick search results based on contentType', async () => {
      const {
        component,
        searchRecentPromise,
        quickSearchPromise,
      } = await setup2({
        searchRecentPromise: Promise.resolve([]),
        quickSearchPromise: Promise.resolve(
          generateSearchproviderMockResults(1, 'jira.issue.bug'),
        ),
      });

      await searchRecentPromise;
      clock.tick(500);
      await quickSearchPromise;

      component.update();
      const { items } = component.find(LinkSearchList).props();
      if (!items) {
        return expect(items).toBeDefined();
      }
      assertIcon(items[0], Bug16Icon);
    });

    it('show appropriate story icon in quick search results based on contentType', async () => {
      const {
        component,
        searchRecentPromise,
        quickSearchPromise,
      } = await setup2({
        searchRecentPromise: Promise.resolve([]),
        quickSearchPromise: Promise.resolve(
          generateSearchproviderMockResults(1, 'jira.issue.story'),
        ),
      });

      await searchRecentPromise;
      clock.tick(500);
      await quickSearchPromise;

      component.update();
      const { items } = component.find(LinkSearchList).props();
      if (!items) {
        return expect(items).toBeDefined();
      }
      assertIcon(items[0], Story16Icon);
    });

    it('show appropriate task icon in quick search results based on contentType', async () => {
      const {
        component,
        searchRecentPromise,
        quickSearchPromise,
      } = await setup2({
        searchRecentPromise: Promise.resolve([]),
        quickSearchPromise: Promise.resolve(
          generateSearchproviderMockResults(1, 'jira.issue.task'),
        ),
      });

      await searchRecentPromise;
      clock.tick(500);
      await quickSearchPromise;

      component.update();
      const { items } = component.find(LinkSearchList).props();
      if (!items) {
        return expect(items).toBeDefined();
      }
      assertIcon(items[0], Task16Icon);
    });

    it('show appropriate page icon in quick search results based on contentType', async () => {
      const {
        component,
        searchRecentPromise,
        quickSearchPromise,
      } = await setup2({
        searchRecentPromise: Promise.resolve([]),
        quickSearchPromise: Promise.resolve(
          generateSearchproviderMockResults(1, 'confluence.page'),
        ),
      });

      await searchRecentPromise;
      clock.tick(500);
      await quickSearchPromise;

      component.update();
      const { items } = component.find(LinkSearchList).props();
      if (!items) {
        return expect(items).toBeDefined();
      }
      assertIcon(items[0], Page16Icon);
    });

    it('show appropriate blogpost icon in quick search results based on contentType', async () => {
      const {
        component,
        searchRecentPromise,
        quickSearchPromise,
      } = await setup2({
        searchRecentPromise: Promise.resolve([]),
        quickSearchPromise: Promise.resolve(
          generateSearchproviderMockResults(1, 'confluence.blogpost'),
        ),
      });

      await searchRecentPromise;
      clock.tick(500);
      await quickSearchPromise;

      component.update();
      const { items } = component.find(LinkSearchList).props();
      if (!items) {
        return expect(items).toBeDefined();
      }
      assertIcon(items[0], Blog16Icon);
    });

    it('debounces calls to the quick search provider', async () => {
      const {
        component,
        updateInputField,
        searchProviderPromise,
        quickSearchPromise,
      } = await setup2();
      const searchProvider = await searchProviderPromise;
      const quickSearchSpy = jest.spyOn(
        searchProvider as SearchProvider,
        'quickSearch',
      );
      updateInputField('link-url', 'a');
      updateInputField('link-url', 'b');
      updateInputField('link-url', 'c');
      component.update();
      await quickSearchPromise;
      clock.tick(500);
      expect(quickSearchSpy).toHaveBeenCalledTimes(1);
    });

    it('should call onSelect with right url when quick search item is clicked', async () => {
      const {
        component,
        searchRecentPromise,
        quickSearchPromise,
        onSubmit,
      } = await setup2();

      const searchRecentItems = await searchRecentPromise;
      clock.tick(500);
      const quickSearchItems = await quickSearchPromise;

      component.update();

      const linkSearchListItems = component.find(LinkSearchListItem);
      const firstQuickSearchItem = linkSearchListItems.at(
        searchRecentItems.length,
      );

      firstQuickSearchItem.simulate('mousedown');

      expectFunctionToHaveBeenCalledWith(onSubmit, [
        quickSearchItems[0].url,
        quickSearchItems[0].title,
        undefined,
        INPUT_METHOD.TYPEAHEAD,
      ]);
    });
  });

  describe('analytics', () => {
    it('should trigger the Operational Event of "invoked searchResult" when activityProvider is called', async () => {
      const { component, createAnalyticsEvent } = await setup();
      component.update();
      expect(createAnalyticsEvent).toBeCalledWith({
        action: 'invoked',
        actionSubject: 'searchResult',
        actionSubjectId: 'recentActivities',
        attributes: {
          count: 5,
          duration: 1,
          startTime: 1,
        },
        eventType: 'operational',
      });
    });

    it('should trigger the Operational Event with error message if activity request fails', async () => {
      const recentItemsPromise = Promise.reject(
        new ActivityError('Internal Server Error', 500),
      );
      const {
        component,
        activityProviderPromise,
        createAnalyticsEvent,
      } = await setup({
        waitForResolves: false,
        recentItemsPromise,
      });
      await activityProviderPromise;
      try {
        await recentItemsPromise;
      } catch (e) {}
      component.update();

      expect(createAnalyticsEvent).toBeCalledWith({
        action: 'invoked',
        actionSubject: 'searchResult',
        actionSubjectId: 'recentActivities',
        attributes: {
          count: -1,
          duration: 1,
          startTime: 1,
          error: 'Internal Server Error',
          errorCode: 500,
        },
        eventType: 'operational',
      });
    });
  });
});