import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { withAppContext } from 'test/utils';

import Modal from '../';

describe.skip('components/Modal', () => {
  afterEach(cleanup);

  it('should not render', () => {
    const { container } = render(
      withAppContext(<Modal isOpen={false} title="Modal" />),
    );

    expect(container.firstChild).toBeNull();
  });

  it('should have a heading', () => {
    const { container } = render(
      withAppContext(<Modal isOpen title="Modal" />),
    );

    expect(container.querySelector('h2')).not.toBeNull();
  });

  it('should call onClose', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      withAppContext(<Modal isOpen onClose={onClose} title="Modal" />),
    );

    fireEvent(
      getByTestId('closeBtn'),
      new MouseEvent('click', { bubbles: true }),
    );

    expect(onClose).toHaveBeenCalled();
  });
});
