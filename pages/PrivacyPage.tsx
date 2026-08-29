import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Page } from '../App';
import { motion } from 'motion/react';

interface PrivacyPageProps {
  navigateTo: (page: Page) => void;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ navigateTo }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header navigateTo={navigateTo} />
      
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12"
          >
            <div className="flex flex-wrap gap-4 mb-8">
              <button 
                onClick={() => navigateTo('search')}
                className="inline-flex items-center px-5 py-2.5 rounded-full bg-[var(--success-color)] text-white font-bold hover:bg-[var(--success-hover-color)] transition-all shadow-sm group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </button>
              <button 
                onClick={() => navigateTo('contact')}
                className="inline-flex items-center px-5 py-2.5 rounded-full bg-white text-[var(--success-color)] border-2 border-[var(--success-color)] font-bold hover:bg-emerald-50 transition-all shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Contact Form
              </button>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-gray-500 mb-10 italic">Last Updated: July 30, 2026</p>

            <div className="prose prose-emerald max-w-none text-gray-700 leading-relaxed space-y-8">
              <section>
                <p>Welcome to Money Me Out. Your privacy is critically important to us. This Privacy Policy explains how we collect, use, store, and share your information when you use our website (https://www.moneymeout.com) and our associated services (the "Service").</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Google and YouTube API Services</h2>
                <p>Money Me Out uses YouTube API Services to verify creator identity and fetch channel metadata. By using our Service, you agree to be bound by the <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-medium">YouTube Terms of Service</a>.</p>
                <p className="mt-2">For more information on how Google handles your data, please review the <a href="http://www.google.com/policies/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-medium">Google Privacy Policy</a>.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
                <p className="mb-3">We collect information to provide, secure, and improve our Service:</p>
                <ul className="list-disc pl-6 space-y-4">
                  <li><strong>Account & Authentication Data:</strong> When a creator claims their channel, we authenticate via Google OAuth. We collect your email address, Google User ID, and display name.</li>
                  <li><strong>YouTube Channel Data (API Data):</strong> Via the YouTube Data API, we access and store your public YouTube channel ID, handle, channel name, avatar URL, and banner URL.</li>
                  <li><strong>Financial Information:</strong> All payment processing, bank account linking, and KYC (Know Your Customer) identity verification are handled directly by our secure third-party payment processor, Stripe. Money Me Out does not store your full bank account numbers, credit card numbers, or government-issued IDs on our servers.</li>
                  <li><strong>Donation Data:</strong> We collect and store transaction records, including the donation amount, fan display name, custom message, and timestamp to display real-time notifications and dashboard analytics.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
                <p className="mb-3">We use your data strictly to operate our platform:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To verify that you are the legitimate owner of your YouTube channel.</li>
                  <li>To facilitate instant payouts and calculate platform fees.</li>
                  <li>To provide real-time dashboard notifications when a donation is received.</li>
                  <li>To provide customer support and respond to inquiries.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Share Your Information</h2>
                <p className="mb-4">We do not sell your personal data to third parties. We only share data with trusted third-party service providers necessary to operate the Service:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Stripe:</strong> For secure payment processing, identity verification, and payout routing. Please review <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Stripe's Privacy Policy</a>.</li>
                  <li><strong>Google Cloud/Firebase:</strong> For secure backend database hosting and authentication.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention and Deletion</h2>
                <p className="mb-3">We store your data only as long as your account is active or as needed to provide our services and comply with legal obligations (such as tax and anti-money laundering laws).</p>
                <p className="mb-3"><strong>Your Rights:</strong> You have the right to request the deletion of your account and associated personal data. To request data deletion, please contact us via our <button onClick={() => navigateTo('contact')} className="text-emerald-600 hover:underline">contact form</button> or email support@moneymeout.com.</p>
                <p>Additionally, you can revoke Money Me Out's access to your YouTube data at any time via your Google Account's <a href="https://security.google.com/settings/security/permissions" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Security Settings page</a>.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please reach out via our <button onClick={() => navigateTo('contact')} className="text-emerald-600 hover:underline inline">contact form</button> or email support@moneymeout.com.</p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer navigateTo={navigateTo} />
    </div>
  );
};

export default PrivacyPage;
