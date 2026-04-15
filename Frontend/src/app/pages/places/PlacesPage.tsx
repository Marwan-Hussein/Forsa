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
    <div className="min-h-screen bg-[#eff6ff]">
      <main className="px-6 py-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#27374d] mb-2">Browse Venues</h1>
          <p className="text-[#526d82]">Find the perfect venue for your next event</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-[#526d82]" />
              <input
                type="text"
                placeholder="Search venues by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[rgba(39,55,77,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC9B3B] focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-[#27374d] text-white rounded-lg hover:bg-[#1d2938] transition-colors flex items-center gap-2"
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
                <label className="block text-sm font-medium text-[#27374d] mb-2">Venue Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-2 border border-[rgba(39,55,77,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC9B3B] focus:border-transparent"
                >
                  {placeTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#27374d] mb-2">Capacity</label>
                <select
                  value={selectedCapacity}
                  onChange={(e) => setSelectedCapacity(e.target.value)}
                  className="w-full px-4 py-2 border border-[rgba(39,55,77,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC9B3B] focus:border-transparent"
                >
                  {capacityRanges.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#27374d] mb-2">Price Range</label>
                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-[rgba(39,55,77,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC9B3B] focus:border-transparent"
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
        <div className="mb-6">
          <p className="text-[#526d82]">
            Showing {filteredPlaces.length} {filteredPlaces.length === 1 ? "venue" : "venues"}
          </p>
        </div>

        {/* Places Grid */}
        {filteredPlaces.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-[rgba(39,55,77,0.1)] text-center">
            <Building2 className="size-16 text-[#526d82] mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-[#27374d] mb-2">No venues found</h3>
            <p className="text-[#526d82]">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place) => (
              <Link
                key={place.id}
                to={`/places/${place.id}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm border border-[rgba(39,55,77,0.1)] hover:border-[#EC9B3B] transition-all hover:shadow-md"
              >
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={`https://source.unsplash.com/800x600/?${place.imageQuery.replace(/ /g, ",")}`}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#27374d] text-xs font-medium px-2.5 py-1 rounded-full">
                    {place.type}
                  </span>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                    <Star className="size-4 fill-[#EC9B3B] text-[#EC9B3B]" />
                    <span className="text-sm font-medium text-[#27374d]">{place.rating}</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-xl text-[#27374d] mb-2 group-hover:text-[#EC9B3B] transition-colors">
                    {place.name}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-[#526d82] mb-3">
                    <MapPin className="size-4" />
                    <span>{place.location}</span>
                  </div>

                  <div className="flex items-center justify-between mb-3 text-sm">
                    <div className="flex items-center gap-2 text-[#526d82]">
                      <Users className="size-4" />
                      <span>Up to {place.capacity} people</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {place.amenities.slice(0, 3).map((amenity) => (
                      <span
                        key={amenity}
                        className="px-2 py-1 bg-[#eff6ff] text-[#526d82] text-xs rounded-full flex items-center gap-1"
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
                      <p className="text-xs text-[#526d82]">Starting from</p>
                      <p className="text-2xl font-bold text-[#27374d]">
                        ${place.pricePerDay.toLocaleString()}
                        <span className="text-sm font-normal text-[#526d82]">/day</span>
                      </p>
                    </div>
                    <div className="text-sm text-[#526d82]">
                      {place.reviews} reviews
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
