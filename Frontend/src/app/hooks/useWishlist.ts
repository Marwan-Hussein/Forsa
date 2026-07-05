import { useCallback, useState, useEffect } from "react";
import { attendeeApi } from "../api/attendeeApi";
import { getUserIdFromToken } from "../api/api";
import { toast } from "sonner";

/**
 * Manages a local wishlist of event IDs and syncs with backend.
 */
export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = getUserIdFromToken();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    attendeeApi.getWishlist(userId)
      .then(data => setWishlist(data.map(item => item.eventId.toString())))
      .catch(err => console.error("Failed to fetch wishlist", err))
      .finally(() => setLoading(false));
  }, [userId]);

  const toggle = useCallback(async (eventIdRaw: string | number) => {
    if (!userId) {
      toast.error("Please login to manage your wishlist");
      return;
    }

    const eventIdStr = eventIdRaw.toString();
    const eventIdNum = parseInt(eventIdStr, 10);
    const isCurrentlyInWishlist = wishlist.includes(eventIdStr);
    
    // Optimistic update
    setWishlist(prev => 
      isCurrentlyInWishlist ? prev.filter(id => id !== eventIdStr) : [...prev, eventIdStr]
    );

    try {
      if (isCurrentlyInWishlist) {
        await attendeeApi.removeFromWishlist(userId, eventIdNum);
        toast.success("Removed from wishlist");
      } else {
        await attendeeApi.addToWishlist(userId, eventIdNum);
        toast.success("Added to wishlist");
      }
    } catch (err) {
      // Revert on error
      setWishlist(prev => 
        isCurrentlyInWishlist ? [...prev, eventIdStr] : prev.filter(id => id !== eventIdStr)
      );
      toast.error("Failed to update wishlist");
    }
  }, [wishlist, userId]);

  const has = useCallback((eventIdRaw: string | number) => wishlist.includes(eventIdRaw.toString()), [wishlist]);

  return { wishlist, toggle, has, loading } as const;
}
