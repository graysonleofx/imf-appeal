import React from "react";

export default function TermsAndConditions() {
  return (
    <main className="container mx-auto max-w-3xl px-6 py-12 bg-white rounded-xl shadow-lg mt-10 mb-10">
      <h1 className="text-4xl font-bold text-primary mb-8">Privacy Policy </h1>

      <p className="text-base text-gray-700 leading-relaxed mb-6">
         At IMF Grant Notepad (imfgrant.org), your privacy is important to us. This policy explains how we collect, use, and protect your information.
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-2">1. What We Collect</h2>
        <p className="text-base text-gray-700 leading-relaxed">
          <strong>Google Account Info:</strong> We collect your email address upon signing in with Google to personalize your experience.
          <br />
          <strong>User Notes:</strong>The content you write in the notepad is stored securely and privately.
          <strong>No Ads or Tracking:</strong>We do not serve ads, track your behavior, or sell your data.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-2">2. How We Use Your Info</h2>
        <p className="text-base text-gray-700 leading-relaxed">
          For the purposes of these Terms & Conditions:
        </p>
        <ul className="list-disc list-inside mt-2 text-gray-700">
          <li className="mb-2"> To identify your session (email only).</li>
          <li className="mb-2"> To store your notes securely</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-2">3. Data Storage</h2>
        <p className="text-base text-gray-700 leading-relaxed">
          Your notes are stored securely in the cloud (Google Drive or equivalent), accessible only by you.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-2">4. Third-Party Access</h2>
        <p className="text-base text-gray-700 leading-relaxed">
          We do not share your information with any third parties.
          We use trusted third-party services (like Google for authentication) solely to facilitate your login process.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-2">5. Security</h2>
        <p className="text-base text-gray-700 leading-relaxed">
          We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure. We use standard encryption and Google’s secure OAuth system for authentication.
        </p>
      </section>


      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-2">6. Changes to Terms</h2>
        <p className="text-base text-gray-700 leading-relaxed">
          We reserve the right to update these terms at any time. Continued use of the site means you accept the new terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-2">8. Contact Us</h2>
        <p className="text-base text-gray-700 leading-relaxed">
          If you have any questions about these Terms & Conditions, please contact us at support@imfgrant.org
        </p>
      </section>

      <footer className="pt-8 border-t mt-8 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} IMF Grant. All rights reserved.
      </footer>
    </main>
  );
}