import type { ResolvedTheme, Theme } from "../types/settings";
import "./Settings.css";

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: "system", label: "Match system" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

interface SettingsProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
  reduceMotion: boolean;
  onReduceMotionChange: (reduceMotion: boolean) => void;
  onResetProperties: () => void;
  onClearIssues: () => void;
}

export function Settings({
  theme,
  onThemeChange,
  resolvedTheme,
  reduceMotion,
  onReduceMotionChange,
  onResetProperties,
  onClearIssues,
}: SettingsProps) {
  const handleResetProperties = () => {
    if (window.confirm("Reset your saved and passed properties? This can't be undone.")) {
      onResetProperties();
    }
  };

  const handleClearIssues = () => {
    if (window.confirm("Delete all issues you've reported? This can't be undone.")) {
      onClearIssues();
    }
  };

  return (
    <main className="settings-page">
      <section className="settings-section">
        <h2>Appearance</h2>
        <fieldset className="settings-theme">
          <legend className="settings-visually-hidden">Theme</legend>
          {THEME_OPTIONS.map((option) => (
            <label key={option.value} className="settings-theme__option">
              <input
                type="radio"
                name="theme"
                value={option.value}
                checked={theme === option.value}
                onChange={() => onThemeChange(option.value)}
              />
              {option.label}
            </label>
          ))}
        </fieldset>
        {theme === "system" && (
          <p className="settings-hint">Currently using {resolvedTheme} based on your system.</p>
        )}
      </section>

      <section className="settings-section">
        <h2>Accessibility</h2>
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={(event) => onReduceMotionChange(event.target.checked)}
          />
          Reduce motion
        </label>
        <p className="settings-hint">Turns off the swipe and card animations on the Discover screen.</p>
      </section>

      <section className="settings-section">
        <h2>Your data</h2>
        <div className="settings-actions">
          <button type="button" className="settings-danger-btn" onClick={handleResetProperties}>
            Reset saved &amp; passed properties
          </button>
          <button type="button" className="settings-danger-btn" onClick={handleClearIssues}>
            Clear reported issues
          </button>
        </div>
        <p className="settings-hint">
          Everything here lives only in this browser (no account, no server) - these actions can't be
          undone.
        </p>
      </section>
    </main>
  );
}
