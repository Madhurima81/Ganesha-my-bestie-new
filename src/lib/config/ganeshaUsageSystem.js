export const GANESHA_POSE_ASSETS = {
  sitHi: '/images/ganesha-poses/sit-hi.webp',
  sitModak: '/images/ganesha-poses/sit-modak.webp',
  sitFull: '/images/ganesha-poses/sit-full.webp',
  standPoint: '/images/ganesha-poses/stand-point.webp',
  standNamaste: '/images/ganesha-poses/stand-namaste.webp',
  standWelcome: '/images/ganesha-poses/stand-welcome.webp',
  standCelebrate: '/images/ganesha-poses/stand-celebrate.webp',
  celebrate: '/images/ganesha-poses/celebrate.webp',
  // Blinking GIFs (2.5 s rest on eyes-open between blinks): closing modal + loading, opening modal, end of the intro story.
  sitModakBlink: '/images/ganesha-poses/sit-modak-blink-anim.webp',
  standPointBlink: '/images/ganesha-poses/stand-point-blink-anim.webp',
  standNamasteBlink: '/images/ganesha-poses/stand-namaste-blink-anim.webp'
};

export const GANESHA_USAGE_SYSTEM = {
  loading: { asset: GANESHA_POSE_ASSETS.sitModakBlink },   // same Ganesha as the closing modal
  startJourney: { asset: GANESHA_POSE_ASSETS.standNamasteBlink },
  profileSetup: { asset: GANESHA_POSE_ASSETS.sitHi },
  zoneOverviewBadge: { pose: 'pointing' },
  zoneCompletion: { pose: 'celebration', asset: GANESHA_POSE_ASSETS.celebrate },
  normalSceneCompletion: { asset: GANESHA_POSE_ASSETS.sitModakBlink }
};
