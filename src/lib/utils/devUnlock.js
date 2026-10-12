// Dev-only switch: unlock every zone and every scene so a tester can jump straight to Shloka River /
// About Me Hut without playing through Symbol Mountain. Never active in a production build.
//
//   turn on :  http://localhost:5173/?unlockall=1      (remembered in this browser)
//   turn off:  http://localhost:5173/?unlockall=0
const KEY = 'gmb_dev_unlock_all';

export const isDevUnlockAll = () => {
  if (!import.meta.env.DEV) return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('unlockall') === '0') {
      localStorage.removeItem(KEY);
      return false;
    }
    if (params.has('unlockall')) {
      localStorage.setItem(KEY, '1');
      return true;
    }
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};
