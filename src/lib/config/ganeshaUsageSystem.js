export const GANESHA_POSE_ASSETS = {
  sitHi: '/images/ganesha-poses/sit-hi.webp',
  sitModak: '/images/ganesha-poses/sit-modak.webp',
  sitFull: '/images/ganesha-poses/sit-full.webp',
  standPoint: '/images/ganesha-poses/stand-point.webp',
  standNamaste: '/images/ganesha-poses/stand-namaste.webp',
  standWelcome: '/images/ganesha-poses/stand-welcome.webp',
  standCelebrate: '/images/ganesha-poses/stand-celebrate.webp',
  celebrate: '/images/ganesha-poses/celebrate.webp'
};

export const GANESHA_USAGE_SYSTEM = {
  loading: { asset: GANESHA_POSE_ASSETS.sitHi },
  startJourney: { asset: GANESHA_POSE_ASSETS.standNamaste },
  profileSetup: { asset: GANESHA_POSE_ASSETS.sitHi },
  zoneOverviewBadge: { pose: 'pointing' },
  zoneCompletion: { pose: 'celebration', asset: GANESHA_POSE_ASSETS.celebrate },
  normalSceneCompletion: { asset: GANESHA_POSE_ASSETS.sitModak }
};
