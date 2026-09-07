import React from 'react';
import { Page } from '../App';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/ui/Logo';
import Footer from '../components/layout/Footer';

interface ContactPageProps {
  navigateTo: (page: Page) => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ navigateTo }) => {
  const { user, isAuthenticated } = useAuth();
  
  // The success state can be triggered by a URL parameter, e.g., your-site.com/contact?success=true
  // Configure your form provider (like Brevo) to redirect to this URL upon successful submission.
  const [isSuccess, setIsSuccess] = React.useState(() => {
    if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('success') === 'true';
    }
    return false;
  });

    const inputClasses = "w-full text-base transition-all focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 text-white bg-slate-900/90 border border-white/10 placeholder:text-slate-500 rounded-xl py-3 px-4 outline-none disabled:bg-slate-800/50";

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('NAME'),
      email: formData.get('EMAIL'),
      subject: formData.get('SUBJECT'),
      message: formData.get('MESSAGE'),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setIsSuccess(true);
    } catch (err) {
      setError('Something went wrong. Please try again later.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderForm = () => (
    <>
      <h1 className="text-2xl md:text-3xl font-black text-center text-white mb-2 tracking-tight">Contact Us</h1>
      <p className="text-center text-slate-400 mb-6 text-sm">Have a question or feedback? Let us know!</p>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="NAME" className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">Your Name</label>
            <input
              id="NAME"
              name="NAME"
              type="text"
              defaultValue={user?.name || ''}
              placeholder="Your Name"
              required
              disabled={!!(isAuthenticated && user?.name) || isSubmitting}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="EMAIL" className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">Your Email</label>
            <input
              id="EMAIL"
              name="EMAIL"
              type="email"
              defaultValue={user?.email || ''}
              placeholder="you@example.com"
              required
              disabled={!!(isAuthenticated && user?.email) || isSubmitting}
              className={inputClasses}
            />
          </div>
        </div>
        <div>
          <label htmlFor="SUBJECT" className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">Subject</label>
          <input
            id="SUBJECT"
            name="SUBJECT"
            type="text"
            placeholder="e.g. Feedback on the app"
            required
            disabled={isSubmitting}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="MESSAGE" className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">Message</label>
          <textarea
            id="MESSAGE"
            name="MESSAGE"
            rows={5}
            className="w-full p-4 border border-white/10 bg-slate-900/90 rounded-xl focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition text-base text-white placeholder:text-slate-500 outline-none"
            placeholder="Write your message here..."
            required
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-xl text-lg font-black transition-all active:scale-95 px-6 bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 w-full py-4 cursor-pointer"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </>
  );

  const renderSuccess = () => (
    <div className="text-center py-6">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-6 shadow-lg">
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h1 className="text-2xl md:text-3xl font-black text-white">Message Sent!</h1>
      <p className="text-slate-400 mt-2 text-base">Thanks for reaching out. We'll get back to you as soon as possible.</p>
      <button
        onClick={() => navigateTo(isAuthenticated ? 'dashboard' : 'search')}
        className="inline-flex items-center justify-center rounded-xl font-black transition-all active:scale-95 px-6 py-3.5 bg-emerald-500 text-black hover:bg-emerald-400 mt-8 w-full text-base shadow-lg shadow-emerald-500/20 cursor-pointer"
      >
        Back to Home
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#090d16] text-white p-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <button
        onClick={() => navigateTo(isAuthenticated ? 'dashboard' : 'search')}
        className="fixed top-5 left-5 z-50 bg-[#101626]/80 backdrop-blur-md p-3 rounded-full text-slate-200 hover:text-white border border-white/10 hover:border-white/20 shadow-xl transition-all hover:scale-105"
        aria-label="Go back"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>

      <div className="w-full max-w-lg relative z-10">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <div className="glass-panel p-8 md:p-10 rounded-3xl shadow-2xl border border-white/10">
          {isSuccess ? renderSuccess() : renderForm()}
        </div>
      </div>
      <Footer navigateTo={navigateTo} />
    </div>
  );
};

export default ContactPage;