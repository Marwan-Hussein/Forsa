import type { MouseEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { ForSaLogo } from "../../components/ForSaLogo";
import { ScrollReveal } from "../../components/ScrollReveal";
import { brandCtaBlue, brandNavy, brandNavyElevated } from "../../lib/brand";
import { EASE_SCROLL } from "../../lib/motion";
import {
  Calendar,
  MapPin,
  Users,
  Sparkles,
  Search,
  Ticket,
  Building2,
  ArrowRight,
  Star,
  Shield,
  Bell,
  CheckCircle,
  Briefcase,
  Music,
  Palette,
  Dumbbell,
  UtensilsCrossed,
  GraduationCap,
  Zap,
} from "lucide-react";
import { EventCard } from "../../components/EventCard";
import { mockEvents } from "../../data/mockData";

const SKY_BLUE = "#5faee3";
const DEEP_NAVY = "#182F4D";
const ACCENT_ORANGE = "#f39c12";
const MUTED_TEXT = "#526D82";

const HERO_BG = `linear-gradient(180deg, #102845 0%, ${DEEP_NAVY} 28%, #3d6f9e 62%, #74b9e1 100%)`;


const CTA_SECTION_BG = `
  radial-gradient(ellipse 90% 75% at 50% 22%, rgba(118, 194, 241, 0.35) 0%, rgba(52, 98, 134, 0.15) 42%, transparent 70%),
  linear-gradient(180deg, ${SKY_BLUE} 7%, ${brandNavy} 48%, #1a2634 100%)
`;

export default function GuestHomePage() {
  const [eventFilter, setEventFilter] = useState<"all" | "week" | "month" | "featured">("all");
  const [navElevated, setNavElevated] = useState(false);
  const { scrollY } = useScroll();
  /** Subtle parallax, spring-smoothed so it tracks scroll without jitter. */
  const heroParallaxRaw = useTransform(scrollY, [0, 640], [0, 22]);
  const heroParallax = useSpring(heroParallaxRaw, { stiffness: 88, damping: 32, mass: 0.45 });

  useEffect(() => {
    const onScroll = () => setNavElevated(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleProtectedAction = (e: MouseEvent) => {
    e.preventDefault();
    window.location.href = "/login";
  };

  const features = [
    {
      icon: Sparkles,
      title: "Smart Recommendations",
      description: "AI-powered suggestions tailored to your interests and location",
      color: "var(--accent)",
    },
    {
      icon: Search,
      title: "Advanced Search",
      description: "Find exactly what you're looking for with powerful filters",
      color: "var(--primary)",
    },
    {
      icon: Calendar,
      title: "Calendar Integration",
      description: "Never miss an event with calendar sync and reminders",
      color: "var(--Education)",
    },
    {
      icon: Ticket,
      title: "Instant Booking",
      description: "Secure your spot in seconds with seamless checkout",
      color: "var(--Technology)",
    },
    {
      icon: Bell,
      title: "Real-time Notifications",
      description: "Stay updated with personalized event alerts",
      color: "var(--accent)",
    },
    {
      icon: Shield,
      title: "Secure & Safe",
      description: "Your data and payments are protected with bank-level security",
      color: "var(--Entertainment)",
    },
  ];

  const stats = [
    { label: "Active Events", value: "10,000+", icon: Calendar },
    { label: "Happy Attendees", value: "50,000+", icon: Users },
    { label: "Event Organizers", value: "500+", icon: Building2 },
    { label: "Cities Worldwide", value: "100+", icon: MapPin },
  ];

  const eventCategories = [
    { name: "Business", icon: Briefcase, color: "var(--Business)", count: "2,340" },
    { name: "Music", icon: Music, color: "var(--Music)", count: "1,856" },
    { name: "Art & Culture", icon: Palette, color: "var(--Art)", count: "1,203" },
    { name: "Sports", icon: Dumbbell, color: "var(--Sports)", count: "987" },
    { name: "Food & Drink", icon: UtensilsCrossed, color: "var(--Food)", count: "1,456" },
    { name: "Education", icon: GraduationCap, color: "var(--Education)", count: "2,109" },
  ];

  const filteredEvents = useMemo(() => {
    const list = [...mockEvents];
    if (eventFilter === "featured") {
      const f = list.filter((e) => e.isFeatured);
      return f.length >= 6 ? f.slice(0, 6) : list.slice(0, 6);
    }
    return list.slice(0, 6);
  }, [eventFilter]);

  const eventTabs: { id: typeof eventFilter; label: string }[] = [
    { id: "all", label: "All Events" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "featured", label: "Featured" },
  ];

  return (
    <div className="min-h-screen bg-background text-[#1e293b]">
      {/* —— Navigation (flush with hero) —— */}
      <nav
        className={`fixed left-0 right-0 top-0 z-50 border-b transition-[background-color,box-shadow,backdrop-filter,border-color] duration-300 ease-in-out ${
          navElevated
            ? "border-white/10 shadow-lg shadow-black/20 backdrop-blur-md backdrop-saturate-150"
            : "border-transparent"
        }`}
        style={{ backgroundColor: navElevated ? brandNavyElevated : brandNavy }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[72px] h-[72px] sm:min-h-[76px] sm:h-[76px]">
            <Link to="/" className="flex items-center rounded-lg py-1 transition-opacity duration-300 ease-in-out hover:opacity-90">
              <ForSaLogo className="h-14 sm:h-16 max-h-[4.5rem]" />
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="font-['Inter:Medium',sans-serif] text-[13px] font-medium text-white/90 transition-all duration-300 ease-in-out hover:text-white sm:text-[14px]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] text-white px-5 py-2.5 rounded-[10px] shadow-md transition-all duration-300 ease-in-out hover:brightness-110 hover:shadow-lg active:scale-[0.97]"
                style={{ backgroundColor: brandCtaBlue }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* —— Hero (below nav): dark navy → sky blue —— */}
      <section className="relative pt-24 pb-12 md:pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: HERO_BG }} aria-hidden />
        <motion.div
          className="pointer-events-none absolute inset-0 will-change-transform bg-[radial-gradient(ellipse_100%_60%_at_50%_0%,rgba(255,255,255,0.08),transparent_55%)]"
          style={{ y: heroParallax }}
          aria-hidden
        />

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-14 xl:gap-20 items-center">
            <div>
              <motion.h1
                className="mb-6 font-['Inter:Bold',sans-serif] text-[40px] font-bold leading-[1.08] text-white sm:text-[48px] md:text-[52px]"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.58, ease: EASE_SCROLL }}
              >
                Discover &amp; Manage Your Events
              </motion.h1>
              <motion.p
                className="mb-8 max-w-xl font-['Inter:Regular',sans-serif] text-[17px] leading-relaxed text-[rgba(255,255,255,0.9)] sm:text-[18px]"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.06, ease: EASE_SCROLL }}
              >
                Create, organize, and attend amazing events. Connect with people who share your interests and
                make every moment count. Join thousands of people finding and attending amazing events.
              </motion.p>
              <motion.div
                className="mb-10 flex flex-col gap-3 sm:flex-row sm:gap-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.52, delay: 0.12, ease: EASE_SCROLL }}
              >
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-[12px] px-7 py-3.5 font-['Inter:Semi_Bold',sans-serif] text-[16px] font-semibold text-white shadow-lg transition-opacity duration-300 ease-out hover:opacity-95"
                  style={{ backgroundColor: DEEP_NAVY }}
                >
                  Start Exploring
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/events"
                  className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-white px-7 py-3.5 font-['Inter:Semi_Bold',sans-serif] text-[16px] font-semibold shadow-md transition-colors duration-300 ease-out hover:bg-slate-50"
                  style={{ color: brandNavy }}
                >
                  <Search className="h-5 w-5" />
                  Browse Events
                </Link>
              </motion.div>
              <div className="flex flex-wrap items-center gap-5">
                <div className="flex -space-x-2">
                  {["A", "B", "C", "D"].map((letter) => (
                    <div
                      key={letter}
                      className="w-10 h-10 rounded-full border-2 border-white bg-slate-700/90 flex items-center justify-center text-white text-[13px] font-semibold"
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p
                    className="font-['Inter:Medium',sans-serif] text-[14px]"
                    style={{ color: MUTED_TEXT }}
                  >
                    Trusted by 50,000+ users
                  </p>
                </div>
              </div>
            </div>

            {/* Three staggered preview cards (reference layout) */}
            <div className="relative flex min-h-[380px] items-center justify-center lg:min-h-[420px] lg:justify-end">
              <div className="relative w-full max-w-[340px] space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: 22, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.25, margin: "0px 0px -8% 0px" }}
                  transition={{ duration: 0.58, ease: EASE_SCROLL }}
                >
                <button
                  type="button"
                  onClick={handleProtectedAction}
                  className="block w-full rounded-[14px] border border-white/70 bg-white p-4 text-left shadow-xl shadow-black/25 transition-transform duration-300 ease-out hover:-translate-y-0.5"
                >
                  <div
                    className="h-[118px] rounded-[10px] mb-3 flex items-center justify-center bg-gradient-to-r from-[#4158f2] to-[#9d1cf2]"
                  >
                    <Calendar className="w-10 h-10 text-white" strokeWidth={1.75} />
                  </div>
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[15px] mb-1" style={{ color: brandNavy }}>
                    Tech Summit 2026
                  </p>
                  <p className="flex items-center gap-1.5 text-[13px]" style={{ color: MUTED_TEXT }}>
                    <MapPin className="w-3.5 h-3.5 shrink-0" /> San Francisco
                  </p>
                </button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 22, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.25, margin: "0px 0px -8% 0px" }}
                  transition={{ duration: 0.58, delay: 0.08, ease: EASE_SCROLL }}
                >
                <button
                  type="button"
                  onClick={handleProtectedAction}
                  className="ml-auto block w-full max-w-[92%] rounded-[14px] border border-white/70 bg-white p-4 text-left shadow-xl shadow-black/25 transition-transform duration-300 ease-out hover:-translate-y-0.5 lg:translate-x-2"
                >
                  <div
                    className="h-[118px] rounded-[10px] mb-3 flex items-center justify-center bg-gradient-to-r from-[#d81bf2] to-[#a83ff2]"
                  >
                    <Ticket className="w-10 h-10 text-white" strokeWidth={1.75} />
                  </div>
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[15px] mb-1" style={{ color: brandNavy }}>
                    Music Festival
                  </p>
                  <p className="flex items-center gap-1.5 text-[13px]" style={{ color: MUTED_TEXT }}>
                    <Users className="w-3.5 h-3.5 shrink-0" /> 5K Attending
                  </p>
                </button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 22, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.25, margin: "0px 0px -8% 0px" }}
                  transition={{ duration: 0.58, delay: 0.16, ease: EASE_SCROLL }}
                >
                <button
                  type="button"
                  onClick={handleProtectedAction}
                  className="block w-full max-w-[88%] rounded-[14px] border border-white/70 bg-white p-4 text-left shadow-xl shadow-black/25 transition-transform duration-300 ease-out hover:-translate-y-0.5 lg:-translate-x-1"
                >
                  <div
                    className="h-[118px] rounded-[10px] mb-3 flex items-center justify-center bg-gradient-to-r from-[#f58220] to-[#f9a64a]"
                  >
                    <Sparkles className="w-10 h-10 text-white" strokeWidth={1.75} />
                  </div>
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[15px] mb-1" style={{ color: brandNavy }}>
                    Food &amp; Wine
                  </p>
                  <p className="flex items-center gap-1.5 text-[13px]" style={{ color: MUTED_TEXT }}>
                    <Star className="w-3.5 h-3.5 shrink-0" /> Top Rated
                  </p>
                </button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* —— Statistics (full-width white band, reads as one strip with page) —— */}
      <section className="relative z-10 border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-14">
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <ScrollReveal key={index} className="flex flex-col items-center px-2 py-2 text-center md:py-4" delay={index * 0.07} y={20}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-[10px] bg-slate-100 mb-4">
                  <stat.icon className="w-6 h-6 text-accent" strokeWidth={2} />
                </div>
                <p className="font-['Inter:Bold',sans-serif] font-bold text-[26px] md:text-[30px] text-foreground mb-1">
                  {stat.value}
                </p>
                <p
                  className="font-['Inter:Medium',sans-serif] font-medium text-[13px] md:text-[14px]"
                  style={{ color: MUTED_TEXT }}
                >
                  {stat.label}
                </p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* —— Upcoming Events —— */}
      <section className="border-t border-slate-100 bg-muted px-4 py-14 md:py-20">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between" y={22}>
            <div>
              <h2 className="mb-2 font-['Inter:Bold',sans-serif] text-[30px] font-bold text-foreground md:text-[38px]">
                Upcoming Events
              </h2>
              <p className="font-['Inter:Regular',sans-serif] text-[16px] text-[#64748b]">
                Discover events happening near you
              </p>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center justify-center self-start rounded-[10px] border border-slate-200 bg-white px-5 py-2.5 font-['Inter:Semi_Bold',sans-serif] text-[14px] font-semibold text-foreground shadow-sm transition-colors duration-300 ease-out hover:border-slate-300 hover:bg-slate-50 lg:self-auto"
            >
              View All Events
            </Link>
          </ScrollReveal>

          <ScrollReveal className="mb-10 flex flex-wrap gap-2" delay={0.06} y={16}>
            {eventTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setEventFilter(tab.id)}
                className={`rounded-full px-4 py-2 font-['Inter:Medium',sans-serif] text-[13px] font-medium transition-colors duration-300 ease-out md:text-[14px] ${
                  eventFilter === tab.id
                    ? "bg-primary text-white shadow-md hover:bg-[#1e2936]"
                    : "border border-slate-200 bg-white text-[#475569] hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {filteredEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                showActions={false}
                animationIndex={index}
                reveal="scroll"
              />
            ))}
          </div>
        </div>
      </section>

      {/* —— Explore by Category —— */}
      <section className="border-t border-sky-100/80 bg-background px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal className="mb-12 text-center md:mb-14" y={24}>
            <h2 className="mb-3 font-['Inter:Bold',sans-serif] text-[30px] font-bold text-foreground md:text-[38px]">
              Explore by Category
            </h2>
            <p className="font-['Inter:Regular',sans-serif] text-[17px] text-[#64748b]">
              Find events that match your interests
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-6">
            {eventCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <ScrollReveal key={category.name} delay={index * 0.06} y={20}>
                <button
                  type="button"
                  onClick={handleProtectedAction}
                  className="flex w-full flex-col items-center rounded-[14px] border border-slate-100/80 bg-white p-5 text-center shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md md:p-6"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <Icon className="w-7 h-7" style={{ color: category.color }} strokeWidth={2} />
                  </div>
                  <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] md:text-[15px] text-foreground mb-1">
                    {category.name}
                  </span>
                  <span className="font-['Inter:Regular',sans-serif] text-[12px] text-[#64748b]">
                    {category.count} events
                  </span>
                </button>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* —— Everything You Need —— */}
      <section className="border-t border-slate-100 bg-white px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal className="mx-auto mb-12 max-w-2xl text-center md:mb-14" y={26}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5">
              <Zap className="h-4 w-4 text-accent" />
              <span className="font-['Inter:Medium',sans-serif] text-[13px] font-medium text-foreground">
                Powerful Features
              </span>
            </div>
            <h2 className="mb-4 font-['Inter:Bold',sans-serif] text-[30px] font-bold text-foreground md:text-[40px]">
              Everything You Need
            </h2>
            <p className="font-['Inter:Regular',sans-serif] text-[16px] leading-relaxed text-[#64748b] md:text-[17px]">
              Discover why ForSa is the preferred choice for event enthusiasts worldwide
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={index * 0.08} y={24}>
              <div
                className="rounded-[16px] border border-slate-100 bg-white p-7 shadow-sm transition-shadow duration-300 ease-out hover:shadow-md md:p-8"
              >
                <div
                  className="w-14 h-14 rounded-[14px] flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${feature.color}18` }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                </div>
                <h3 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[18px] text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="font-['Inter:Regular',sans-serif] text-[14px] leading-relaxed text-[#64748b]">
                  {feature.description}
                </p>
              </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* —— CTA (above footer): spotlight + #4C8ABB → #27374D, accent #EC9B3B —— */}
      <section
        className="relative overflow-hidden border-t border-white/10 px-4 py-20 md:py-28"
        style={{ background: CTA_SECTION_BG }}
      >
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <ScrollReveal y={22}>
          <h2 className="mb-4 font-['Inter:Bold',sans-serif] text-[30px] font-bold text-white md:text-[40px]">
            Ready to Start Your Journey?
          </h2>
          <p className="mx-auto mb-10 max-w-xl font-['Inter:Regular',sans-serif] text-[17px] text-[rgba(255,255,255,0.8)]">
            Join ForSa today and discover amazing events happening around you
          </p>
          <div className="mb-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-[12px] px-8 py-3.5 font-['Inter:Semi_Bold',sans-serif] text-[16px] font-semibold text-white shadow-lg transition-all duration-300 ease-in-out hover:brightness-110 hover:shadow-xl active:scale-[0.98]"
              style={{ backgroundColor: ACCENT_ORANGE }}
            >
              Register as Attendee
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/register?type=organization"
              className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[rgba(255,255,255,0.5)] bg-transparent px-8 py-3.5 font-['Inter:Semi_Bold',sans-serif] text-[16px] font-semibold text-white transition-all duration-300 ease-in-out hover:border-white/70 hover:bg-[rgba(255,255,255,0.12)] active:scale-[0.98]"
            >
              <Building2 className="h-5 w-5" />
              Register as Organization
            </Link>
            <Link
              to="/register?type=place_owner"
              className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[rgba(255,255,255,0.5)] bg-transparent px-8 py-3.5 font-['Inter:Semi_Bold',sans-serif] text-[16px] font-semibold text-white transition-all duration-300 ease-in-out hover:border-white/70 hover:bg-[rgba(255,255,255,0.12)] active:scale-[0.98]"
            >
              <MapPin className="h-5 w-5" />
              Register as Place Owner
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-[13px] md:text-[14px] text-[rgba(255,255,255,0.95)]">
            <span className="inline-flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-white" strokeWidth={2} />
              Free to join
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-white" strokeWidth={2} />
              Easy to use all the time
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-white" strokeWidth={2} />
              Cancel anytime
            </span>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* —— Footer (aligned with reference: logo + 2 link columns) —— */}
      <footer className="px-4 py-12 md:py-14" style={{ backgroundColor: brandNavy }}>
        <div className="mx-auto max-w-7xl text-white">
          <ScrollReveal className="mb-10 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12" y={18}>
            <div>
              <div className="mb-4">
                <ForSaLogo className="h-14 sm:h-16" />
              </div>
              <p className="font-['Inter:Regular',sans-serif] text-[14px] leading-relaxed max-w-sm">
                Discover and attend amazing events happening around you.
              </p>
            </div>
            <div>
              <h3 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[15px] mb-4">
                Company
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <span className="font-['Inter:Regular',sans-serif] text-[14px]">About Us</span>
                </li>
                <li>
                  <span className="font-['Inter:Regular',sans-serif] text-[14px]">Contact Support</span>
                </li>
                <li>
                  <span className="font-['Inter:Regular',sans-serif] text-[14px]">Terms of Service</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[15px] mb-4">
                Legal
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <span className="font-['Inter:Regular',sans-serif] text-[14px]">Privacy Policy</span>
                </li>
                <li>
                  <span className="font-['Inter:Regular',sans-serif] text-[14px]">Terms of Service</span>
                </li>
                <li>
                  <span className="font-['Inter:Regular',sans-serif] text-[14px]">Cookie Policy</span>
                </li>
              </ul>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1} y={12}>
          <div className="border-t border-white/20 pt-8 text-center">
            <p className="font-['Inter:Regular',sans-serif] text-[14px] text-white/90">
              © {new Date().getFullYear()} ForSa. All rights reserved.
            </p>
          </div>
          </ScrollReveal>
        </div>
      </footer>
    </div>
  );
}
