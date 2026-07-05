import { useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

export default function ContactUsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock successful submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Message sent successfully!", {
        description: "Our team will get back to you shortly.",
      });
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[var(--brand-page-background)] pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-[var(--brand-navy)] text-xs font-bold tracking-widest uppercase mb-4">
            Get In Touch
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--brand-navy)] mb-6">
            Contact Our Team
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Have questions about Forsa, need support with your booking, or want to partner with us? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-[var(--brand-navy)]">Email Us</h4>
                <p className="text-slate-500 text-sm mt-1">support@forsa.com</p>
                <p className="text-slate-500 text-sm">partnerships@forsa.com</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-[var(--brand-navy)]">Call Us</h4>
                <p className="text-slate-500 text-sm mt-1">+1 (555) 123-4567</p>
                <p className="text-slate-400 text-xs mt-1">Mon-Fri, 9am-6pm EST</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-[var(--brand-navy)]">Headquarters</h4>
                <p className="text-slate-500 text-sm mt-1">123 Forsa Innovation Blvd.<br/>Tech District, NY 10001</p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <h3 className="text-2xl font-bold text-[var(--brand-navy)] mb-6 relative z-10">Send us a message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Full Name</label>
                  <input required type="text" placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[var(--brand-navy)] focus:ring-1 focus:ring-[var(--brand-navy)] bg-slate-50 focus:bg-white transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Email Address</label>
                  <input required type="email" placeholder="john@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[var(--brand-navy)] focus:ring-1 focus:ring-[var(--brand-navy)] bg-slate-50 focus:bg-white transition-colors" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Subject</label>
                <input required type="text" placeholder="How can we help?" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[var(--brand-navy)] focus:ring-1 focus:ring-[var(--brand-navy)] bg-slate-50 focus:bg-white transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Message</label>
                <textarea required rows={4} placeholder="Type your message here..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[var(--brand-navy)] focus:ring-1 focus:ring-[var(--brand-navy)] bg-slate-50 focus:bg-white transition-colors resize-none"></textarea>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-[var(--brand-navy)] text-white font-bold text-lg hover:bg-[var(--brand-navy-hover)] hover:shadow-lg hover:shadow-[var(--brand-navy)]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? "Sending..." : <>Send Message <Send className="w-5 h-5" /></>}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
