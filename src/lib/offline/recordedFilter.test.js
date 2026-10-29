import { applyRecorded, keyOfUrl } from './recordedFilter';

describe('keyOfUrl', () => {
  it('drops the build hash from /assets files and keeps other paths', () => {
    expect(keyOfUrl('/assets/pond-big-rock-BNd6qRWB.webp')).toBe('pond-big-rock.webp');
    expect(keyOfUrl('/assets/nest-0-CIgf76i6.webp')).toBe('nest-0.webp');
    expect(keyOfUrl('/assets/ganesha-belly-BZ_Ibem-.png')).toBe('ganesha-belly.png');
    expect(keyOfUrl('/assets/family%20tree%20bg-C5hMeNO9.webp')).toBe('family tree bg.webp');
    expect(keyOfUrl('/images/map/lock.webp')).toBe('/images/map/lock.webp');
  });
});

describe('applyRecorded', () => {
  const file = (u, s = 100) => ({ u, s });
  const manifest = {
    files: [
      file('/assets/index-AAAAAAAA.js'), file('/assets/pond-flower-2-BBBBBBBB.webp'), file('/assets/old-lotus-CCCCCCCC.png'),
      file('/images/map/lock.webp'), file('/images/old-thing.webp'), file('/audio/words/vakratunda.mp3'),
    ],
  };

  it('keeps code and audio, keeps recorded pictures, drops pictures nobody saw', () => {
    const r = applyRecorded(manifest, ['pond-flower-2.webp', '/images/map/lock.webp']);
    expect(r.manifest.files.map((f) => f.u)).toEqual([
      '/assets/index-AAAAAAAA.js', '/assets/pond-flower-2-BBBBBBBB.webp', '/audio/words/vakratunda.mp3', '/images/map/lock.webp',
    ]);
    expect(r.dropped).toBe(2);
    expect(r.droppedBytes).toBe(200);
  });

  it('adds a recorded picture the import graph missed (built asset and public file)', () => {
    const r = applyRecorded(manifest, ['pond-flower-2.webp', 'twin.png', '/images/new-bg.webp'], {
      assetFiles: [file('/assets/twin-DDDDDDDD.png', 50)],
      publicSize: (p) => (p === '/images/new-bg.webp' ? 70 : 0),
    });
    const urls = r.manifest.files.map((f) => f.u);
    expect(urls).toContain('/assets/twin-DDDDDDDD.png');
    expect(urls).toContain('/images/new-bg.webp');
    expect(r.added).toBe(2);
    expect(r.notFound).toEqual([]);
  });

  it('reports a recorded picture that is nowhere in the build', () => {
    const r = applyRecorded(manifest, ['gone.webp']);
    expect(r.notFound).toEqual(['gone.webp']);
  });

  it('gives a new version when the list changes', () => {
    const a = applyRecorded(manifest, ['pond-flower-2.webp']).manifest.version;
    const b = applyRecorded(manifest, ['pond-flower-2.webp', '/images/map/lock.webp']).manifest.version;
    expect(a).not.toBe(b);
  });
});
