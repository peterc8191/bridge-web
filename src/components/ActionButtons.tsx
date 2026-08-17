import "./ActionButtons.css";

interface ActionButtonsProps {
  onPass: () => void;
  onLike: () => void;
}

export function ActionButtons({ onPass, onLike }: ActionButtonsProps) {
  return (
    <div className="action-buttons">
      <button
        type="button"
        className="action-buttons__btn action-buttons__btn--pass"
        onClick={onPass}
        aria-label="Pass on this property"
      >
        ✕
      </button>
      <button
        type="button"
        className="action-buttons__btn action-buttons__btn--like"
        onClick={onLike}
        aria-label="Save this property"
      >
        ♥
      </button>
    </div>
  );
}
