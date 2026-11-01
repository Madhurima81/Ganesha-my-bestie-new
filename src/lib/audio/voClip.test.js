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
});
