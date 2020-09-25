import React from 'react';
import { render } from '@testing-library/react';

import { withAppContext } from 'test/utils';

import { INCIDENT_URL } from 'signals/incident-management/routes';
import childIncidentsFixture from 'utils/__tests__/fixtures/childIncidents.json';

import ChildIncidents, { STATUS_RESPONSE_REQUIRED, STATUS_NONE } from '..';

const getChildren = (opts = {}) => {
  const options = { ...{ numValues: 4, withHref: true, withStatus: true }, ...opts };

  return childIncidentsFixture.results.map(({ status, category, id }) => {
    const values = {
      id,
      status: status.state_display,
      category: `${category.sub} (${category.departments})`,
    };

    return {
      href: options.withHref ? `${INCIDENT_URL}/${id}` : undefined,
      status: options.withStatus ? STATUS_RESPONSE_REQUIRED : STATUS_NONE,
      values,
    };
  });
};

describe('components/ChildIncidents', () => {
  it('should render a list', () => {
    const children = getChildren();
    const { getByTestId } = render(withAppContext(<ChildIncidents incidents={children} />));

    const list = getByTestId('childIncidents');

    expect(list).toBeInTheDocument();
    expect(list.nodeName).toEqual('UL');
    expect(document.querySelectorAll('li')).toHaveLength(children.length);
  });

  it('should render links', () => {
    const children = getChildren();
    const { container, rerender } = render(withAppContext(<ChildIncidents incidents={children} />));

    expect(container.querySelectorAll('a').length).toBeGreaterThan(0);

    rerender(withAppContext(<ChildIncidents incidents={getChildren({ withHref: false })} />));

    expect(container.querySelectorAll('a').length).toEqual(0);
  });

  it('should show a status incidator', () => {
    const children = getChildren();
    const { container, rerender } = render(withAppContext(<ChildIncidents incidents={children} />));

    container.querySelectorAll('li').forEach(element => {
      expect(element).toHaveStyleRule('border-right', '2px solid white', {
        modifier: '::before',
      });
    });

    rerender(withAppContext(<ChildIncidents incidents={getChildren({ withStatus: false })} />));

    container.querySelectorAll('li').forEach(element => {
      expect(element).not.toHaveStyleRule('border-right', '2px solid white', {
        modifier: '::before',
      });
    });
  });
});
