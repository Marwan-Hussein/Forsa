import { useEffect, useState } from "react";

let isScriptLoading = false;
let isScriptLoaded = false;
const callbacks: (() => void)[] = [];

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(isScriptLoaded);

  useEffect(() => {
    if (isScriptLoaded) {
      setIsLoaded(true);
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
      console.warn("VITE_GOOGLE_MAPS_API_KEY is not defined or is placeholder. Map will not load.");
      return;
    }

    const handleLoaded = () => setIsLoaded(true);

    if (isScriptLoading) {
      callbacks.push(handleLoaded);
      return;
    }

    isScriptLoading = true;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=en&region=US`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      isScriptLoaded = true;
      setIsLoaded(true);
      callbacks.forEach((cb) => cb());
      callbacks.length = 0;
    };
    document.head.appendChild(script);

    return () => {
      // Script remains in the document head to avoid multiple script loading
    };
  }, []);

  return isLoaded;
}
