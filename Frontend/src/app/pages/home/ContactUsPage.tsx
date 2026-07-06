import { useState, type ChangeEvent, type FormEvent } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";
const CONTACT_EMAIL = "forsa.system@gmail.com";
const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

type ContactFormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const initialFormValues: ContactFormValues = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactUsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<ContactFormValues>(initialFormValues);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      toast.error("Contact form is not configured", {
        description: `Please email ${CONTACT_EMAIL} directly.`,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(EMAILJS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: SERVICE_ID,
          template_id: TEMPLATE_ID,
          user_id: PUBLIC_KEY,
          template_params: {
            from_name: formValues.name,
            from_email: formValues.email,
            reply_to: formValues.email,
            subject: formValues.subject,
            message: `
              <b>Full Name:</b> ${formValues.name}<br/>
              <b>Email Address:</b> ${formValues.email}<br/>
              <b>Subject:</b> ${formValues.subject}<br/><br/>
              <b>Message:</b><br/>
              ${formValues.message}
            `,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let detail = "Please try emailing directly at " + CONTACT_EMAIL + ".";

        try {
          const parsed = JSON.parse(errorText);
          if (parsed?.message) {
            detail = parsed.message;
          }
        } catch {
          if (errorText) {
            detail = errorText;
          }
        }

        throw new Error(detail);
      }

      toast.success("Message sent successfully!", {
        description: "Our team will get back to you shortly.",
      });
      setFormValues(initialFormValues);
      (e.currentTarget as HTMLFormElement).reset();
    } catch (error) {
      console.error("Contact form submission failed", error);
      toast.error("Failed to send message", {
        description:
          error instanceof Error && error.message
            ? error.message
            : `Please try emailing directly at ${CONTACT_EMAIL}.`,
      });
    } finally {
      setIsSubmitting(false);
    }
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
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-slate-500 text-sm mt-1 hover:text-[var(--brand-navy)] transition-colors underline-offset-2 hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-[var(--brand-navy)]">Call Us</h4>
                <p className="text-slate-500 text-sm mt-1">+201143777598</p>
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
                  <input
                    required
                    type="text"
                    name="name"
                    value={formValues.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[var(--brand-navy)] focus:ring-1 focus:ring-[var(--brand-navy)] bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Email Address</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formValues.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[var(--brand-navy)] focus:ring-1 focus:ring-[var(--brand-navy)] bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Subject</label>
                <input
                  required
                  type="text"
                  name="subject"
                  value={formValues.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[var(--brand-navy)] focus:ring-1 focus:ring-[var(--brand-navy)] bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Message</label>
                <textarea
                  required
                  rows={4}
                  name="message"
                  value={formValues.message}
                  onChange={handleChange}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[var(--brand-navy)] focus:ring-1 focus:ring-[var(--brand-navy)] bg-slate-50 focus:bg-white transition-colors resize-none"
                ></textarea>
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
