import './InvitationCues.css';

export default function InvitationCue({ symbolId }) {
  switch (symbolId) {
    case 'modak':
      return <div className="cue cue-modak" aria-hidden="true"><div className="orb" /></div>;

    case 'mooshika':
      return <div className="cue cue-mooshika" aria-hidden="true"><div className="ring" /></div>;

    case 'belly':
      return <div className="cue cue-belly" aria-hidden="true"><div className="breath" /></div>;

    case 'lotus':
      return (
        <div className="cue cue-lotus" aria-hidden="true">
          <div className="bloomWrap">
            <span className="petal" />
            <span className="petal" />
            <span className="petal" />
            <span className="petal" />
            <span className="petal" />
          </div>
        </div>
      );

    case 'trunk':
      return (
        <div className="cue cue-trunk" aria-hidden="true">
          <svg viewBox="0 0 110 80">
            <rect x="50" y="34" width="10" height="22" rx="3" fill="#888780" />
            <path className="around" d="M10,60 Q55,-10 100,60" />
          </svg>
        </div>
      );

    case 'eyes':
      return <div className="cue cue-eyes" aria-hidden="true"><div className="dot" /></div>;

    case 'ears':
      return (
        <div className="cue cue-ears" aria-hidden="true">
          <span className="wave" />
          <span className="wave" />
          <span className="wave" />
        </div>
      );

    case 'tusk':
      return (
        <div className="cue cue-tusk" aria-hidden="true">
          <svg viewBox="0 0 100 100">
            <circle className="arc" cx="50" cy="50" r="45" />
          </svg>
        </div>
      );

    default:
      return null;
  }
}
