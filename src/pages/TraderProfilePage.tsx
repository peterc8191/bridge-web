import { useState, type FormEvent } from "react";
import { useAppData } from "../context/appDataContext";
import "./TraderProfilePage.css";

// Tradesperson-only (guarded in App.tsx).
export function TraderProfilePage() {
  const { traderProfile: profile, updateTraderProfile: onUpdateProfile } = useAppData();
  const [bio, setBio] = useState(profile.bio);
  const [servicesText, setServicesText] = useState(profile.services.join("\n"));
  const [areasText, setAreasText] = useState(profile.areas.join("\n"));
  const [saved, setSaved] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const services = servicesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const areas = areasText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    onUpdateProfile({ bio: bio.trim(), services, areas });
    setSaved(true);
  };

  return (
    <main className="trader-profile-page">
      <h1>Your trader profile</h1>
      <p className="trader-profile-page__hint">
        Shown to landlords alongside any quote you tender. You'll only see issues in the areas you list here.
      </p>

      <form className="trader-profile-form" onSubmit={handleSubmit} data-testid="trader-profile-form">
        <label className="trader-profile-form__field">
          <span>Bio</span>
          <textarea
            value={bio}
            onChange={(event) => {
              setBio(event.target.value);
              setSaved(false);
            }}
            rows={3}
            placeholder="A short introduction landlords will see"
          />
        </label>

        <label className="trader-profile-form__field">
          <span>Services offered (one per line)</span>
          <textarea
            value={servicesText}
            onChange={(event) => {
              setServicesText(event.target.value);
              setSaved(false);
            }}
            rows={3}
            placeholder="Plumbing"
          />
        </label>

        <label className="trader-profile-form__field">
          <span>Areas serviced (one per line)</span>
          <textarea
            value={areasText}
            onChange={(event) => {
              setAreasText(event.target.value);
              setSaved(false);
            }}
            rows={3}
            placeholder="Portland, OR"
          />
        </label>

        <p className="trader-profile-page__hint">
          Use the same "City, ST" format as listings (e.g. Portland, OR).
        </p>

        <button type="submit" className="trader-profile-form__submit">
          Save profile
        </button>

        {saved && (
          <p className="trader-profile-form__confirmation" role="status">
            Profile saved.
          </p>
        )}
      </form>
    </main>
  );
}
