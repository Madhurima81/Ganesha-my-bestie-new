import { markHomeFromCompletion, consumeHomeFromCompletion } from './zoneNavigationState';

describe('home from completion mark', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-11-04T10:00:00Z'));
  });
  afterEach(() => jest.useRealTimers());

  test('is false when nothing was marked', () => {
    expect(consumeHomeFromCompletion()).toBe(false);
  });

  test('is true once, then gone', () => {
    markHomeFromCompletion();
    expect(consumeHomeFromCompletion()).toBe(true);
    expect(consumeHomeFromCompletion()).toBe(false);
  });

  test('a mark that was never consumed expires, so it cannot leak into a later zone-badge visit', () => {
    markHomeFromCompletion();
    jest.setSystemTime(new Date('2026-11-04T10:00:10Z'));
    expect(consumeHomeFromCompletion()).toBe(false);
    expect(sessionStorage.getItem('gmb_home_from_completion')).toBeNull();
  });
});
