import './AboutMeGaneshaHost.css';

const AboutMeGaneshaHost = ({
  image,
  alt = 'Ganesha',
  className = '',
  restartKey,
}) => {
  if (!image) return null;

  return (
    <div className={`about-me-ganesha-host ${className}`.trim()} aria-hidden="true">
      {/* a changing restartKey remounts the picture, so an animated Ganesha replays from its first frame */}
      <img key={restartKey} src={image} alt={alt} />
    </div>
  );
};

export default AboutMeGaneshaHost;
