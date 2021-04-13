import React, { forwardRef } from 'react';

import {
  cleanup,
  fireEvent,
  render,
  RenderResult,
} from '@testing-library/react';

import Pagination, { PaginationPropTypes } from '../../index';

function assertPageButtonRendering(
  renderResult: RenderResult,
  { page, isSelected }: { page: string; isSelected: boolean },
) {
  try {
    const pageElement = renderResult.getByText(page).parentElement;

    expect(pageElement).toBeInTheDocument();

    if (isSelected) {
      expect(pageElement).toHaveStyle('color:rgb(244, 245, 247) !important');
      expect(pageElement).toHaveStyle('background:rgb(37, 56, 88)');
    } else {
      expect(pageElement).toHaveStyle('color:rgb(66, 82, 110) !important');
      expect(pageElement).toHaveStyle('background:none');
    }
  } catch (error) {
    Error.captureStackTrace(error, assertPageButtonRendering);

    throw error;
  }
}

function assertNavigationButtonRendering(
  renderResult: RenderResult,
  { label, isEnabled }: { label: string; isEnabled: boolean },
) {
  try {
    const navigationButton = renderResult.getByLabelText(label);

    expect(navigationButton).toBeInTheDocument();

    if (isEnabled) {
      expect(navigationButton).not.toHaveAttribute('disabled');
      expect(navigationButton).toHaveStyle('cursor: pointer');
      expect(navigationButton).toHaveStyle('color:rgb(66, 82, 110) !important');
    } else {
      expect(navigationButton).toHaveAttribute('disabled');
      expect(navigationButton).toHaveStyle('cursor: not-allowed');
      expect(navigationButton).toHaveStyle(
        'color:rgb(165, 173, 186) !important',
      );
    }
  } catch (error) {
    Error.captureStackTrace(error, assertNavigationButtonRendering);

    throw error;
  }
}

describe('Pagination', () => {
  afterEach(cleanup);

  const setup = (paginationProps: Partial<PaginationPropTypes> = {}) => {
    const props = {
      pages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    };

    const renderResult = render(<Pagination {...props} {...paginationProps} />);

    return {
      renderResult,
      props,
    };
  };

  describe('rendering with default props', () => {
    it('should not throw error while rendering', () => {
      expect(() => {
        setup();
      }).not.toThrow();
    });

    it('should render 1, 2, 3, 4, 5 and 10th pages only along with ellipsis (max 7 pages) and 1st page as selected', () => {
      const { renderResult } = setup();

      [
        { page: '1', isSelected: true },
        { page: '2', isSelected: false },
        { page: '3', isSelected: false },
        { page: '4', isSelected: false },
        { page: '5', isSelected: false },
        { page: '10', isSelected: false },
      ].forEach(({ page, isSelected }) => {
        assertPageButtonRendering(renderResult, { page, isSelected });
      });

      expect(renderResult.getByText('...')).toBeInTheDocument();

      ['6', '7', '8', '9'].forEach(page => {
        expect(renderResult.queryByText(page)).not.toBeInTheDocument();
      });
    });

    it('should render previous and next navigation buttons', () => {
      const { renderResult } = setup();

      assertNavigationButtonRendering(renderResult, {
        label: 'previous',
        isEnabled: false,
      });

      assertNavigationButtonRendering(renderResult, {
        label: 'next',
        isEnabled: true,
      });
    });
  });

  describe('props', () => {
    describe('#collapseRange', () => {
      it('should get called with some arguments', () => {
        const collapseRange = jest.fn();
        const ellipsis = jest.fn();
        const { renderResult, props } = setup({
          collapseRange,
          renderEllipsis: ellipsis,
        });

        expect(collapseRange).toHaveBeenCalledWith(expect.any(Array), 0, {
          max: 7,
          ellipsis,
        });

        const newCollapseRange = jest.fn();
        renderResult.rerender(
          <Pagination
            {...props}
            max={4}
            collapseRange={newCollapseRange}
            renderEllipsis={ellipsis}
          />,
        );

        expect(newCollapseRange).toHaveBeenCalledWith(expect.any(Array), 0, {
          max: 4,
          ellipsis,
        });
      });
    });

    describe('#components', () => {
      it('should render custom components', () => {
        function Page(
          { page, ...rest }: { page: number },
          ref: React.Ref<HTMLDivElement>,
        ) {
          return (
            <div ref={ref} {...rest} data-testid={`Page-${page}`}>
              Page - {page}
            </div>
          );
        }
        function Navigation(
          props: { 'aria-label': string },
          ref: React.Ref<HTMLDivElement>,
        ) {
          return (
            <div
              ref={ref}
              {...props}
              data-testid={`custom-${props['aria-label']}`}
            >
              {props['aria-label']}
            </div>
          );
        }
        const { renderResult, props } = setup({
          components: {
            Previous: forwardRef(Navigation),
            Page: forwardRef(Page),
            Next: forwardRef(Navigation),
          },
        });

        expect(renderResult.getByTestId('Page-1')).toBeInTheDocument();
        expect(renderResult.getByTestId('custom-previous')).toBeInTheDocument();
        expect(renderResult.getByTestId('custom-next')).toBeInTheDocument();

        renderResult.rerender(<Pagination {...props} components={{}} />);

        expect(renderResult.queryByTestId('Page-1')).not.toBeInTheDocument();
        expect(
          renderResult.queryByTestId('custom-previous'),
        ).not.toBeInTheDocument();
        expect(
          renderResult.queryByTestId('custom-next'),
        ).not.toBeInTheDocument();
      });
    });

    describe('#getPageLabel', () => {
      it('should render custom page labels', () => {
        const pages = [{ label: '1' }, { label: '2' }];
        const getPageLabel = (page: { label: string }, index: number) =>
          `${page.label}-${index}`;
        const { renderResult, props } = setup({ pages, getPageLabel });

        [
          { page: '1-0', isSelected: true },
          { page: '2-1', isSelected: false },
        ].forEach(({ page, isSelected }) => {
          assertPageButtonRendering(renderResult, { page, isSelected });
        });

        const newGetPageLabel = (page: { label: string }, index: number) =>
          `${page.label}---${index}`;
        renderResult.rerender(
          <Pagination
            {...props}
            pages={pages}
            getPageLabel={newGetPageLabel}
          />,
        );

        [
          { page: '1---0', isSelected: true },
          { page: '2---1', isSelected: false },
        ].forEach(({ page, isSelected }) => {
          assertPageButtonRendering(renderResult, { page, isSelected });
        });
      });
    });

    describe('#i18n', () => {
      it('should apply different labels to navigation buttons', () => {
        const { renderResult, props } = setup({
          i18n: { prev: 'p', next: 'n' },
        });

        assertNavigationButtonRendering(renderResult, {
          label: 'p',
          isEnabled: false,
        });
        assertNavigationButtonRendering(renderResult, {
          label: 'n',
          isEnabled: true,
        });

        renderResult.rerender(
          <Pagination {...props} i18n={{ prev: 'pr', next: 'ne' }} />,
        );

        assertNavigationButtonRendering(renderResult, {
          label: 'pr',
          isEnabled: false,
        });
        assertNavigationButtonRendering(renderResult, {
          label: 'ne',
          isEnabled: true,
        });
      });
    });

    describe('#innerStyles', () => {
      it('should apply styles to container', () => {
        const { renderResult, props } = setup({
          innerStyles: { border: '1px solid red' },
        });

        expect(renderResult.container.firstElementChild).toHaveStyle(
          'border: 1px solid red',
        );

        renderResult.rerender(
          <Pagination {...props} innerStyles={{ top: '50px' }} />,
        );

        expect(renderResult.container.firstElementChild).not.toHaveStyle(
          'border: 1px solid red',
        );
        expect(renderResult.container.firstElementChild).toHaveStyle(
          'top: 50px',
        );
      });
    });

    describe('#max', () => {
      it('should hide pages when count is decreased', () => {
        const { renderResult, props } = setup({ max: 10 });

        [
          { page: '1', isSelected: true },
          { page: '2', isSelected: false },
          { page: '3', isSelected: false },
          { page: '4', isSelected: false },
          { page: '5', isSelected: false },
          { page: '6', isSelected: false },
          { page: '7', isSelected: false },
          { page: '8', isSelected: false },
          { page: '9', isSelected: false },
          { page: '10', isSelected: false },
        ].forEach(({ page, isSelected }) => {
          assertPageButtonRendering(renderResult, { page, isSelected });
        });

        expect(renderResult.queryByText('...')).not.toBeInTheDocument();

        renderResult.rerender(<Pagination {...props} max={8} />);

        [
          { page: '1', isSelected: true },
          { page: '2', isSelected: false },
          { page: '3', isSelected: false },
          { page: '4', isSelected: false },
          { page: '5', isSelected: false },
          { page: '6', isSelected: false },
          { page: '10', isSelected: false },
        ].forEach(({ page, isSelected }) => {
          assertPageButtonRendering(renderResult, { page, isSelected });
        });

        expect(renderResult.getByText('...')).toBeInTheDocument();

        ['7', '8', '9'].forEach(page => {
          expect(renderResult.queryByText(page)).not.toBeInTheDocument();
        });
      });
    });

    describe('#onChange', () => {
      it('should get called with new selected index when page is changed', () => {
        const onChange = jest.fn();
        const { renderResult, props } = setup({ onChange });

        fireEvent.click(renderResult.getByText('2'));

        expect(onChange.mock.calls[0][1]).toBe(2);

        const newOnChange = jest.fn();
        renderResult.rerender(<Pagination {...props} onChange={newOnChange} />);

        fireEvent.click(renderResult.getByText('4'));

        expect(newOnChange.mock.calls[0][1]).toBe(4);
      });
    });

    describe('#defaultSelectedIndex', () => {
      it('should not change when re-rendered', () => {
        const { renderResult, props } = setup({ defaultSelectedIndex: 1 });

        [{ page: '2', isSelected: true }].forEach(({ page, isSelected }) => {
          assertPageButtonRendering(renderResult, { page, isSelected });
        });

        renderResult.rerender(
          <Pagination {...props} defaultSelectedIndex={3} />,
        );

        [
          { page: '2', isSelected: true },
          { page: '4', isSelected: false },
        ].forEach(({ page, isSelected }) => {
          assertPageButtonRendering(renderResult, { page, isSelected });
        });
      });
    });

    describe('#selectedIndex', () => {
      it('should change when re-rendered', () => {
        const { renderResult, props } = setup({ selectedIndex: 1 });

        [{ page: '2', isSelected: true }].forEach(({ page, isSelected }) => {
          assertPageButtonRendering(renderResult, { page, isSelected });
        });

        renderResult.rerender(<Pagination {...props} selectedIndex={3} />);

        [
          { page: '2', isSelected: false },
          { page: '4', isSelected: true },
        ].forEach(({ page, isSelected }) => {
          assertPageButtonRendering(renderResult, { page, isSelected });
        });
      });
    });

    describe('#pages', () => {
      it('should re-render with new pages', () => {
        const { renderResult, props } = setup({ pages: [1, 2, 3] });

        [
          { page: '1', isSelected: true },
          { page: '2', isSelected: false },
          { page: '3', isSelected: false },
        ].forEach(({ page, isSelected }) => {
          assertPageButtonRendering(renderResult, { page, isSelected });
        });

        expect(renderResult.queryByText('4')).not.toBeInTheDocument();

        renderResult.rerender(<Pagination {...props} pages={[1, 2, 3, 4]} />);

        [
          { page: '1', isSelected: true },
          { page: '2', isSelected: false },
          { page: '3', isSelected: false },
          { page: '4', isSelected: false },
        ].forEach(({ page, isSelected }) => {
          assertPageButtonRendering(renderResult, { page, isSelected });
        });
      });
    });

    describe('#renderEllipsis', () => {
      it('should re-render with new ellipsis', () => {
        const { renderResult, props } = setup({
          renderEllipsis: jest.fn().mockReturnValue('...E...'),
        });

        expect(renderResult.getByText('...E...')).toBeInTheDocument();

        renderResult.rerender(
          <Pagination
            {...props}
            renderEllipsis={jest.fn().mockReturnValue('...Ell...')}
          />,
        );

        expect(renderResult.getByText('...Ell...')).toBeInTheDocument();
      });
    });
  });

  describe('interactions', () => {
    it('should render only left, current and right page along with 2 ellipsis when some middle page is clicked', () => {
      const onChange = jest.fn();
      const { renderResult } = setup({ onChange });

      fireEvent.click(renderResult.getByText('5'));

      expect(onChange.mock.calls[0][1]).toBe(5);

      [
        { page: '1', isSelected: false },
        { page: '4', isSelected: false },
        { page: '5', isSelected: true },
        { page: '6', isSelected: false },
        { page: '10', isSelected: false },
      ].forEach(({ page, isSelected }) => {
        assertPageButtonRendering(renderResult, { page, isSelected });
      });

      expect(renderResult.getAllByText('...').length).toBe(2);

      ['2', '3', '7', '8', '9'].forEach(page => {
        expect(renderResult.queryByText(page)).not.toBeInTheDocument();
      });
    });

    it('should render all the left pages when ellipsis is not required', () => {
      const onChange = jest.fn();
      const { renderResult } = setup({ onChange });

      fireEvent.click(renderResult.getByText('5'));
      fireEvent.click(renderResult.getByText('4'));

      expect(onChange.mock.calls[0][1]).toBe(5);
      expect(onChange.mock.calls[1][1]).toBe(4);

      [
        { page: '1', isSelected: false },
        { page: '2', isSelected: false },
        { page: '3', isSelected: false },
        { page: '4', isSelected: true },
        { page: '5', isSelected: false },
        { page: '10', isSelected: false },
      ].forEach(({ page, isSelected }) => {
        assertPageButtonRendering(renderResult, { page, isSelected });
      });

      expect(renderResult.getByText('...')).toBeInTheDocument();

      ['6', '7', '8', '9'].forEach(page => {
        expect(renderResult.queryByText(page)).not.toBeInTheDocument();
      });
    });

    it('should render all the right pages when ellipsis is not required', () => {
      const onChange = jest.fn();
      const { renderResult } = setup({ onChange });

      fireEvent.click(renderResult.getByText('5'));
      fireEvent.click(renderResult.getByText('6'));
      fireEvent.click(renderResult.getByText('7'));

      expect(onChange.mock.calls[0][1]).toBe(5);
      expect(onChange.mock.calls[1][1]).toBe(6);
      expect(onChange.mock.calls[2][1]).toBe(7);

      [
        { page: '1', isSelected: false },
        { page: '6', isSelected: false },
        { page: '7', isSelected: true },
        { page: '8', isSelected: false },
        // TODO: Uncomment below once we fix ellipsis bug: https://product-fabric.atlassian.net/browse/DST-2264
        // { page: '9', isSelected: false },
        { page: '10', isSelected: false },
      ].forEach(({ page, isSelected }) => {
        assertPageButtonRendering(renderResult, { page, isSelected });
      });

      // TODO: Replace below with `expect(renderResult.getByText('...')).toBeInTheDocument();`
      // once we fix ellipsis bug: https://product-fabric.atlassian.net/browse/DST-2264
      expect(renderResult.getAllByText('...')[0]).toBeInTheDocument();

      ['2', '3', '4', '5'].forEach(page => {
        expect(renderResult.queryByText(page)).not.toBeInTheDocument();
      });
    });

    it('should not change page when navigated backwards and first page is selected', () => {
      const onChange = jest.fn();
      const { renderResult } = setup({ onChange });
      [
        { page: '1', isSelected: true },
        { page: '2', isSelected: false },
      ].forEach(({ page, isSelected }) => {
        assertPageButtonRendering(renderResult, { page, isSelected });
      });
      assertNavigationButtonRendering(renderResult, {
        label: 'previous',
        isEnabled: false,
      });

      fireEvent.click(renderResult.getByLabelText('previous'));

      [
        { page: '1', isSelected: true },
        { page: '2', isSelected: false },
      ].forEach(({ page, isSelected }) => {
        assertPageButtonRendering(renderResult, { page, isSelected });
      });
      assertNavigationButtonRendering(renderResult, {
        label: 'previous',
        isEnabled: false,
      });

      expect(onChange).not.toHaveBeenCalled();
    });

    it('should change page when navigated forwards and first page is selected', () => {
      const onChange = jest.fn();
      const { renderResult } = setup({ onChange });
      [
        { page: '1', isSelected: true },
        { page: '2', isSelected: false },
      ].forEach(({ page, isSelected }) => {
        assertPageButtonRendering(renderResult, { page, isSelected });
      });
      assertNavigationButtonRendering(renderResult, {
        label: 'previous',
        isEnabled: false,
      });

      fireEvent.click(renderResult.getByLabelText('next'));

      [
        { page: '1', isSelected: false },
        { page: '2', isSelected: true },
      ].forEach(({ page, isSelected }) => {
        assertPageButtonRendering(renderResult, { page, isSelected });
      });
      assertNavigationButtonRendering(renderResult, {
        label: 'previous',
        isEnabled: true,
      });

      expect(onChange.mock.calls[0][1]).toBe(2);
    });

    it('should not change page when navigated forwards and last page is selected', () => {
      const onChange = jest.fn();
      const { renderResult } = setup({ onChange });

      fireEvent.click(renderResult.getByText('10'));

      onChange.mockReset();

      [
        { page: '9', isSelected: false },
        { page: '10', isSelected: true },
      ].forEach(({ page, isSelected }) => {
        assertPageButtonRendering(renderResult, { page, isSelected });
      });
      assertNavigationButtonRendering(renderResult, {
        label: 'next',
        isEnabled: false,
      });

      fireEvent.click(renderResult.getByLabelText('next'));

      [
        { page: '9', isSelected: false },
        { page: '10', isSelected: true },
      ].forEach(({ page, isSelected }) => {
        assertPageButtonRendering(renderResult, { page, isSelected });
      });
      assertNavigationButtonRendering(renderResult, {
        label: 'next',
        isEnabled: false,
      });

      expect(onChange).not.toHaveBeenCalled();
    });

    it('should change page when navigated backwards and last page is selected', () => {
      const onChange = jest.fn();
      const { renderResult } = setup({ onChange });

      fireEvent.click(renderResult.getByText('10'));

      onChange.mockReset();

      [
        { page: '9', isSelected: false },
        { page: '10', isSelected: true },
      ].forEach(({ page, isSelected }) => {
        assertPageButtonRendering(renderResult, { page, isSelected });
      });
      assertNavigationButtonRendering(renderResult, {
        label: 'next',
        isEnabled: false,
      });

      fireEvent.click(renderResult.getByLabelText('previous'));

      [
        { page: '9', isSelected: true },
        { page: '10', isSelected: false },
      ].forEach(({ page, isSelected }) => {
        assertPageButtonRendering(renderResult, { page, isSelected });
      });
      assertNavigationButtonRendering(renderResult, {
        label: 'next',
        isEnabled: true,
      });

      expect(onChange.mock.calls[0][1]).toBe(9);
    });
  });
});
