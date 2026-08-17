import { useState, type FormEvent } from "react";
import type { NewViewingInput } from "../types/viewing";
import "./ViewingForm.css";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

interface ViewingFormProps {
  propertyId: string;
  onSubmit: (input: NewViewingInput) => void;
}

export function ViewingForm({ propertyId, onSubmit }: ViewingFormProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!date || !time) return;

    onSubmit({ propertyId, date, time, note: note.trim() });
    setDate("");
    setTime("");
    setNote("");
    setConfirmed(true);
  };

  return (
    <form className="viewing-form" onSubmit={handleSubmit} data-testid="viewing-form">
      <label className="viewing-form__field">
        <span>Date</span>
        <input
          type="date"
          min={today()}
          value={date}
          onChange={(event) => {
            setDate(event.target.value);
            setConfirmed(false);
          }}
          required
        />
      </label>

      <label className="viewing-form__field">
        <span>Time</span>
        <input
          type="time"
          value={time}
          onChange={(event) => {
            setTime(event.target.value);
            setConfirmed(false);
          }}
          required
        />
      </label>

      <label className="viewing-form__field">
        <span>Note (optional)</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Anything the owner should know"
          rows={2}
        />
      </label>

      <button type="submit" className="viewing-form__submit">
        Request viewing
      </button>

      {confirmed && (
        <p className="viewing-form__confirmation" role="status">
          Viewing requested — the owner will confirm shortly.
        </p>
      )}
    </form>
  );
}
