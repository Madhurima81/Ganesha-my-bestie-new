import { createFirstLineWatchController } from './useFirstLineWatch';
import { createGuardedRevealController } from './useGuardedReveal';

const makeWatchdog = () => {
  const watchdog = {
    armed: new Map(),
    disarmed: [],
    arm(name, ms, recover) {
      this.armed.set(name, { ms, recover });
    },
    disarm(name) {
      this.disarmed.push(name);
      this.armed.delete(name);
    },
    fire(name) {
      this.armed.get(name)?.recover?.();
    },
  };
  return watchdog;
};

describe('watchdog helper controllers', () => {
  test('a late original reveal after watchdog recovery does not show a second card', () => {
    const watchdog = makeWatchdog();
    let revealConfig = null;
    const shown = [];
    const controller = createGuardedRevealController({
      sceneKey: 'test-scene',
      getRevealConfig: () => revealConfig,
      setRevealConfig: (config) => {
        revealConfig = config;
        shown.push(config.symbolId);
      },
      armWatchdog: watchdog.arm.bind(watchdog),
      disarmWatchdog: watchdog.disarm.bind(watchdog),
      log: () => {},
    });

    controller.expectReveal('eyes', { symbolId: 'eyes' });
    watchdog.fire('reveal-card');
    expect(shown).toEqual(['eyes']);

    revealConfig = null;
    expect(controller.showRevealOnce('eyes', { symbolId: 'eyes' }, 'late-original')).toBe(false);
    expect(shown).toEqual(['eyes']);
  });

  test('markShown disarms the reveal watchdog', () => {
    const watchdog = makeWatchdog();
    const controller = createGuardedRevealController({
      sceneKey: 'test-scene',
      getRevealConfig: () => null,
      setRevealConfig: () => {},
      armWatchdog: watchdog.arm.bind(watchdog),
      disarmWatchdog: watchdog.disarm.bind(watchdog),
      log: () => {},
    });

    controller.expectReveal('nirvighnam', { symbolId: 'nirvighnam' });
    controller.markShown('nirvighnam');
    expect(watchdog.disarmed).toContain('reveal-card');
    expect(controller.getShown().has('nirvighnam')).toBe(true);
  });

  test('resetReveals clears guards and stops the reveal watch', () => {
    const watchdog = makeWatchdog();
    const shown = [];
    const controller = createGuardedRevealController({
      sceneKey: 'test-scene',
      getRevealConfig: () => null,
      setRevealConfig: (config) => shown.push(config.symbolId),
      armWatchdog: watchdog.arm.bind(watchdog),
      disarmWatchdog: watchdog.disarm.bind(watchdog),
      log: () => {},
    });

    controller.showRevealOnce('tusk', { symbolId: 'tusk' });
    expect(controller.showRevealOnce('tusk', { symbolId: 'tusk' })).toBe(false);
    controller.resetReveals();
    expect(controller.showRevealOnce('tusk', { symbolId: 'tusk' })).toBe(true);

    expect(shown).toEqual(['tusk', 'tusk']);
    expect(watchdog.disarmed).toContain('reveal-card');
  });

  test('first-line watch recovers once through the watchdog and stops after disarm', () => {
    const watchdog = makeWatchdog();
    let recoveries = 0;
    const controller = createFirstLineWatchController({
      sceneKey: 'test-scene',
      armWatchdog: watchdog.arm.bind(watchdog),
      disarmWatchdog: watchdog.disarm.bind(watchdog),
      log: () => {},
    });

    controller.arm({ id: 'mount', recover: () => { recoveries += 1; } });
    watchdog.fire('first-line');
    expect(recoveries).toBe(1);

    controller.disarm('mount');
    watchdog.fire('first-line');
    expect(recoveries).toBe(1);
  });

  test('a real line start cancels recovery, while a missing start replays once', () => {
    const watchdog = makeWatchdog();
    let recoveries = 0;
    const controller = createFirstLineWatchController({
      sceneKey: 'test-scene',
      armWatchdog: watchdog.arm.bind(watchdog),
      disarmWatchdog: watchdog.disarm.bind(watchdog),
      log: () => {},
    });

    controller.arm({ id: 'started-line', recover: () => { recoveries += 1; } });
    controller.markStarted('started-line');
    watchdog.fire('first-line');
    expect(recoveries).toBe(0);

    controller.arm({ id: 'dropped-line', recover: () => { recoveries += 1; } });
    watchdog.fire('first-line');
    expect(recoveries).toBe(1);
  });

  test('stop/unmount guard prevents recovery and new reveal work', () => {
    const watchdog = makeWatchdog();
    let stopped = false;
    let recoveries = 0;
    const revealController = createGuardedRevealController({
      sceneKey: 'test-scene',
      getRevealConfig: () => null,
      setRevealConfig: () => {},
      armWatchdog: watchdog.arm.bind(watchdog),
      disarmWatchdog: watchdog.disarm.bind(watchdog),
      isStopped: () => stopped,
      log: () => {},
    });
    const firstLineController = createFirstLineWatchController({
      sceneKey: 'test-scene',
      armWatchdog: watchdog.arm.bind(watchdog),
      disarmWatchdog: watchdog.disarm.bind(watchdog),
      isStopped: () => stopped,
      log: () => {},
    });

    revealController.expectReveal('ear', { symbolId: 'ear' });
    firstLineController.arm({ id: 'continue', recover: () => { recoveries += 1; } });
    stopped = true;

    watchdog.fire('reveal-card');
    watchdog.fire('first-line');

    expect(revealController.showRevealOnce('eyes', { symbolId: 'eyes' })).toBe(false);
    expect(recoveries).toBe(0);
  });
});
