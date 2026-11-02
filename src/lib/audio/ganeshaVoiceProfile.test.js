import { pickGaneshaVoice, ganeshaSpeechSettings, prepareGaneshaText, applyGaneshaVoice } from './ganeshaVoiceProfile';

describe('ganeshaVoiceProfile', () => {
  it('picks the first wishlist voice the browser has, else null', () => {
    const voices = [{ name: 'Microsoft Zira' }, { name: 'Microsoft David Desktop' }, { name: 'Google UK English Male' }];
    expect(pickGaneshaVoice(voices).name).toBe('Google UK English Male'); // earlier in the wishlist than David
    expect(pickGaneshaVoice([{ name: 'Microsoft Zira' }])).toBeNull();
    expect(pickGaneshaVoice([])).toBeNull();
  });

  it('defaults to the age 7 child profile the later games use', () => {
    const s = ganeshaSpeechSettings();
    expect(s.rate).toBeCloseTo(1.0, 5);
    expect(s.pitch).toBeCloseTo(1.18, 5);
    expect(s.volume).toBeCloseTo(0.75, 5);
  });

  it('respells names unless the voice is Rishi, and adds pauses', () => {
    expect(prepareGaneshaText('Hello Mooshika — come', null)).toBe('Hello Moo shika, come');
    expect(prepareGaneshaText('Hello Mooshika', { name: 'Rishi' })).toBe('Hello Mooshika');
  });

  it('sets the voice when there is one, Indian English when not', () => {
    const withVoice = applyGaneshaVoice({}, { name: 'Daniel' });
    expect(withVoice.voice.name).toBe('Daniel');
    expect(withVoice.lang).toBeUndefined();
    const without = applyGaneshaVoice({}, null);
    expect(without.lang).toBe('en-IN');
    expect(without.voice).toBeUndefined();
    expect(without.rate).toBeCloseTo(1.0, 5);
  });
});
