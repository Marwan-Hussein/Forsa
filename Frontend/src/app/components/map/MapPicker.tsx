import { useEffect, useRef, useState } from "react";
import { useGoogleMaps } from "../../hooks/useGoogleMaps";
import { Search, MapPin, Loader2 } from "lucide-react";

interface MapPickerProps {
  address: string;
  latitude: number | null;
  longitude: number | null;
  googlePlaceId: string | null;
  onChange: (data: {
    address: string;
    latitude: number;
    longitude: number;
    googlePlaceId: string | null;
  }) => void;
}

export default function MapPicker({
  address,
  latitude,
  longitude,
  googlePlaceId,
  onChange,
}: MapPickerProps) {
  const isLoaded = useGoogleMaps();
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [localSearch, setLocalSearch] = useState(address);
  const [status, setStatus] = useState<string | null>(null);

  const googleMapInstance = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Sync address changes
  useEffect(() => {
    setLocalSearch(address);
  }, [address]);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // Default center to Cairo, Egypt if no coordinates are saved yet
    const defaultLat = latitude ?? 30.0444;
    const defaultLng = longitude ?? 31.2357;
    const center = { lat: defaultLat, lng: defaultLng };

    // Initialize geocoder
    if (!geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }

    // Initialize map
    if (!googleMapInstance.current) {
      googleMapInstance.current = new google.maps.Map(mapRef.current, {
        center,
        zoom: latitude && longitude ? 15 : 10,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        styles: [
          {
            featureType: "administrative",
            elementType: "geometry",
            stylers: [{ visibility: "on" }],
          },
          {
            featureType: "poi",
            stylers: [{ visibility: "off" }], // clean map by hiding POIs
          },
        ],
      });

      // Initialize marker
      markerRef.current = new google.maps.Marker({
        position: center,
        map: googleMapInstance.current,
        draggable: true,
        animation: google.maps.Animation.DROP,
      });

      // Handle map clicks to place marker
      googleMapInstance.current.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng && markerRef.current) {
          const latLng = e.latLng;
          markerRef.current.setPosition(latLng);
          reverseGeocode(latLng.lat(), latLng.lng());
        }
      });

      // Handle marker drag end
      markerRef.current.addListener("dragend", () => {
        if (markerRef.current) {
          const position = markerRef.current.getPosition();
          if (position) {
            reverseGeocode(position.lat(), position.lng());
          }
        }
      });
    } else {
      // If map is already initialized, update positions
      const newPos = { lat: defaultLat, lng: defaultLng };
      googleMapInstance.current.setCenter(newPos);
      if (markerRef.current) {
        markerRef.current.setPosition(newPos);
      }
    }

    // Initialize Autocomplete search input
    if (searchInputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
        fields: ["geometry", "formatted_address", "place_id"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) {
          setStatus("No coordinates found for this search.");
          return;
        }

        const loc = place.geometry.location;
        const newLat = loc.lat();
        const newLng = loc.lng();
        const newAddress = place.formatted_address || searchInputRef.current?.value || "";
        const placeId = place.place_id || null;

        // Move map and marker
        if (googleMapInstance.current && markerRef.current) {
          googleMapInstance.current.setCenter({ lat: newLat, lng: newLng });
          googleMapInstance.current.setZoom(16);
          markerRef.current.setPosition({ lat: newLat, lng: newLng });
        }

        setLocalSearch(newAddress);
        setStatus(null);
        onChange({
          address: newAddress,
          latitude: newLat,
          longitude: newLng,
          googlePlaceId: placeId,
        });
      });
    }
  }, [isLoaded]);

  // Function to translate coordinates back to street address
  const reverseGeocode = (lat: number, lng: number) => {
    if (!geocoderRef.current) return;
    setStatus("Reverse geocoding...");
    geocoderRef.current.geocode(
      { location: { lat, lng } },
      (results, statusResult) => {
        if (statusResult === "OK" && results && results[0]) {
          const newAddress = results[0].formatted_address;
          const placeId = results[0].place_id || null;
          setLocalSearch(newAddress);
          setStatus(null);
          onChange({
            address: newAddress,
            latitude: lat,
            longitude: lng,
            googlePlaceId: placeId,
          });
        } else {
          setStatus("Could not pinpoint exact address, but coordinates are updated.");
          onChange({
            address: `Pinpoint location (${lat.toFixed(6)}, ${lng.toFixed(6)})`,
            latitude: lat,
            longitude: lng,
            googlePlaceId: null,
          });
        }
      }
    );
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-80 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl gap-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-sm font-['Inter:Medium',sans-serif] text-slate-500">Loading Google Maps...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Input Box */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          ref={searchInputRef}
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search location address, landmark, or venue..."
          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all font-['Inter:Medium',sans-serif] text-slate-800"
        />
      </div>

      {/* Map Display Viewport */}
      <div
        ref={mapRef}
        className="w-full h-72 rounded-2xl border border-slate-200 overflow-hidden shadow-inner relative z-0"
        style={{ minHeight: "280px" }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-amber-500" />
          <span>
            {latitude && longitude
              ? `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
              : "Click/drag marker to select location on map"}
          </span>
        </div>
        {status && <span className="font-medium text-amber-600 animate-pulse">{status}</span>}
      </div>
    </div>
  );
}
