import React from "react";

export default function TermsAndConditions() {
  return (
    <main className="container mx-auto max-w-3xl px-6 py-12 bg-white rounded-xl shadow-lg mt-10 mb-10">
      <h1 className="text-4xl font-bold text-primary mb-8">Terms & Conditions</h1>

      <p className="text-base text-gray-700 leading-relaxed mb-6">
        Please read these terms and conditions carefully before using our website.
        By using IMF Grant Notepad (imfgrant.org), you agree to the following terms:
      </p>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-2">1.  Use of Service</h2>
        <p className="text-base text-gray-700 leading-relaxed">
          You may use the notepad service for personal, non-commercial purposes only. You agree not to use the service for any illegal or unauthorized purpose.
          You are responsible for complying with all local laws regarding online conduct and acceptable content.
        </p>
        
        <ul className="list-disc list-inside mt-2 text-gray-700">
          <li className="mb-2"> To identify your session (email only).</li>
          <li className="mb-2"> To store your notes securely</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-2">2. Data Responsibility</h2>
        <p className="text-base text-gray-700 leading-relaxed">
          You are solely responsible for the content you create and store in the notepad. We do not monitor or control the content and are not liable for any loss or damage resulting from your use of the service.
        </p>

        <ul className="list-disc list-inside mt-2 text-gray-700">
          <li className="mb-2"> We do not access or modify your note content.</li>
          <li className="mb-2"> Your data remains yours — we only store it securely on your behalf.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-2">3. Acceptable Use</h2>
        <p className="text-base text-gray-700 leading-relaxed">
          You agree <strong>not to use</strong> the service for:
        </p>
        <ul className="list-disc list-inside mt-2 text-gray-700">
          <li className="mb-2"> Storing or sharing illegal, harmful, or offensive content.</li>
          <li className="mb-2"> Violating intellectual property rights.</li>
          <li className="mb-2"> Attempting to disrupt or compromise the service.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-2">4. Service Availability</h2>
        <p className="text-base text-gray-700 leading-relaxed">
          We strive to keep the notepad service available at all times, but we do not guarantee uninterrupted access. We may suspend or terminate the service at any time without notice.
          We are not liable for any loss or damage resulting from service interruptions.
          We strive for 99% uptime but do not guarantee uninterrupted access.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-2">6. Termination</h2>
        <p className="text-base text-gray-700 leading-relaxed">
          We may suspend your access if you violate these terms..
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-2">7. Changes to Terms</h2>
        <p className="text-base text-gray-700 leading-relaxed">
          We reserve the right to update these terms at any time. Continued use of the site means you accept the new terms.
        </p>
      </section>

      <footer className="pt-8 border-t mt-8 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} IMF Grant. All rights reserved.
      </footer>
    </main>
  );
}