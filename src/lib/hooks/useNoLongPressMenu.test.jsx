import React, { useRef } from 'react';
import { render } from '@testing-library/react';
import useNoLongPressMenu from './useNoLongPressMenu';

function Stage() {
  const ref = useRef(null);
  useNoLongPressMenu(ref);
  return (
    <div ref={ref} data-testid="stage">
      <div data-testid="shadow" />
      <button data-testid="btn">hint</button>
    </div>
  );
}

const touch = (el) => {
  const ev = new Event('touchstart', { bubbles: true, cancelable: true });
  el.dispatchEvent(ev);
  return ev.defaultPrevented;
};

test('blocks the long-press menu on the stage background', () => {
  const { getByTestId } = render(<Stage />);
  expect(touch(getByTestId('shadow'))).toBe(true);
  expect(touch(getByTestId('stage'))).toBe(true);
});

test('leaves real buttons alone so taps still work', () => {
  const { getByTestId } = render(<Stage />);
  expect(touch(getByTestId('btn'))).toBe(false);
});

test('cancels the context menu event', () => {
  const { getByTestId } = render(<Stage />);
  const ev = new Event('contextmenu', { bubbles: true, cancelable: true });
  getByTestId('shadow').dispatchEvent(ev);
  expect(ev.defaultPrevented).toBe(true);
});
