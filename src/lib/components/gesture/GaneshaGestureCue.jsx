import './GaneshaGestureCue.css';

const GESTURE_ICON_MAP = {
  thumbsup: '/images/hand-thumbsup.svg',
  ok: '/images/hand-ok.svg',
  fist: '/images/hand-fist.svg',
  victory: '/images/hand-victory.svg',
  // No dedicated blessing hand asset exists yet, so use the closest
  // friendly/open cue instead of rendering the full Ganesha figure.
  blessing: '/images/hand-ok.svg',
};

export default function GaneshaGestureCue({
  gestureType = 'thumbsup',
  position = 'item',
  size = 120,
}) {
  const gestureIcon = GESTURE_ICON_MAP[gestureType] || GESTURE_ICON_MAP.thumbsup;

  return (
    <div
      className={`ganesha-gesture-cue ganesha-gesture-cue--${position}`}
      style={{
        width: size,
        height: size,
      }}
      aria-hidden="true"
    >
      <img
        className="ganesha-gesture-cue__icon"
        src={gestureIcon}
        alt=""
        draggable="false"
      />
    </div>
  );
}
