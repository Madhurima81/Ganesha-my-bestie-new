import './AboutMeGaneshaHost.css';

const AboutMeGaneshaHost = ({
  image,
  alt = 'Ganesha',
  className = '',
}) => {
  if (!image) return null;

  return (
    <div className={`about-me-ganesha-host ${className}`.trim()} aria-hidden="true">
      <img src={image} alt={alt} />
    </div>
  );
};

export default AboutMeGaneshaHost;
