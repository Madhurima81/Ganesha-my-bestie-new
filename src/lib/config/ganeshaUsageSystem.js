export const GANESHA_POSE_ASSETS = {
  sitHi: '/images/ganesha-poses/sit-hi.png',
  sitModak: '/images/ganesha-poses/sit-modak.png',
  sitFull: '/images/ganesha-poses/sit-full.png',
  standPoint: '/images/ganesha-poses/stand-point.png',
  standNamaste: '/images/ganesha-poses/stand-namaste.png',
  standWelcome: '/images/ganesha-poses/stand-welcome.png',
  standCelebrate: '/images/ganesha-poses/stand-celebrate.png',
  celebrate: '/images/ganesha-poses/celebrate.png'
};

export const GANESHA_USAGE_SYSTEM = {
  loading: { asset: GANESHA_POSE_ASSETS.sitHi },
  startJourney: { asset: GANESHA_POSE_ASSETS.standNamaste },
  profileSetup: { asset: GANESHA_POSE_ASSETS.sitHi },
  zoneOverviewBadge: { pose: 'pointing' },
  zoneCompletion: { pose: 'celebration', asset: GANESHA_POSE_ASSETS.celebrate },
  normalSceneCompletion: { asset: GANESHA_POSE_ASSETS.sitModak }
};
