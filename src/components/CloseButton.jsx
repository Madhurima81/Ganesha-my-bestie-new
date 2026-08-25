import './CloseButton.css';

export default function CloseButton({ onClose, label = 'Close dialog', className = '' }) {
  const handle = () => {
    window.speechSynthesis?.cancel?.();
    onClose?.();
  };

  return (
    <button
      type="button"
      className={`gmb-close-btn ${className}`.trim()}
      onClick={handle}
      aria-label={label}
    >
      <span className="gmb-close-btn__icon" aria-hidden="true" />
    </button>
  );
}
