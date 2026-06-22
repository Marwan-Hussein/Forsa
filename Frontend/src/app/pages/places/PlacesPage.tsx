import { useState } from "react";
import { Link } from "react-router";
import { ImageWithFallback } from "../../components/ImageWithFallback";
import {
  MapPin,
  Users,
  DollarSign,
  Star,
  Search,
  Filter,
  ChevronDown,
  Building2,
  Wifi,
  Car,
  Coffee,
} from "lucide-react";
// Mock places data
const mockPlaces = [
  {
    id: "1",
    name: "Grand Conference Center",
    location: "Downtown, New York",
    capacity: 500,
    pricePerDay: 5000,
    rating: 4.8,
    reviews: 124,
    type: "Conference Center",
    amenities: ["WiFi", "Parking", "Catering"],
    imageQuery: "modern conference center interior",
  },
  {
    id: "2",
    name: "The Garden Venue",
    location: "Midtown, New York",
    capacity: 200,
    pricePerDay: 3000,
    rating: 4.6,
    reviews: 89,
    type: "Event Space",
    amenities: ["WiFi", "Outdoor Space", "Catering"],
    imageQuery: "elegant event venue garden",
  },
  {
    id: "3",
    name: "Tech Hub Auditorium",
    location: "Silicon Valley, CA",
    capacity: 800,
    pricePerDay: 8000,
    rating: 4.9,
    reviews: 201,
    type: "Auditorium",
    amenities: ["WiFi", "Parking", "Tech Equipment"],
    imageQuery: "modern tech auditorium",
  },
  {
    id: "4",
    name: "Riverside Hall",
    location: "Brooklyn, New York",
    capacity: 350,
    pricePerDay: 4200,
    rating: 4.7,
    reviews: 156,
    type: "Banquet Hall",
    amenities: ["WiFi", "Parking", "Catering", "Outdoor Space"],
    imageQuery: "elegant banquet hall riverside",
  },
  {
    id: "5",
    name: "Downtown Meeting Space",
    location: "Manhattan, New York",
    capacity: 100,
    pricePerDay: 1500,
    rating: 4.5,
    reviews: 67,
    type: "Meeting Room",
    amenities: ["WiFi", "Tech Equipment"],
    imageQuery: "modern meeting room downtown",
  },
  {
    id: "6",
    name: "Skyline Rooftop Venue",
    location: "Chicago, IL",
    capacity: 250,
    pricePerDay: 6000,
    rating: 4.9,
    reviews: 143,
    type: "Rooftop Venue",
    amenities: ["WiFi", "Outdoor Space", "Catering", "Bar"],
    imageQuery: "rooftop event venue skyline",
  },
];

const placeTypes = ["All Types", "Conference Center", "Event Space", "Auditorium", "Banquet Hall", "Meeting Room", "Rooftop Venue"];
const capacityRanges = ["All Capacities", "0-100", "101-250", "251-500", "500+"];
const priceRanges = ["All Prices", "$0-$2000", "$2001-$5000", "$5001-$10000"];

export default function PlacesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedCapacity, setSelectedCapacity] = useState("All Capacities");
  const [selectedPrice, setSelectedPrice] = useState("All Prices");
  const [showFilters, setShowFilters] = useState(false);

  const filteredPlaces = mockPlaces.filter((place) => {
    const matchesSearch =
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === "All Types" || place.type === selectedType;
    
    const matchesCapacity = (() => {
      if (selectedCapacity === "All Capacities") return true;
      if (selectedCapacity === "0-100") return place.capacity <= 100;
      if (selectedCapacity === "101-250") return place.capacity > 100 && place.capacity <= 250;
      if (selectedCapacity === "251-500") return place.capacity > 250 && place.capacity <= 500;
      if (selectedCapacity === "500+") return place.capacity > 500;
      return true;
    })();

    const matchesPrice = (() => {
      if (selectedPrice === "All Prices") return true;
      if (selectedPrice === "$0-$2000") return place.pricePerDay <= 2000;
      if (selectedPrice === "$2001-$5000") return place.pricePerDay > 2000 && place.pricePerDay <= 5000;
      if (selectedPrice === "$5001-$10000") return place.pricePerDay > 5000 && place.pricePerDay <= 10000;
      return true;
    })();

    return matchesSearch && matchesType && matchesCapacity && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative bg-[#0B1120] pt-36 pb-28 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(135deg, #0B1120 0%, #1E3D61 100%)" }} />
        <div className="absolute inset-0 z-0 overflow-hidden mix-blend-screen pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full filter blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3b82f6]/20 rounded-full filter blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-white/90 text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md border border-white/20">
            Premium Spaces
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
            Browse <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-400">Venues</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed font-light">
            Find the perfect venue for your next event. From grand conference halls to intimate garden spaces.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-10 pb-20">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-xl shadow-[#1E3D61]/5 border border-slate-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search venues by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Filter className="size-5" />
              Filters
              <ChevronDown className={`size-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[rgba(39,55,77,0.1)]">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Venue Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  {placeTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Capacity</label>
                <select
                  value={selectedCapacity}
                  onChange={(e) => setSelectedCapacity(e.target.value)}
                  className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  {capacityRanges.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Price Range</label>
                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  {priceRanges.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Available Venues</h2>
          <p className="font-medium text-sm text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            Found <span className="text-[#1E3D61] font-bold">{filteredPlaces.length}</span> venue{filteredPlaces.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Places Grid */}
        {filteredPlaces.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-[rgba(39,55,77,0.1)] text-center">
            <Building2 className="size-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-foreground mb-2">No venues found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place) => (
              <Link
                key={place.id}
                to={`/places/${place.id}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm border border-border hover:border-Entertainment transition-all duration-300 hover:shadow-md"
              >
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={`https://source.unsplash.com/800x600/?${place.imageQuery.replace(/ /g, ",")}`}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-foreground text-xs font-medium px-2.5 py-1 rounded-full">
                    {place.type}
                  </span>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                    <Star className="size-4 fill-accent text-accent" />
                    <span className="text-sm font-medium text-foreground">{place.rating}</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-xl text-foreground mb-2 group-hover:text-accent transition-colors">
                    {place.name}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="size-4" />
                    <span>{place.location}</span>
                  </div>

                  <div className="flex items-center justify-between mb-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="size-4" />
                      <span>Up to {place.capacity} people</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {place.amenities.slice(0, 3).map((amenity) => (
                      <span
                        key={amenity}
                        className="px-2 py-1 bg-background text-muted-foreground text-xs rounded-full flex items-center gap-1"
                      >
                        {amenity === "WiFi" && <Wifi className="size-3" />}
                        {amenity === "Parking" && <Car className="size-3" />}
                        {amenity === "Catering" && <Coffee className="size-3" />}
                        {amenity}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[rgba(39,55,77,0.1)]">
                    <div>
                      <p className="text-xs text-muted-foreground">Starting from</p>
                      <p className="text-2xl font-bold text-foreground">
                        ${place.pricePerDay.toLocaleString()}
                        <span className="text-sm font-normal text-muted-foreground">/day</span>
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {place.reviews} reviews
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
