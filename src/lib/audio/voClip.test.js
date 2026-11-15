/** @jest-environment jsdom */
import { getVoClipUrl, getVoClipUrlByName, primeVoClips, shouldSilenceTts, playVoClip, normalizeVoText } from './voClip';

describe('voClip', () => {
  test('no manifest loaded -> no clip, never throws', () => {
    expect(getVoClipUrl('Let’s find my favorites, then yours.')).toBeNull();
    expect(getVoClipUrlByName('hut-food-01')).toBeNull();
  });

  test('manifest listing a clip makes that exact line resolve (curly/straight apostrophe, spacing)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ files: ['hut-food-01'] }),
    });
    await primeVoClips();
    expect(getVoClipUrlByName('hut-food-01')).toBe('/audio/hut-food-01.mp3');
    expect(getVoClipUrl('Let’s find my favorites, then yours.')).toBe('/audio/hut-food-01.mp3');
    expect(getVoClipUrl("  let's FIND my favorites,  then yours. ")).toBe('/audio/hut-food-01.mp3');
    expect(getVoClipUrlByName('hut-food-02')).toBeNull();
  });

  test('Sanskrit lines are silenced for TTS, plain English is not', () => {
    expect(shouldSilenceTts('Mahakaya! You made space so everyone could come along.')).toBe(true);
    expect(shouldSilenceTts('Remember Sarvakaryeshu.')).toBe(true);
    expect(shouldSilenceTts('Kuru Me Deva! old respelling')).toBe(true);
    expect(shouldSilenceTts('Tap the symbols to learn about them.')).toBe(false);
    expect(shouldSilenceTts('')).toBe(false);
  });

  test('playVoClip fires onEnd exactly once on error and on stop()', () => {
    const instances = [];
    global.Audio = function (src) { this.src = src; this.play = () => Promise.resolve(); this.pause = () => {}; instances.push(this); };
    const onEnd = jest.fn();
    const clip = playVoClip('/audio/x.mp3', { onEnd });
    instances[0].onerror();
    clip.stop(true);
    expect(onEnd).toHaveBeenCalledTimes(1);

    const onEnd2 = jest.fn();
    const clip2 = playVoClip('/audio/y.mp3', { onEnd: onEnd2 });
    clip2.stop(false); // mute / unmount path: silent, no callback
    instances[1].onended?.();
    expect(onEnd2).not.toHaveBeenCalled();
  });

  test('normalize', () => { expect(normalizeVoText('  It’s  ON ')).toBe("it's on"); });

  test('first tap unlocks the shared players; later clips reuse them instead of creating new ones', async () => {
    const instances = [];
    global.Audio = function () {
      this.paused = true; this.ended = false;
      this.play = jest.fn(() => { this.paused = false; return Promise.resolve(); });
      this.pause = jest.fn(() => { this.paused = true; });
      this.addEventListener = () => {};
      instances.push(this);
    };
    let fresh; jest.isolateModules(() => { fresh = require('./voClip'); });
    const { installAudioUnlock, acquireVoiceAudio } = fresh;
    installAudioUnlock();
    document.dispatchEvent(new Event('click'));
    await Promise.resolve(); await Promise.resolve();
    expect(instances.length).toBe(4);
    instances.forEach((a) => expect(a.play).toHaveBeenCalledTimes(1)); // silent clip, inside the tap

    const before = instances.length;
    const a1 = acquireVoiceAudio('/audio/a.mp3', 0.5);
    expect(instances).toContain(a1);
    expect(a1.src).toBe('/audio/a.mp3');
    expect(a1.volume).toBe(0.5);
    a1.paused = false; // playing: busy
    const a2 = acquireVoiceAudio('/audio/b.mp3');
    expect(a2).not.toBe(a1);
    a1.paused = true; // stopped: free again, reused
    a1.ended = true;
    const a3 = acquireVoiceAudio('/audio/c.mp3');
    expect(instances.length).toBe(before); // never made a new element
    expect([a1, a2].includes(a3) || instances.includes(a3)).toBe(true);
  });

  test('a refused clip is logged and still ends the line once', async () => {
    global.Audio = function () {
      this.paused = true; this.ended = false;
      this.play = () => Promise.reject(Object.assign(new Error('blocked'), { name: 'NotAllowedError' }));
      this.pause = () => {}; this.addEventListener = () => {};
    };
    let fresh; jest.isolateModules(() => { fresh = require('./voClip'); });
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const onEnd = jest.fn();
    fresh.playVoClip('/audio/z.mp3', { onEnd });
    await Promise.resolve(); await Promise.resolve();
    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(window.__voClipLog.some((e) => e.reason === 'NotAllowedError')).toBe(true);
    warn.mockRestore();
  });
});
