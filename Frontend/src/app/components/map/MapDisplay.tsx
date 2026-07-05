import { useEffect, useRef, useState } from "react";
import { useGoogleMaps } from "../../hooks/useGoogleMaps";
import { Loader2, MapPin, ExternalLink } from "lucide-react";

interface MapDisplayProps {
  address: string;
  latitude: number | null;
  longitude: number | null;
  googlePlaceId?: string | null;
}

export default function MapDisplay({
  address,
  latitude,
  longitude,
}: MapDisplayProps) {
  const isLoaded = useGoogleMaps();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerInstance = useRef<google.maps.Marker | null>(null);

  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMapReady(true);
    }, 450); // wait for modal transition (400ms) to complete
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !mapReady) {
      return;
    }

    if (latitude !== null && longitude !== null) {
      const center = { lat: latitude, lng: longitude };

      if (!mapInstance.current) {
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center,
          zoom: 15,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: "cooperative",
        });

        markerInstance.current = new google.maps.Marker({
          position: center,
          map: mapInstance.current,
          animation: google.maps.Animation.DROP,
        });
      } else {
        mapInstance.current.setCenter(center);
        if (markerInstance.current) {
          markerInstance.current.setPosition(center);
        }
      }
    } else if (address) {
      // Fallback: Geocode textual address to coordinates using Google Geocoding service
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results && results[0] && mapRef.current) {
          const location = results[0].geometry.location;

          if (!mapInstance.current) {
            mapInstance.current = new google.maps.Map(mapRef.current, {
              center: location,
              zoom: 15,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              gestureHandling: "cooperative",
            });

            markerInstance.current = new google.maps.Marker({
              position: location,
              map: mapInstance.current,
              animation: google.maps.Animation.DROP,
            });
          } else {
            mapInstance.current.setCenter(location);
            if (markerInstance.current) {
              markerInstance.current.setPosition(location);
            }
          }
        } else {
          console.error("Geocoding failed for address:", address, status);
        }
      });
    }
  }, [isLoaded, latitude, longitude, address, mapReady]);

  const hasCoordinates = latitude !== null && longitude !== null;

  if (!hasCoordinates && !address) {
    return (
      <div className="w-full border border-slate-200 bg-slate-50/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
        <div className="p-3 bg-slate-100 rounded-xl text-slate-400">
          <MapPin className="w-6 h-6" />
        </div>
        <p className="font-['Inter:Bold',sans-serif] font-bold text-slate-700">Location Not Set</p>
        <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 max-w-sm">
          No location details were saved for this event.
        </p>
      </div>
    );
  }

  if (!isLoaded || !mapReady) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center border border-slate-200 bg-slate-50/50 rounded-2xl gap-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-sm font-['Inter:Medium',sans-serif] text-slate-500">Loading Map View...</span>
      </div>
    );
  }

  const mapsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="relative group rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
      {/* Map Element */}
      <div ref={mapRef} className="w-full h-64 z-0" style={{ minHeight: "260px" }} />

      {/* directions link */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-xs font-['Inter:Bold',sans-serif] font-bold text-slate-400 uppercase tracking-wider">Venue Location</p>
          <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-700 font-medium truncate max-w-md sm:max-w-lg">
            {address}
          </p>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-['Inter:Bold',sans-serif] font-bold text-slate-700 shadow-sm transition-all shrink-0 hover:scale-105"
        >
          Open Directions
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
