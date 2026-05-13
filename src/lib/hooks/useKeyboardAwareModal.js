import { useEffect, useMemo, useState } from 'react';

const MAX_LIFT_PX = 320;

const getKeyboardInset = () => {
  if (typeof window === 'undefined') return 0;

  const vv = window.visualViewport;
  if (!vv) return 0;

  const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
  return inset;
};

const useKeyboardAwareModal = () => {
  const [keyboardInset, setKeyboardInset] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const update = () => {
      setKeyboardInset(getKeyboardInset());
    };

    update();

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', update);
      vv.addEventListener('scroll', update);
    }
    window.addEventListener('resize', update);

    return () => {
      if (vv) {
        vv.removeEventListener('resize', update);
        vv.removeEventListener('scroll', update);
      }
      window.removeEventListener('resize', update);
    };
  }, []);

  const modalStyle = useMemo(() => {
    const lift = Math.min(MAX_LIFT_PX, Math.max(0, keyboardInset * 0.5));
    return {
      marginBottom: lift > 0 ? `${lift}px` : undefined,
      transition: 'margin-bottom 160ms ease-out'
    };
  }, [keyboardInset]);

  return { modalStyle, keyboardInset };
};

export default useKeyboardAwareModal;
