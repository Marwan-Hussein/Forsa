import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ImageWithFallback } from "../../components/ImageWithFallback";
import { placeApi, PlaceSummary } from "../../api/placeApi";
import {
  MapPin,
  Users,
  Star,
  Search,
  Filter,
  ChevronDown,
  Building2,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

export default function PlacesPage() {
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedCapacity, setSelectedCapacity] = useState("All Capacities");

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const data = await placeApi.getAvailablePlaces();
        setPlaces(data);
      } catch (error) {
        console.error("Failed to fetch places:", error);
        toast.error("Failed to load venues. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  const placeTypes = ["All Types", ...Array.from(new Set(places.map(p => p.facilityName)))];
  const capacityRanges = ["All Capacities", "0-100", "101-250", "251-500", "500+"];

  const filteredPlaces = places.filter((place) => {
    const matchesSearch =
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === "All Types" || place.facilityName === selectedType;
    
    const matchesCapacity = (() => {
      if (selectedCapacity === "All Capacities") return true;
      if (selectedCapacity === "0-100") return place.capacity <= 100;
      if (selectedCapacity === "101-250") return place.capacity > 100 && place.capacity <= 250;
      if (selectedCapacity === "251-500") return place.capacity > 250 && place.capacity <= 500;
      if (selectedCapacity === "500+") return place.capacity > 500;
      return true;
    })();

    return matchesSearch && matchesType && matchesCapacity;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-24">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Available Venues</h1>
            <p className="text-slate-500 font-medium">Browse and book the perfect space for your next event.</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-10 items-center justify-between">
          <div className="w-full lg:w-1/2 relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search venues by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-full text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all font-medium shadow-sm hover:border-slate-300"
            />
          </div>
          
          <div className="w-full lg:w-auto flex flex-wrap gap-3">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px] h-[52px] px-5 bg-white border border-slate-200 hover:border-slate-300 rounded-full text-slate-700 font-semibold shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none">
                <SelectValue placeholder="Venue Type" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-slate-200 shadow-xl overflow-hidden bg-white/95 backdrop-blur-md">
                {placeTypes.map((type) => (
                  <SelectItem key={type} value={type} className="font-semibold text-slate-700 cursor-pointer focus:bg-slate-100 focus:text-blue-600 py-3 transition-colors data-[state=checked]:text-blue-600 data-[state=checked]:bg-blue-50/50">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCapacity} onValueChange={setSelectedCapacity}>
              <SelectTrigger className="w-[180px] h-[52px] px-5 bg-white border border-slate-200 hover:border-slate-300 rounded-full text-slate-700 font-semibold shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none">
                <SelectValue placeholder="Capacity" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-slate-200 shadow-xl overflow-hidden bg-white/95 backdrop-blur-md">
                {capacityRanges.map((range) => (
                  <SelectItem key={range} value={range} className="font-semibold text-slate-700 cursor-pointer focus:bg-slate-100 focus:text-blue-600 py-3 transition-colors data-[state=checked]:text-blue-600 data-[state=checked]:bg-blue-50/50">
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            Showing <span className="text-slate-900 font-bold">{filteredPlaces.length}</span> venues
          </p>
        </div>

        {/* Places Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 animate-pulse">
                <div className="h-56 bg-slate-200" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="pt-4 border-t border-slate-100">
                    <div className="h-8 bg-slate-200 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Building2 className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No venues found</h3>
            <p className="text-slate-500 text-lg max-w-md">We couldn't find any venues matching your criteria. Try adjusting your filters or search term.</p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedType("All Types"); setSelectedCapacity("All Capacities"); }}
              className="mt-8 px-6 py-3 bg-blue-50 text-blue-600 font-semibold rounded-xl hover:bg-blue-100 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlaces.map((place) => (
              <Link
                key={place.id}
                to={`/organizer/places/${place.id}`}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 border border-slate-200 hover:border-blue-200 transition-all duration-500 flex flex-col h-full hover:-translate-y-1.5"
              >
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  <ImageWithFallback
                    src={place.images && place.images.length > 0 ? (place.images[0].startsWith('http') ? place.images[0] : `http://localhost:5000${place.images[0].startsWith('/') ? '' : '/'}${place.images[0]}`) : "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop"}
                    alt={place.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur shadow-sm text-slate-700 text-xs font-bold tracking-wider px-3.5 py-1.5 rounded-full uppercase">
                    {place.facilityName}
                  </div>
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur shadow-sm rounded-full px-3.5 py-1.5 flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-700">{place.rating > 0 ? place.rating.toFixed(1) : 'New'}</span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-xl text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {place.name}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-5">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{place.location}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl text-sm font-semibold">
                      <Users className="h-4 w-4" />
                      <span>Up to {place.capacity}</span>
                    </div>
                    {place.availabilities && place.availabilities.some(a => a.status === "Available") ? (
                      <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl text-sm font-semibold">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Available Now</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl text-sm font-semibold">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        <span>Check Dates</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Starting from</p>
                      <p className="text-2xl font-black text-slate-900">
                        {place.dailyPrice.toLocaleString()} EGP
                        <span className="text-sm font-medium text-slate-500 ml-1">/day</span>
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all text-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
