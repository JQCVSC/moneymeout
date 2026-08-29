import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Page } from '../App';
import { motion } from 'motion/react';

interface TermsPageProps {
  navigateTo: (page: Page) => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ navigateTo }) => {
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

            <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-gray-500 mb-10 italic">Last Updated: July 30, 2026</p>

            <div className="prose prose-emerald max-w-none text-gray-700 leading-relaxed space-y-8">
              <section>
                <p>Welcome to Money Me Out (https://www.moneymeout.com). These Terms of Service ("Terms") govern your use of our website and services (the "Service"). By accessing or using our Service, you agree to be bound by these Terms.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p>By accessing Money Me Out, you agree to these Terms. If you do not agree, you may not use the Service.</p>
                <p className="mt-2">Because Money Me Out utilizes YouTube API Services to operate, by using our Service, you also explicitly agree to be bound by the <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-medium">YouTube Terms of Service</a>.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                <p>Money Me Out provides a direct-to-bank monetization platform for YouTube creators. We verify creator identity via the YouTube API and facilitate monetary donations from fans to creators using third-party payment processors.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Financial Terms, Fees, and Payouts</h2>
                <ul className="list-disc pl-6 space-y-3">
                  <li><strong>Platform Fee:</strong> Money Me Out charges a 5% platform fee on all successful transactions. This fee is automatically deducted at the time of the transaction.</li>
                  <li><strong>Payment Processing Fees:</strong> Transactions are processed by Stripe. Standard Stripe processing fees (e.g., 2.9% + 30¢ per transaction in the US) apply and are deducted before the payout reaches the creator's balance.</li>
                  <li><strong>Stripe Connect:</strong> To receive funds, creators must successfully complete onboarding via Stripe Connect Express. You agree to comply with the <a href="https://stripe.com/connect-account/legal" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Stripe Connected Account Agreement</a>.</li>
                  <li><strong>Refunds & Chargebacks:</strong> Donations made to creators are generally non-refundable. Creators are solely responsible for any chargebacks, disputes, or fraudulent transactions initiated by their donors. Money Me Out reserves the right to deduct chargeback amounts and associated fees directly from a creator's balance.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Conduct</h2>
                <p className="mb-3">You agree not to use the Service to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Violate any applicable local, state, national, or international law, including anti-money laundering (AML) regulations.</li>
                  <li>Impersonate any person or entity, or falsely claim ownership of a YouTube channel you do not control.</li>
                  <li>Process transactions for the sale of illegal goods, adult content, or any services that violate Stripe's restricted business policies.</li>
                  <li>Interfere with or disrupt the integrity or performance of the Service, its security rules, or its database infrastructure.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Account Termination</h2>
                <p>We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms, is harmful to other users, or violates the policies of our third-party partners (Google, YouTube, or Stripe).</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Disclaimer of Warranties</h2>
                <p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Money Me Out makes no warranties, expressed or implied, regarding the reliability, accuracy, or availability of the Service, the YouTube API, or Stripe's payment infrastructure.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
                <p>To the maximum extent permitted by law, Money Me Out shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, resulting from your use of the Service, delays in payouts, or unauthorized access to your account.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to Terms</h2>
                <p>We may modify these Terms at any time. We will provide notice of significant changes by updating the date at the top of this page. Your continued use of the Service after changes are published constitutes your acceptance of the revised Terms.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact</h2>
                <p>For any questions regarding these Terms, please reach out via our <button onClick={() => navigateTo('contact')} className="text-emerald-600 hover:underline inline">contact form</button> or email support@moneymeout.com.</p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer navigateTo={navigateTo} />
    </div>
  );
};

export default TermsPage;
