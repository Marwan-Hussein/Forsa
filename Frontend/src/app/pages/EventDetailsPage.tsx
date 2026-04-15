import { useState } from "react";
import { useParams, Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  Heart,
  Ticket,
  Building2,
} from "lucide-react";
import { mockEvents, mockOrganizations } from "../data/mockData";
import { ImageWithFallback } from "../components/ImageWithFallback";
import {
  DURATION_FAST,
  EASE_IN_OUT,
  modalBackdropVariants,
  modalPanelVariants,
  pageTransition,
  pageVariants,
} from "../lib/motion";

export default function EventDetailsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const event = mockEvents.find((e) => e.id === eventId);
  const [ticketCount, setTicketCount] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  if (!event) {
    return (
      <div className="min-h-screen bg-[#eff6ff] flex items-center justify-center p-4">
        <div className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-8 text-center">
          <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[20px] text-[#27374d] mb-2">
            Event Not Found
          </h2>
          <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82] mb-4">
            The event you're looking for doesn't exist.
          </p>
          <Link
            to="/events"
            className="inline-block bg-[#27374d] text-[#dde6ed] px-6 py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#1e2936]"
          >
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  const organization = mockOrganizations.find((org) => org.id === event.organizerId);
  const totalPrice = event.price === "Free" ? 0 : (event.price as number) * ticketCount;

  const handleBooking = () => {
    setShowBookingModal(false);
    toast.success("Booking confirmed", {
      description: `${ticketCount} ticket(s) for ${event.title} (demo).`,
    });
  };

  const handleShare = (platform: string) => {
    toast.message(`Share to ${platform}`, {
      description: "This is a demo — no external app opened.",
    });
    setShowShareModal(false);
  };

  const copyEventLink = () => {
    void navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied", { description: "Paste it anywhere to share this event." });
    setShowShareModal(false);
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-[#eff6ff] via-[#f0f7ff] to-[#e8f0fa] py-8 px-4"
      initial="initial"
      animate="animate"
      variants={pageVariants}
      transition={pageTransition}
    >
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          to="/events"
          className="inline-flex items-center gap-2 mb-6 text-[#526d82] transition-all duration-300 ease-in-out hover:gap-3 hover:text-[#27374d] font-['Inter:Regular',sans-serif] text-[14px] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Image */}
            <div className="overflow-hidden rounded-2xl border border-[rgba(82,109,130,0.14)] bg-white shadow-[0_8px_30px_-12px_rgba(39,55,77,0.15)]">
              <div className="relative h-[400px]">
                <ImageWithFallback
                  alt={event.title}
                  className="h-full w-full object-cover"
                  query={event.image}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#27374d]/40 via-transparent to-transparent" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    transition={{ duration: DURATION_FAST, ease: EASE_IN_OUT }}
                    onClick={() => setIsInWishlist(!isInWishlist)}
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-[#526d82] shadow-md transition-colors duration-300 ease-in-out hover:bg-[#f8fafc]"
                  >
                    <Heart
                      className={`h-5 w-5 ${isInWishlist ? "fill-red-500 text-red-500" : "text-[#526d82]"}`}
                    />
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    transition={{ duration: DURATION_FAST, ease: EASE_IN_OUT }}
                    onClick={() => setShowShareModal(true)}
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-[#526d82] shadow-md transition-colors duration-300 ease-in-out hover:bg-[#f8fafc]"
                  >
                    <Share2 className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="rounded-2xl border border-[rgba(82,109,130,0.14)] bg-white p-8 shadow-[0_4px_24px_-8px_rgba(39,55,77,0.12)]">
              <div className="flex items-start justify-between mb-4">
                <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[30px] text-[#27374d]">
                  {event.title}
                </h1>
                <span className="px-3 py-1 bg-[#155dfc] text-white rounded-[8px] text-[12px] font-['Inter:Medium',sans-serif] font-medium">
                  {event.category}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#eff6ff] rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#EC9B3B]" />
                  </div>
                  <div>
                    <p className="font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#526d82]">
                      Date
                    </p>
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] text-[#27374d]">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#eff6ff] rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#EC9B3B]" />
                  </div>
                  <div>
                    <p className="font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#526d82]">
                      Time
                    </p>
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] text-[#27374d]">
                      {event.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#eff6ff] rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#EC9B3B]" />
                  </div>
                  <div>
                    <p className="font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#526d82]">
                      Location
                    </p>
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] text-[#27374d]">
                      {event.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#eff6ff] rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#EC9B3B]" />
                  </div>
                  <div>
                    <p className="font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#526d82]">
                      Attendees
                    </p>
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] text-[#27374d]">
                      {event.attendees} / {event.capacity}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-[rgba(82,109,130,0.2)] pt-6 mb-6">
                <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[18px] text-[#27374d] mb-3">
                  About This Event
                </h2>
                <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82] leading-relaxed">
                  {event.description}
                </p>
              </div>

              <div className="border-t border-[rgba(82,109,130,0.2)] pt-6">
                <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[18px] text-[#27374d] mb-3">
                  Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-[#eff6ff] text-[#27374d] rounded-[8px] text-[12px] font-['Inter:Medium',sans-serif] font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Booking Card */}
            <div className="rounded-2xl border border-[rgba(82,109,130,0.14)] bg-white p-6 shadow-[0_8px_28px_-10px_rgba(39,55,77,0.18)]">
              <div className="mb-6">
                <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82] mb-2">
                  Ticket Price
                </p>
                <p className="font-['Inter:Bold',sans-serif] font-bold text-[32px] text-[#27374d]">
                  {event.price === "Free" ? "Free" : `$${event.price}`}
                </p>
              </div>

              <motion.button
                type="button"
                onClick={() => setShowBookingModal(true)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: DURATION_FAST, ease: EASE_IN_OUT }}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#27374d] to-[#1e2936] py-3 font-['Inter:Medium',sans-serif] text-[16px] font-medium text-[#dde6ed] shadow-lg ring-1 ring-white/10 transition-shadow duration-300 ease-in-out hover:shadow-xl"
              >
                <Ticket className="h-5 w-5" />
                Book Tickets
              </motion.button>

              <div className="mt-4 pt-4 border-t border-[rgba(82,109,130,0.2)]">
                <p className="font-['Inter:Regular',sans-serif] text-[12px] text-[#526d82] text-center">
                  {event.capacity - event.attendees} spots remaining
                </p>
              </div>
            </div>

            {/* Organizer Card */}
            {organization && (
              <div className="rounded-2xl border border-[rgba(82,109,130,0.14)] bg-white p-6 shadow-sm">
                <h3 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-[#27374d] mb-4">
                  Organized By
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#27374d] rounded-full flex items-center justify-center text-2xl">
                    {organization.logo}
                  </div>
                  <div>
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] text-[#27374d]">
                      {organization.name}
                    </p>
                    <p className="font-['Inter:Regular',sans-serif] text-[12px] text-[#526d82]">
                      {organization.followersCount.toLocaleString()} followers
                    </p>
                  </div>
                </div>
                <p className="font-['Inter:Regular',sans-serif] text-[12px] text-[#526d82] mb-4">
                  {organization.description}
                </p>
                <Link
                  to={`/organizations/${organization.id}`}
                  className="w-full bg-white border-[0.8px] border-[rgba(82,109,130,0.2)] text-[#27374d] py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#f8f9fa] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  View Profile
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showBookingModal && (
          <motion.div
            key="booking-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION_FAST, ease: EASE_IN_OUT }}
          >
            <motion.button
              type="button"
              aria-label="Close booking dialog"
              className="absolute inset-0 cursor-pointer bg-black/50 transition-colors duration-300 hover:bg-black/60"
              variants={modalBackdropVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: DURATION_FAST, ease: EASE_IN_OUT }}
              onClick={() => setShowBookingModal(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="booking-modal-title"
              className="relative w-full max-w-md rounded-2xl border border-[rgba(82,109,130,0.12)] bg-white p-8 shadow-[0_24px_48px_-12px_rgba(39,55,77,0.25)]"
              variants={modalPanelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.28, ease: EASE_IN_OUT }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                id="booking-modal-title"
                className="mb-4 font-['Inter:Bold',sans-serif] text-[24px] font-bold text-[#27374d]"
              >
                Book Tickets
              </h2>
              <p className="mb-6 font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82]">{event.title}</p>

              <div className="mb-6">
                <label className="mb-2 block font-['Inter:Medium',sans-serif] text-[14px] font-medium text-[#27374d]">
                  Number of Tickets
                </label>
                <div className="flex items-center gap-4">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    transition={{ duration: DURATION_FAST, ease: EASE_IN_OUT }}
                    onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-[#eff6ff] font-['Inter:Bold',sans-serif] text-[18px] text-[#27374d] transition-colors duration-300 ease-in-out hover:bg-[#dde6ed]"
                  >
                    -
                  </motion.button>
                  <span className="min-w-[2rem] text-center font-['Inter:Semi_Bold',sans-serif] text-[20px] font-semibold text-[#27374d]">
                    {ticketCount}
                  </span>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    transition={{ duration: DURATION_FAST, ease: EASE_IN_OUT }}
                    onClick={() => setTicketCount(ticketCount + 1)}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-[#eff6ff] font-['Inter:Bold',sans-serif] text-[18px] text-[#27374d] transition-colors duration-300 ease-in-out hover:bg-[#dde6ed]"
                  >
                    +
                  </motion.button>
                </div>
              </div>

              <div className="mb-6 rounded-xl bg-[#eff6ff]/90 p-4 ring-1 ring-[#27374d]/5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82]">Ticket Price:</span>
                  <span className="font-['Inter:Semi_Bold',sans-serif] text-[14px] font-semibold text-[#27374d]">
                    {event.price === "Free" ? "Free" : `$${event.price}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-['Inter:Semi_Bold',sans-serif] text-[16px] font-semibold text-[#27374d]">
                    Total:
                  </span>
                  <span className="font-['Inter:Bold',sans-serif] text-[20px] font-bold text-[#27374d]">
                    {totalPrice === 0 ? "Free" : `$${totalPrice}`}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 rounded-xl border border-[rgba(82,109,130,0.2)] bg-white py-3 font-['Inter:Medium',sans-serif] text-[14px] font-medium text-[#27374d] transition-colors duration-300 ease-in-out hover:bg-[#f8f9fa] active:scale-[0.98] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBooking}
                  className="flex-1 rounded-xl bg-[#27374d] py-3 font-['Inter:Medium',sans-serif] text-[14px] font-medium text-[#dde6ed] transition-colors duration-300 ease-in-out hover:bg-[#1e2936] active:scale-[0.98] cursor-pointer"
                >
                  Confirm Booking
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShareModal && (
          <motion.div
            key="share-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION_FAST, ease: EASE_IN_OUT }}
          >
            <motion.button
              type="button"
              aria-label="Close share dialog"
              className="absolute inset-0 cursor-pointer bg-black/50 transition-colors duration-300 hover:bg-black/60"
              variants={modalBackdropVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: DURATION_FAST, ease: EASE_IN_OUT }}
              onClick={() => setShowShareModal(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-modal-title"
              className="relative w-full max-w-md rounded-2xl border border-[rgba(82,109,130,0.12)] bg-white p-8 shadow-[0_24px_48px_-12px_rgba(39,55,77,0.25)]"
              variants={modalPanelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.28, ease: EASE_IN_OUT }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                id="share-modal-title"
                className="mb-6 font-['Inter:Bold',sans-serif] text-[24px] font-bold text-[#27374d]"
              >
                Share Event
              </h2>

              <div className="mb-6 space-y-3">
                <button
                  type="button"
                  onClick={() => handleShare("Facebook")}
                  className="w-full rounded-xl bg-[#1877f2] py-3 font-['Inter:Medium',sans-serif] text-[14px] font-medium text-white transition-all duration-300 ease-in-out hover:opacity-95 active:scale-[0.99] cursor-pointer"
                >
                  Share on Facebook
                </button>
                <button
                  type="button"
                  onClick={() => handleShare("Twitter")}
                  className="w-full rounded-xl bg-[#1da1f2] py-3 font-['Inter:Medium',sans-serif] text-[14px] font-medium text-white transition-all duration-300 ease-in-out hover:opacity-95 active:scale-[0.99] cursor-pointer"
                >
                  Share on Twitter
                </button>
                <button
                  type="button"
                  onClick={() => handleShare("LinkedIn")}
                  className="w-full rounded-xl bg-[#0a66c2] py-3 font-['Inter:Medium',sans-serif] text-[14px] font-medium text-white transition-all duration-300 ease-in-out hover:opacity-95 active:scale-[0.99] cursor-pointer"
                >
                  Share on LinkedIn
                </button>
                <button
                  type="button"
                  onClick={copyEventLink}
                  className="w-full rounded-xl bg-[#eff6ff] py-3 font-['Inter:Medium',sans-serif] text-[14px] font-medium text-[#27374d] transition-colors duration-300 ease-in-out hover:bg-[#dde6ed] active:scale-[0.99] cursor-pointer"
                >
                  Copy Link
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="w-full rounded-xl border border-[rgba(82,109,130,0.2)] bg-white py-3 font-['Inter:Medium',sans-serif] text-[14px] font-medium text-[#27374d] transition-colors duration-300 ease-in-out hover:bg-[#f8f9fa] active:scale-[0.98] cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
