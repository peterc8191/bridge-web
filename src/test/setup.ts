import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";

// Every test starts from an empty browser: no saved data, no session.
beforeEach(() => {
  localStorage.clear();
});
