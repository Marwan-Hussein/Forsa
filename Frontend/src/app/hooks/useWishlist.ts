import { useCallback, useState } from "react";

/**
 * Manages a local wishlist of event IDs.
 * Replace the `useState` with your API/store when connecting to the backend.
 */
export function useWishlist(initial: string[] = []) {
  const [wishlist, setWishlist] = useState<string[]>(initial);

  const toggle = useCallback((eventId: string) => {
    setWishlist((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId],
    );
  }, []);

  const has = useCallback((eventId: string) => wishlist.includes(eventId), [wishlist]);

  return { wishlist, toggle, has } as const;
}
