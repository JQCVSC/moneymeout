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

  const inputClasses = "w-full text-base transition-shadow focus:ring-2 focus:outline-none text-[var(--text-primary)] bg-white border border-[var(--border-color)] placeholder:text-[var(--text-secondary)] focus:ring-[var(--success-color)] focus:border-[var(--success-color)] rounded-lg py-3 px-4 disabled:bg-gray-100";

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
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Contact Us</h1>
      <p className="text-center text-gray-500 mb-6">Have a question or feedback? Let us know!</p>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="NAME" className="text-sm font-bold text-gray-600 block mb-2">Your Name</label>
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
            <label htmlFor="EMAIL" className="text-sm font-bold text-gray-600 block mb-2">Your Email</label>
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
          <label htmlFor="SUBJECT" className="text-sm font-bold text-gray-600 block mb-2">Subject</label>
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
          <label htmlFor="MESSAGE" className="text-sm font-bold text-gray-600 block mb-2">Message</label>
          <textarea
            id="MESSAGE"
            name="MESSAGE"
            rows={5}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--success-color)] focus:border-[var(--success-color)] transition text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] disabled:bg-gray-100"
            placeholder="Write your message here..."
            required
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full text-base font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none px-6 bg-[var(--success-color)] text-white hover:bg-[var(--success-hover-color)] focus:ring-[var(--success-color)] w-full py-3 text-lg"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </>
  );

  const renderSuccess = () => (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
        <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-800">Message Sent!</h1>
      <p className="text-gray-600 mt-2">Thanks for reaching out. We'll get back to you as soon as possible.</p>
      <button
        onClick={() => navigateTo(isAuthenticated ? 'dashboard' : 'search')}
        className="inline-flex items-center justify-center rounded-full font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 px-6 py-3 bg-[var(--success-color)] text-white hover:bg-[var(--success-hover-color)] focus:ring-[var(--success-color)] mt-6 w-full text-lg shadow-sm"
      >
        Back to Home
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <button
        onClick={() => navigateTo(isAuthenticated ? 'dashboard' : 'search')}
        className="fixed top-4 left-4 z-50 bg-white/70 backdrop-blur-sm p-2 rounded-full text-[var(--text-primary)] hover:bg-white shadow-md transition-all"
        aria-label="Go back"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>

      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
          {isSuccess ? renderSuccess() : renderForm()}
        </div>
      </div>
      <Footer navigateTo={navigateTo} />
    </div>
  );
};

export default ContactPage;