import { Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { Discover } from "./pages/Discover";
import { Saved } from "./pages/Saved";
import { Issues } from "./pages/Issues";
import { Settings } from "./pages/Settings";
import { usePropertyDeck } from "./hooks/usePropertyDeck";
import { useIssues } from "./hooks/useIssues";
import { useSettings } from "./hooks/useSettings";

function App() {
  const { deck, saved, decide, removeSaved, reset: resetProperties } = usePropertyDeck();
  const { issues, addIssue, clearAddedIssues } = useIssues();
  const { theme, setTheme, resolvedTheme, reduceMotion, setReduceMotion } = useSettings();

  return (
    <>
      <NavBar savedCount={saved.length} issueCount={issues.length} />
      <Routes>
        <Route
          path="/"
          element={<Discover deck={deck} onDecide={decide} reduceMotion={reduceMotion} />}
        />
        <Route path="/saved" element={<Saved saved={saved} onRemove={removeSaved} />} />
        <Route path="/issues" element={<Issues saved={saved} issues={issues} onAddIssue={addIssue} />} />
        <Route
          path="/settings"
          element={
            <Settings
              theme={theme}
              onThemeChange={setTheme}
              resolvedTheme={resolvedTheme}
              reduceMotion={reduceMotion}
              onReduceMotionChange={setReduceMotion}
              onResetProperties={resetProperties}
              onClearIssues={clearAddedIssues}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
