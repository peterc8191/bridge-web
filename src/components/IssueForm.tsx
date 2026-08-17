import { useState, type FormEvent } from "react";
import type { Property } from "../types/property";
import type { NewIssueInput } from "../types/issue";
import "./IssueForm.css";

interface IssueFormProps {
  properties: Property[];
  onSubmit: (input: NewIssueInput) => void;
}

export function IssueForm({ properties, onSubmit }: IssueFormProps) {
  const [expanded, setExpanded] = useState(false);
  const [propertyId, setPropertyId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  if (properties.length === 0) {
    return (
      <div className="issue-form issue-form--empty" data-testid="issue-form-empty">
        <p>Save a property first to report an issue to its owner.</p>
      </div>
    );
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    if (!propertyId || !trimmedTitle || !trimmedDescription) return;

    onSubmit({ propertyId, title: trimmedTitle, description: trimmedDescription });
    setPropertyId("");
    setTitle("");
    setDescription("");
  };

  return (
    <div className="issue-form" data-testid="issue-form">
      <button
        type="button"
        className="issue-form__toggle"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-controls="issue-form-fields"
      >
        <span>Report an issue</span>
        <span className="issue-form__chevron" aria-hidden="true">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <form className="issue-form__fields" id="issue-form-fields" onSubmit={handleSubmit}>
          <label className="issue-form__field">
            <span>Property</span>
            <select
              value={propertyId}
              onChange={(event) => setPropertyId(event.target.value)}
              required
            >
              <option value="" disabled>
                Select a property
              </option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.address}
                </option>
              ))}
            </select>
          </label>

          <label className="issue-form__field">
            <span>Title</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Leaking faucet"
              required
            />
          </label>

          <label className="issue-form__field">
            <span>Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the issue in more detail"
              rows={3}
              required
            />
          </label>

          <button type="submit" className="issue-form__submit">
            Report issue
          </button>
        </form>
      )}
    </div>
  );
}
