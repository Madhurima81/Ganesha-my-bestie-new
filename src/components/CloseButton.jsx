import './CloseButton.css';

export default function CloseButton({ onClose, label = 'Close dialog' }) {
  const handle = () => {
    window.speechSynthesis?.cancel?.();
    onClose?.();
  };

  return (
    <button
      type="button"
      className="gmb-close-btn"
      onClick={handle}
      aria-label={label}
    >
      ✕
    </button>
  );
}
