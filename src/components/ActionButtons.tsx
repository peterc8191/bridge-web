import "./ActionButtons.css";

interface ActionButtonsProps {
  onPass: () => void;
  onLike: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
}

export function ActionButtons({ onPass, onLike, onUndo, canUndo = false }: ActionButtonsProps) {
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
      {onUndo && (
        <button
          type="button"
          className="action-buttons__btn action-buttons__btn--undo"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Undo last swipe"
        >
          ↺
        </button>
      )}
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
