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
    <div className="min-h-screen bg-background">
      <main className="px-6 py-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Browse Venues</h1>
          <p className="text-muted-foreground">Find the perfect venue for your next event</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
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
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredPlaces.length} {filteredPlaces.length === 1 ? "venue" : "venues"}
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
      </main>
    </div>
  );
}
