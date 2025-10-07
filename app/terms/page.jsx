import React from "react";

export default function TermsAndConditions() {
  return (
    <main className="container mx-auto max-w-3xl px-6 py-12 bg-white rounded-xl shadow-lg mt-10 mb-10">
      <h1 className="text-4xl font-bold text-primary mb-8">Terms & Conditions for IMF Grant</h1>

      <p className="text-base text-gray-700 leading-relaxed mb-6">
        Please read these terms and conditions carefully before using our website.
      </p>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-2">1. Introduction</h2>
        <p className="text-base text-gray-700 leading-relaxed">
          Welcome to IMF Grant. By accessing or using our website, you agree to comply with and be bound by these Terms & Conditions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-2">Interpretation and Definitions</h2>
        <h2 className="text-2xl font-semibold text-primary mb-2">2. Interpretation</h2>
        <p className="text-base text-gray-700 leading-relaxed">
            The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-2">3. Definitions</h2>
        <p className="text-base text-gray-700 leading-relaxed">
          For the purposes of these Terms & Conditions:
        </p>
        <ul className="list-disc list-inside mt-2 text-gray-700">
          <li className="mb-2"><strong>Affiliate</strong> means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</li>
          <li className="mb-2"><strong>Country</strong> refers to: New York, United States</li>
          <li className="mb-2"><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to IMF Grant.</li>
          <li className="mb-2"><strong>Device</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</li>
          <li className="mb-2"><strong>Service</strong> refers to the Website.</li>
          <li className="mb-2"><strong>Terms and Conditions</strong> (also referred as "Terms") mean these Terms and Conditions that form the entire agreement between You and the Company regarding the use of the Service.</li>
          <li className="mb-2"><strong>Third-party Social Media Service</strong> means any services or content (including data, information, products or services) provided by a third-party that may be displayed, included or made available by the Service.</li>
          <li className="mb-2"><strong>Website</strong> refers to IMF Grant, accessible from <a href="https://imfgrant.com" className="text-blue-500 underline">https://imfgrant.com</a></li>
          <li className="mb-2"><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-2">4. Acknowledgment</h2>
        <p className="text-base text-gray-700 leading-relaxed">
          These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.

          Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.

          By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.

          You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.

          Your access to and use of the Service is also conditioned on Your acceptance of and compliance with the Privacy Policy of the Company. Our Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your personal information when You use the Application or the Website and tells You about Your privacy rights and how the law protects You. Please read Our Privacy Policy carefully before using Our Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-2">5. Links to Other Websites</h2>
        <p className="text-base text-gray-700 leading-relaxed">
          Our Service may contain links to third-party web sites or services that are not owned or controlled by the Company.

          The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such web sites or services.

          We strongly advise You to read the terms and conditions and privacy policies of any third-party web sites or services that You visit.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-2">6. Termination</h2>
        <p className="text-base text-gray-700 leading-relaxed">
          The Company may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.

          Upon termination, Your right to use the Service will cease immediately. If You wish to terminate Your account, You may simply discontinue using the Service..
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