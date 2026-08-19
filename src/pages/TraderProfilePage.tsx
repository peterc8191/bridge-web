import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import type { AuthUser } from "../types/auth";
import type { TraderProfile } from "../types/traderProfile";
import "./TraderProfilePage.css";

interface TraderProfilePageProps {
  currentUser: AuthUser | null;
  profile: TraderProfile;
  onUpdateProfile: (profile: TraderProfile) => void;
}

export function TraderProfilePage({ currentUser, profile, onUpdateProfile }: TraderProfilePageProps) {
  const [bio, setBio] = useState(profile.bio);
  const [servicesText, setServicesText] = useState(profile.services.join("\n"));
  const [areasText, setAreasText] = useState(profile.areas.join("\n"));
  const [saved, setSaved] = useState(false);

  if (currentUser?.role !== "tradesperson") {
    return <Navigate to="/" replace />;
  }

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
        Shown to landlords alongside any quote you tender on a reported issue.
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
