import type { ReactElement } from "react";
import { vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { AppDataContext, type AppData } from "../context/appDataContext";
import { indexProperties } from "../lib/permissions";

/** A complete AppData with empty lists and vi.fn() actions, plus overrides. */
export function makeAppData(overrides: Partial<AppData> = {}): AppData {
  const properties = overrides.properties ?? [];
  return {
    currentUser: null,
    register: vi.fn(async () => ({ ok: true as const })),
    login: vi.fn(async () => ({ ok: true as const })),
    logout: vi.fn(),
    properties,
    propertyById: indexProperties(properties),
    myListings: [],
    addProperty: vi.fn(() => "new-id"),
    updateProperty: vi.fn(),
    deleteProperty: vi.fn(),
    deck: [],
    saved: [],
    decide: vi.fn(),
    undo: vi.fn(),
    canUndo: false,
    removeSaved: vi.fn(),
    resetDeck: vi.fn(),
    issues: [],
    reportableProperties: [],
    addIssue: vi.fn(),
    updateIssueStatus: vi.fn(),
    clearMyIssues: vi.fn(),
    viewings: [],
    scheduleViewing: vi.fn(),
    respondToViewing: vi.fn(),
    cancelViewing: vi.fn(),
    tenders: [],
    addTender: vi.fn(),
    acceptTender: vi.fn(),
    traderProfile: { services: [], areas: [], bio: "" },
    updateTraderProfile: vi.fn(),
    theme: "system",
    setTheme: vi.fn(),
    resolvedTheme: "light",
    reduceMotion: false,
    setReduceMotion: vi.fn(),
    ...overrides,
  };
}

/** Renders the current pathname so tests can assert on navigation. */
export function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

interface RenderOptions {
  data?: Partial<AppData>;
  /** Initial URL. */
  route?: string;
  /** Route pattern to mount `ui` at (enables useParams and redirects). */
  path?: string;
  /** Router state for the initial entry (e.g. { from: "/issues" }). */
  state?: unknown;
}

/** Renders `ui` with a mocked AppData context inside a MemoryRouter. */
export function renderWithAppData(ui: ReactElement, options: RenderOptions = {}) {
  const { data, route = options.path ?? "/", path, state } = options;
  const value = makeAppData(data);
  const result = render(
    <AppDataContext.Provider value={value}>
      <MemoryRouter initialEntries={[{ pathname: route, state }]}>
        {path ? (
          <Routes>
            <Route path={path} element={ui} />
            <Route path="*" element={<LocationDisplay />} />
          </Routes>
        ) : (
          ui
        )}
      </MemoryRouter>
    </AppDataContext.Provider>,
  );
  return { ...result, data: value };
}
