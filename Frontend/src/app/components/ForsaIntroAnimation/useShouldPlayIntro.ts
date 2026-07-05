import { useState } from "react";

/**
 * Module-scope flag — NOT component state, NOT storage.
 *
 * Why not sessionStorage/localStorage? Those persist across a full
 * browser refresh, which would stop the intro from ever replaying on
 * refresh — the opposite of what's required. A plain in-memory module
 * variable is reset every time the JS bundle is re-evaluated (i.e. on
 * an actual page load / hard refresh), but survives client-side SPA
 * navigation (React Router swapping routes without a reload), since
 * the module is never re-imported in that case.
 */
let hasPlayedIntroThisLoad = false;

/**
 * Returns whether the Forsa intro animation should play right now,
 * plus a function to permanently mark it as played for this page load.
 */
export function useShouldPlayIntro(): [boolean, () => void] {
  const [shouldPlay] = useState(() => !hasPlayedIntroThisLoad);

  const markPlayed = () => {
    hasPlayedIntroThisLoad = true;
  };

  return [shouldPlay, markPlayed];
}
