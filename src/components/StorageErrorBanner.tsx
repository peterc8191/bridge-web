import { useEffect, useState } from "react";
import { STORAGE_ERROR_EVENT } from "../lib/storage";
import "./StorageErrorBanner.css";

/** Tells the user when a change couldn't be saved (storage full or blocked). */
export function StorageErrorBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => setVisible(true);
    window.addEventListener(STORAGE_ERROR_EVENT, show);
    return () => window.removeEventListener(STORAGE_ERROR_EVENT, show);
  }, []);

  if (!visible) return null;

  return (
    <div className="storage-error-banner" role="alert">
      <span>
        Your latest change couldn't be saved - this browser's storage is full or blocked. Try removing
        some uploaded listing photos.
      </span>
      <button type="button" onClick={() => setVisible(false)} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}
