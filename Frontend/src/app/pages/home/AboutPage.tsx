import { motion } from "motion/react";
import { Info, Target, Users, Sparkles, MapPin } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-[#1E3D61] text-xs font-bold tracking-widest uppercase mb-4">
            Our Story
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-[#1E3D61] mb-6">
            Connecting People Through <br className="hidden md:block"/> Exceptional Events
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Forsa is the premier event discovery and booking platform built for the modern world. We believe that shared experiences have the power to transform lives and build stronger communities.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#1E3D61] mb-3">Our Mission</h3>
            <p className="text-slate-500 leading-relaxed">
              To make discovering and attending incredible events seamless and joyful. We're bridging the gap between passionate organizers and enthusiastic attendees.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#1E3D61] mb-3">Our Vision</h3>
            <p className="text-slate-500 leading-relaxed">
              To become the global hub for cultural, educational, and entertainment experiences, empowering everyone to find their perfect moment.
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#1E3D61] to-[#152D4A] rounded-3xl p-10 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
              <p className="text-white/80 max-w-md">Whether you are an attendee looking for your next adventure or an organizer ready to host, Forsa is your platform.</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                <Users className="w-5 h-5 text-blue-300" />
                <span className="font-bold">50k+ Users</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                <MapPin className="w-5 h-5 text-emerald-300" />
                <span className="font-bold">100+ Cities</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
